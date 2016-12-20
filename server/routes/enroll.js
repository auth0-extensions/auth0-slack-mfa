var express = require('express');
var uuid = require('uuid');
var token = require('../lib/token');
var view = require('../views/enroll');
import config from '../lib/config';
var router = express();

function getEnroll(req, res) {
  var client_secret = config('SIGNING_SECRET');
  var connectionString = config('MONGO_CONNECTION_STRING');
  var secret = new Buffer(client_secret, 'base64');

  var decodedToken;

  token.verify(req.query.token, secret, connectionString).then(function (decoded) {
    decodedToken = decoded;
    return token.revoke(decodedToken, connectionString);
  }).then(function () {
    return createToken(secret, decodedToken.sub, decodedToken.aud, decodedToken.slack_username, connectionString);
  }).then(function (signedToken) {
    res.end(require('ejs').render(view(), {
      state: req.query.state,
      token: signedToken,
      slack_username: decodedToken.slack_username
    }));
  }).catch(function (err) {
    console.log(err);
    res.status(500).send('Error.').end();
  });
}

function postEnroll(req, res) {
  var client_secret = config('SIGNING_SECRET');
  var connectionString = config('MONGO_CONNECTION_STRING');
  var secret = new Buffer(client_secret, 'base64');

  var decodedToken;

  token.verify(req.body.token, secret, connectionString).then(function (decoded) {
    if (decoded.slack_enrolled) { throw new Error('The user has already enrolled.') }

    decodedToken = decoded;
    return token.revoke(decodedToken, connectionString);
  }).then(function () {
    var userId = decodedToken.sub
    var payload = { user_metadata: { slack_mfa_username: options.slack_username, slack_mfa_enrolled: false } };
    return req.auth0.users.update({ id: userId }, payload);
  }).then(function () {
    return createToken(secret, decodedToken.sub, decodedToken.aud, req.body.slack_username, connectionString);
  }).then(function (signedToken) {
    res.writeHead(302, {Location: 'mfa?token=' + signedToken + '&state=' + req.body.state});
    res.end();
  }).catch(function (err) {
    console.log(err + '\r\n' + err.stack);
    res.status(500).send('Error.').end();
  });
}

function createToken(secret, sub, aud, slack_username, connectionString) {
  var options = { expiresIn: '5m' };
  var payload = {
    sub: sub,
    aud: aud,
    jti: uuid.v4(),
    iat: new Date().getTime() / 1000,
    issuer: 'urn:sgmeyer:slack:mfa',
    slack_username: slack_username,
    slack_enrolled: false
  };

  return token.issue(payload, secret, options, connectionString);
}

router.get('/enroll', getEnroll);
router.post('/enroll', postEnroll);

module.exports = router;
