import path from 'path';
import morgan from 'morgan';
import Express from 'express';
import bodyParser from 'body-parser';
import { middlewares, routes } from 'auth0-extension-express-tools';
import logger from './lib/logger';
import config from './lib/config';
import meta from './routes/meta';
import hooks from './routes/hooks';
import cancel from './routes/cancel';
import enroll from './routes/enroll';
import html from './routes/html';
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

  app.use(routes.dashboardAdmins({
    stateKey: 'slack-mfa-state',
    secret: config('EXTENSION_SECRET'),
    audience: 'urn:slack-mfa',
    rta: config('AUTH0_RTA').replace('https://', ''),
    domain: config('AUTH0_DOMAIN'),
    baseUrl: config('PUBLIC_WT_URL'),
    clientName: 'Slack MFA Extension',
    urlPrefix: '/admins',
    sessionStorageKey: 'slack-mfa:apiToken',
    scopes: 'read:clients read:resource_servers'
  }));

  // Configure routes.
  app.use('/xyz', [ cancel, enroll, mfa, verify ]);
  app.use('/meta', meta());
  app.use('/.extensions', hooks());
  app.use('/app', Express.static(path.join(__dirname, '../dist')));
  app.use('*', html());

  // Generic error handler.
  app.use(middlewares.errorHandler(logger.error));
  return app;
};
