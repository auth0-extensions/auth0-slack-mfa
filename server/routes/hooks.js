import _ from 'lodash';
import { Router as router } from 'express';
import { middlewares } from 'auth0-extension-express-tools';

import config from '../lib/config';
import logger from '../lib/logger';
import compileRule from '../lib/compileRule';

export default () => {
  const hooks = router();
  const hookValidator = middlewares
    .validateHookToken(config('AUTH0_DOMAIN'), config('WT_URL'), config('EXTENSION_SECRET'));

  hooks.use('/on-install', hookValidator('/.extensions/on-install'));
  hooks.use('/on-uninstall', hookValidator('/.extensions/on-uninstall'));
  hooks.use(middlewares.managementApiClient({
    domain: config('AUTH0_DOMAIN'),
    clientId: config('AUTH0_CLIENT_ID'),
    clientSecret: config('AUTH0_CLIENT_SECRET')
  }));

  hooks.post('/on-install', (req, res) => {
    logger.debug("Starting installation.");
    logger.debug("Installing rule");
    const ruleName = 'auth0-slack-mfa';
    req.auth0
      .rules
      .getAll()
      .then(rules => {
        const payload = {
          name: ruleName,
          script: compileRule(config, ruleName)
        };

        const rule = _.find(rules, { name: ruleName });
        if (rule) {
          return req.auth0.rules.update({ id: rule.id }, payload);
        }

        return req.auth0.rules.create({ stage: 'login_success', ...payload });
      })
      .then(() => {
        logger.debug('Slack MFA rule deployed.');
        res.sendStatus(204);
      })
      .catch((err) => {
        logger.debug('Error deploying Slack MFA rule.');
        logger.error(err);

        // Even if deleting fails, we need to be able to uninstall the extension.
        res.sendStatus(400);
      });
  });

  hooks.delete('/on-uninstall', (req, res) => {
    req.auth0
      .rules
      .getAll()
      .then(rules => {
        const rule = _.find(rules, { name: ruleName });
        if (rule) {
          req.auth0.rules.delete({ id: rule.id});
        }
      }).then(() => {
        logger.debug('Slack MFA rule deleted.');
        res.sendStatus(204);
      }).catch((err) => {
        logger.debug('Error deleting Slack MFA rule.')
        logger.error(err);

        // Even if deleting fails, we need to be able to uninstall the extension.
        res.sendStatus(204);
      });
  });
  return hooks;
};
