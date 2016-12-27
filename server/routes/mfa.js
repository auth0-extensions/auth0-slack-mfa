import express from 'express';
import uuid from 'uuid';
import config from '../lib/config';
import slack from '../lib/slack';
import token from '../lib/token';
import view from '../views/mfa';

const router = express();

function getMfa(req, res) {
  const slackApiToken = config('SLACK_API_TOKEN');
  const clientSecret = config('SIGNING_SECRET');
  const connectionString = config('MONGO_CONNECTION_STRING');
  const secret = new Buffer(clientSecret, 'base64');

  let decodedToken;
  let signedToken;

  token.verify(req.query.token, secret, connectionString).then(function (decoded) {
    if (!decoded.slack_username) { throw new Error('JWT does not contain a slack_mfa_username'); }

    decodedToken = decoded;
    return token.revoke(decoded, connectionString);
  }).then(function () {
     return createMfaToken(secret, decodedToken.sub, decodedToken.aud, connectionString);
  }).then(function (mfaToken) {
    signedToken = mfaToken;
    let baseUrl = process.env.URL || 'https://' + req.x_wt.container + '.us.webtask.io/' + req.x_wt.jtn;
    let slackOptions = {
      verifyUrl: baseUrl + '/verify?token=' + signedToken +'&state=' + req.query.state,
      cancelUrl: baseUrl + '/cancel?token=' + signedToken,
      username: decodedToken.slack_username.toLowerCase().trim(),
      token: slackApiToken
    };

    return slack.sendDM(slackOptions);
  }).then(function() {
    res.end(require('ejs').render(view(), {
      token: signedToken,
      slack_username: decodedToken.slack_username,
      slack_enrolled: decodedToken.slack_enrolled
    }));
  }).catch(function (err) {
    console.log(err + '\r\n' + err.stack);
    res.status(500).send('Error.').end();
  });
}

function createMfaToken(secret, sub, aud, connectionString) {
  let options = { expiresIn: '5m' };
  let payload = {
    sub: sub,
    aud: aud,
    jti: uuid.v4(),
    iat: new Date().getTime() / 1000,
    iss: 'urn:sgmeyer:slack:mfaverify'
  };

  return token.issue(payload, secret, options, connectionString);
}

router.get('/mfa', getMfa);

module.exports = router;
