import ejs from 'ejs';
import config from './config';
import rule from './rules/slack-mfa-rule';

export default () =>
  ejs.render(rule, {
    extensionUrl: config('PUBLIC_WT_URL').replace(/\/$/g, ''),
    mongoConnectionString: config('MONGO_CONNECTION_STRING'),
    signingSecret: config('EXTENSION_SECRET'),
    updateTime: () => new Date().toISOString()
  });
