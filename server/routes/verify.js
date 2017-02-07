import { Router as router } from 'express';
import uuid from 'uuid';
import { middlewares } from 'auth0-extension-express-tools';
import config from '../lib/config';
import logger from '../lib/logger';
import token from '../lib/token';

export default () => {
  const verify = router();
  function getVerify(req, res) {
    const signingSecret = config('EXTENSION_SECRET');
    const connectionString = config('MONGO_CONNECTION_STRING');
    const secret = new Buffer(signingSecret, 'base64');
    let decodedToken;

    token.verify(req.query.token, secret, connectionString).then((decoded) => {
      if (decoded.iss !== 'urn:sgmeyer:slack:mfaverify') {
        throw new Error('Invalid issuer.');
      }

      decodedToken = decoded;
      return token.revoke(decodedToken, connectionString);
    })
    .then(() => {
      const userId = decodedToken.sub;
      return req.auth0.users.update({ id: userId }, { user_metadata: { slack_mfa_enrolled: true } });
    })
    .then(() => (createCallbackToken(secret, decodedToken.sub, decodedToken.aud, connectionString)))
    .then((signedToken) => {
      const callbackDomain = config('AUTH0_DOMAIN');
      res.writeHead(302, { Location: `https://${callbackDomain}/continue?token=${signedToken}&state=${req.query.state}` });
      res.end();
    })
    .catch((err) => {
      logger.debug('Error verifying Slack MFA challenge.');
      logger.error(err);
      return res.status(500).send('Error.').end();
    });
  }

  function createCallbackToken(secret, sub, aud, connectionString) {
    const options = { expiresIn: '1m' };
    const payload = {
      sub,
      aud,
      jti: uuid.v4(),
      iat: new Date().getTime() / 1000,
      iss: 'urn:sgmeyer:slack:mfacallback'
    };

    return token.issue(payload, secret, options, connectionString);
  }

  verify.use(middlewares.managementApiClient({
    domain: config('AUTH0_DOMAIN'),
    clientId: config('AUTH0_CLIENT_ID'),
    clientSecret: config('AUTH0_CLIENT_SECRET')
  }));

  verify.get('/verify', getVerify);
};
