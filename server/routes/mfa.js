var express = require('express');
var token = require('../lib/token')
var uuid = require('uuid');
var slack = require('../lib/slack');
var view = require('../views/mfa');
var router = express();

function getMfa(req, res) {
  var slack_api_token = config('SLACK_API_TOKEN');
  var client_secret = config('SIGNING_SECRET');
  var connectionString = config('MONGO_CONNECTION_STRING');
  var secret = new Buffer(client_secret, 'base64');

  var decodedToken;
  var signedToken;

  token.verify(req.query.token, secret, connectionString).then(function (decoded) {
    if (!decoded.slack_username) { throw new Error('JWT does not contain a slack_mfa_username'); }

    decodedToken = decoded;
    return token.revoke(decoded, connectionString);
  }).then(function () {
     return createMfaToken(secret, decodedToken.sub, decodedToken.aud, connectionString);
  }).then(function (mfaToken) {
    signedToken = mfaToken;
    var baseUrl = process.env.URL || 'https://' + req.x_wt.container + '.us.webtask.io/' + req.x_wt.jtn;
    var slackOptions = {
      verifyUrl: baseUrl + '/verify?token=' + signedToken +'&state=' + req.query.state,
      cancelUrl: baseUrl + '/cancel?token=' + signedToken,
      username: decodedToken.slack_username.toLowerCase().trim(),
      token: slack_api_token
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
  var options = { expiresIn: '5m'};
  var payload = {
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
