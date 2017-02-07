import ejs from 'ejs';
import express from 'express';
import uuid from 'uuid';
import { middlewares } from 'auth0-extension-express-tools';
import config from '../lib/config';
import logger from '../lib/logger';
import token from '../lib/token';
import view from '../views/enroll';

const router = express();

function getEnroll(req, res) {
  const signingSecret = config('EXTENSION_SECRET');
  const connectionString = config('MONGO_CONNECTION_STRING');
  const secret = new Buffer(signingSecret, 'base64');

  let decodedToken;

  token.verify(req.query.token, secret, connectionString)
  .then((decoded) => {
    decodedToken = decoded;
    return token.revoke(decodedToken, connectionString);
  })
  .then(() => createToken(secret, decodedToken.sub, decodedToken.aud, decodedToken.slack_username, connectionString))
  .then((signedToken) => {
    res.end(ejs.render(view(), {
      state: req.query.state,
      token: signedToken,
      slack_username: decodedToken.slack_username
    }));
  })
  .catch((err) => {
    logger.debug('Error requesting enrollment information.');
    logger.error(err);
    res.status(500).send('Error.').end();
  });
}

function postEnroll(req, res) {
  const signingSecret = config('EXTENSION_SECRET');
  const connectionString = config('MONGO_CONNECTION_STRING');
  const secret = new Buffer(signingSecret, 'base64');

  let decodedToken;

  token.verify(req.body.token, secret, connectionString)
  .then((decoded) => {
    if (decoded.slack_enrolled) { throw new Error('The user has already enrolled.'); }

    decodedToken = decoded;
    return token.revoke(decodedToken, connectionString);
  })
  .then(() => {
    const userId = decodedToken.sub;
    const payload = { user_metadata: { slack_mfa_username: decodedToken.slack_username, slack_mfa_enrolled: false } };
    
    return req.auth0.users.update({ id: userId }, payload);
  })
  .then(() => createToken(secret, decodedToken.sub, decodedToken.aud, req.body.slack_username, connectionString))
  .then((signedToken) => {
    res.writeHead(302, { Location: `mfa?token=${signedToken}&state=${req.body.state}` });
    res.end();
  })
  .catch((err) => {
    logger.debug('Error enrolling user with Slack MFA.');
    logger.error(err);
    res.status(500).send('Error.').end();
  });
}

function createToken(secret, sub, aud, slackUsername, connectionString) {
  const options = { expiresIn: '5m' };
  const payload = {
    sub,
    aud,
    jti: uuid.v4(),
    iat: new Date().getTime() / 1000,
    issuer: 'urn:sgmeyer:slack:mfa',
    slack_username: slackUsername,
    slack_enrolled: false
  };

  return token.issue(payload, secret, options, connectionString);
}

router.use(middlewares.managementApiClient({
  domain: config('AUTH0_DOMAIN'),
  clientId: config('AUTH0_CLIENT_ID'),
  clientSecret: config('AUTH0_CLIENT_SECRET')
}));

router.get('/enroll', getEnroll);
router.post('/enroll', postEnroll);

module.exports = router;
