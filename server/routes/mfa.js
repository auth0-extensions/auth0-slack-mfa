import ejs from 'ejs';
import { Router as router } from 'express';
import uuid from 'uuid';
import config from '../lib/config';
import logger from '../lib/logger';
import slack from '../lib/slack';
import token from '../lib/token';
import view from '../views/mfa';

export default () => {
  const mfa = router();

  function getMfa(req, res) {
    const slackApiToken = config('SLACK_API_TOKEN');
    const signingSecret = config('EXTENSION_SECRET');
    const connectionString = config('MONGO_CONNECTION_STRING');
    const secret = new Buffer(signingSecret, 'base64');

    let decodedToken;
    let signedToken;

    token.verify(req.query.token, secret, connectionString)
    .then((decoded) => {
      if (!decoded.slack_username) { throw new Error('JWT does not contain a slack_mfa_username'); }

      decodedToken = decoded;
      return token.revoke(decoded, connectionString);
    })
    .then(() => createMfaToken(secret, decodedToken, connectionString))
    .then((mfaToken) => {
      signedToken = mfaToken;
      const baseUrl = process.env.URL || `https://${req.x_wt.container}.us.webtask.io/${req.x_wt.jtn}`;
      const slackOptions = {
        verifyUrl: `${baseUrl}/mfa/verify?token=${signedToken}&state=${req.query.state}`,
        cancelUrl: `${baseUrl}/mfa/cancel?token=${signedToken}`,
        username: decodedToken.slack_username.toLowerCase().trim(),
        token: slackApiToken
      };
      console.log(JSON.stringify(slackOptions, null, 2));
      return slack.sendDM(slackOptions);
    })
    .then(() => {
      res.end(ejs.render(view(), {
        token: signedToken,
        slack_username: decodedToken.slack_username,
        slack_enrolled: decodedToken.slack_enrolled
      }));
    })
    .catch((err) => {
      logger.debug('Error sending Slack MFA challenge.');
      logger.error(err);
      res.status(500).send('Error.').end();
    });
  }

  function createMfaToken(secret, decodedToken, connectionString) {
    const options = { expiresIn: '5m' };
    const payload = {
      sub: decodedToken.sub,
      aud: decodedToken.aud,
      jti: uuid.v4(),
      iat: new Date().getTime() / 1000,
      iss: 'urn:sgmeyer:slack:mfaverify',
      slack_username: decoded.slack_username,
      slack_enrolled: decoded.slack_enrolled
    };

    return token.issue(payload, secret, options, connectionString);
  }

  mfa.get('/mfa', getMfa);

  return mfa;
}