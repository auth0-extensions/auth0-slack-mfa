var express = require('express');
var uuid = require('uuid');
var token = require('../lib/token');
import { middlewares } from 'auth0-extension-express-tools';
var router = express();
import config from '../lib/config';

function getVerify(req, res) {
  var client_secret = config('SIGNING_SECRET');
  var connectionString = config('MONGO_CONNECTION_STRING');
  var secret = new Buffer(client_secret, 'base64');
  
  var decodedToken;

  token.verify(req.query.token, secret, connectionString).then(function (decoded) {
    if (decoded.iss !== 'urn:sgmeyer:slack:mfaverify') {
      throw new Error('Invalid issuer.');
    }

    decodedToken = decoded;
    return token.revoke(decodedToken, connectionString);
  }).then(function () {
    var userId = decodedToken.sub
    return req.auth0.users.update({ id: userId }, { user_metadata: { slack_mfa_enrolled: true } });
  }).then(function () {
    return createCallbackToken(secret, decodedToken.sub, decodedToken.aud, connectionString);
  }).then(function (signedToken) {
    var callbackDomain = config('AUTH0_DOMAIN')
    res.writeHead(302, { Location: 'https://' + callbackDomain + '/continue?token=' + signedToken + '&state=' + req.query.state });
    res.end();
  }).catch(function (err) {
    console.log(err);
    return res.status(500).send('Error.').end();
  });
}

function createCallbackToken(secret, sub, aud, connectionString) {
  var options = { expiresIn: '1m' };
  var payload = {
    sub: sub,
    aud: aud,
    jti: uuid.v4(),
    iat: new Date().getTime() / 1000,
    iss: 'urn:sgmeyer:slack:mfacallback'
  };

  return token.issue(payload, secret, options, connectionString);
}

router.use(middlewares.managementApiClient({
  domain: config('AUTH0_DOMAIN'),
  clientId: config('AUTH0_CLIENT_ID'),
  clientSecret: config('AUTH0_CLIENT_SECRET')
}));

router.get('/verify', getVerify);

module.exports = router;
