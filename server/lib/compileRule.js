import ejs from 'ejs';
import config from './config';
import rule from './rules/slack-mfa-rule';

export default () =>
  ejs.render(rule, {
    clientId: config('AUTH0_CLIENT_ID'),
    clientSecret: config('AUTH0_CLIENT_SECRET'),
    auth0Domain: config('AUTH0_DOMAIN'),
    extensionUrl: config('PUBLIC_WT_URL').replace(/\/$/g, ''),
    mongoConnectionString: config('MONGO_CONNECTION_STRING'),
    signingSecret: config('EXTENSION_SECRET'),
    updateTime: () => new Date().toISOString()
  });
