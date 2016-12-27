import express from 'express';
import uuid from 'uuid';
import config from '../lib/config';
import token from '../lib/token';
import view from'../views/enroll';

const router = express();

function getEnroll(req, res) {
  const clientSecret = config('SIGNING_SECRET');
  const connectionString = config('MONGO_CONNECTION_STRING');
  const secret = new Buffer(clientSecret, 'base64');

  let decodedToken;

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
  const clientSecret = config('SIGNING_SECRET');
  const connectionString = config('MONGO_CONNECTION_STRING');
  const secret = new Buffer(clientSecret, 'base64');

  let decodedToken;

  token.verify(req.body.token, secret, connectionString).then(function (decoded) {
    if (decoded.slack_enrolled) { throw new Error('The user has already enrolled.') }

    decodedToken = decoded;
    return token.revoke(decodedToken, connectionString);
  }).then(function () {
    const userId = decodedToken.sub
    const payload = { user_metadata: { slack_mfa_username: options.slack_username, slack_mfa_enrolled: false } };
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
  let options = { expiresIn: '5m' };
  let payload = {
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
