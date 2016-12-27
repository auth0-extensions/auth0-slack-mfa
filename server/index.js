import morgan from 'morgan';
import Express from 'express';
import bodyParser from 'body-parser';
import { middlewares } from 'auth0-extension-express-tools';
import logger from './lib/logger';
import config from './lib/config';
import meta from './routes/meta';
import hooks from './routes/hooks';
import cancel from './routes/cancel';
import enroll from './routes/enroll';
import mfa from './routes/mfa';
import verify from './routes/verify';

module.exports = (configProvider) => {
  config.setProvider(configProvider);

  const app = new Express();
  app.use(morgan(':method :url :status :response-time ms - :res[content-length]', {
    stream: logger.stream
  }));

  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: false }));

  // Configure routes.
  app.use('/meta', meta());
  app.use('/.extensions', hooks());
  app.use('/', [ cancel, enroll, mfa, verify ]);

  // Generic error handler.
  app.use(middlewares.errorHandler(logger.error));
  return app;
};
