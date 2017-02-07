import ejs from 'ejs';
import config from './config';
import rule from './rules/slack-mfa-rule';

export default () =>
  ejs.render(rule, {
    clientSecret: config('EXTENSION_SECRET'),
    extensionUrl: config('PUBLIC_WT_URL').replace(/\/$/g, ''),
    mongoConnectionString: config('MONGO_CONNECTION_STRING'),
    updateTime: () => new Date().toISOString()
  });
