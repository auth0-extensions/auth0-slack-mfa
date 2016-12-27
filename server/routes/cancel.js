import ejs from 'ejs';
import express from 'express';
import config from '../lib/config';
import logger from '../lib/logger';
import token from '../lib/token';
import view from '../views/cancel';

const router = express();

function getCancel(req, res) {
  const clientSecret = config('SIGNING_SECRET');
  const connectionString = config('MONGO_CONNECTION_STRING');
  const secret = new Buffer(clientSecret, 'base64');

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

router.get('/cancel', getCancel);

module.exports = router;
