import { Router as router } from 'express';
import { middlewares } from 'auth0-extension-express-tools';
import config from '../lib/config';
import { provisionRule as rules, provisionMongo as mongodb } from '../lib/provision';

export default () => {
  const hooks = router();
  const hookValidator = middlewares
    .validateHookToken(config('AUTH0_DOMAIN'), config('WT_URL'), config('EXTENSION_SECRET'));

  // hooks.use('/on-install', hookValidator('/.extensions/on-install'));
  // hooks.use('/on-uninstall', hookValidator('/.extensions/on-uninstall'));
  hooks.use(middlewares.managementApiClient({
    domain: config('AUTH0_DOMAIN'),
    clientId: config('AUTH0_CLIENT_ID'),
    clientSecret: config('AUTH0_CLIENT_SECRET')
  }));

  /**
   * Hook is run once the extension is installed.  This provisions the slack-mfa-rule
   * and a mongo collection ('Token') used to keep a JWT whitelist for one-time use tokens.
   */
  hooks.post('/on-install', (req, res) => {
    const tasks = [
      rules.provision(req.auth0),
      mongodb.provision()
    ];

    Promise.all(tasks)
      .then((values) => {
        res.sendStatus(204);
      })
      .catch((err) => {
        res.sendStatus(400);
      });
  });

  /**
   * Hook is run once the extension is uninstalled.  This removes the slack-mfa-rule
   * and the mongo collection ('Token').
   */
  hooks.delete('/on-uninstall', (req, res) => {
    const tasks = [
      rules.remove(req.auth0),
      mongodb.remove()
    ];

    Promise.all(tasks)
      .then((values) => {
        res.sendStatus(204);
      })
      .catch((err) => {
        // Even if deleting fails, we need to be able to uninstall the extension.
        res.sendStatus(204);
      });
  });
  return hooks;
};
