import ejs from 'ejs';
import { Router as router } from 'express';
import config from '../lib/config';
import logger from '../lib/logger';
import token from '../lib/token';
import view from '../views/cancel';

export default () => {

  const cancel = router();

  function getCancel(req, res) {
    const signingSecret = config('EXTENSION_SECRET');
    const connectionString = config('MONGO_CONNECTION_STRING');
    const secret = new Buffer(signingSecret, 'base64');

    token.verify(req.query.token, secret, connectionString)
    .then((decoded) => token.revoke(decoded, connectionString))
    .then(() => {
      res.end(ejs.render(view()));
      res.end();
    })
    .catch((err) => {
      logger.debug('Error canceling JWT token.');
      logger.error(err);
      res.status(500).send('Error.').end();
    });
  }

  cancel.get('/cancel', getCancel);

  return cancel;
}
