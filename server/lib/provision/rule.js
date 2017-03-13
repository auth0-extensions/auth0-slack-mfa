import _ from 'lodash';
import ejs from 'ejs';
import config from '../config';
import logger from '../logger';
import mfaRule from './rules/slack-mfa-rule';

const compileRule = (rule) =>
  ejs.render(rule, {
    extensionUrl: config('PUBLIC_WT_URL').replace(/\/$/g, ''),
    mongoConnectionString: config('MONGO_CONNECTION_STRING'),
    signingSecret: config('EXTENSION_SECRET'),
    updateTime: () => new Date().toISOString()
  });

module.exports.remove = (auth0) => {
  const ruleName = 'slack-mfa-rule';
  return auth0
  .rules
  .getAll()
  .then(rules => {
    const rule = _.find(rules, { name: ruleName });
    if (rule) {
      auth0.rules.delete({ id: rule.id });
    }
  })
  .then(() => {
    logger.debug('Slack MFA rule deleted.');
  })
  .catch((err) => {
    logger.debug('Error creating Slack MFA rule.');
    logger.error(err);
  });
};

module.exports.provision = (auth0) => {
  const ruleName = 'slack-mfa-rule';
  return auth0
    .rules
    .getAll()
    .then(rules => {
      const payload = {
        name: ruleName,
        script: compileRule(mfaRule)
      };

      const rule = _.find(rules, { name: ruleName });
      if (rule) {
        return auth0.rules.update({ id: rule.id }, payload);
      }

      return auth0.rules.create({ stage: 'login_success', ...payload });
    })
    .then(() => {
      logger.debug('Slack MFA rule deployed.');
    })
    .catch((err) => {
      logger.debug('Error creating Slack MFA rule.');
      logger.error(err);
    });
};
