import ejs from 'ejs';
import config from './config';
import rule from './rules/slack-mfa-rule';

export default () =>
  ejs.render(rule, {
    extensionUrl: config('PUBLIC_WT_URL').replace(/\/$/g, ''),
    apiKey: config('EXTENSION_SECRET'),
    updateTime: () => new Date().toISOString(),
    SLACK_API_TOKEN: config('SLACK_API_TOKEN'),
    SIGINING_SECRET: config('SIGNING_SECRET'),
    MONGO_CONNECTION_STRINGT: config('MONGO_CONNECTION_STRING')
  });
