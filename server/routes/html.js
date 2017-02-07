import fs from 'fs';
import ejs from 'ejs';
import path from 'path';

import { urlHelpers } from 'auth0-extension-express-tools';

import config from '../lib/config';
import view from '../views/html';

export default () => {
  return (req, res) => {
    const settings = {
      BASE_URL: urlHelpers.getBaseUrl(req),
      BASE_PATH: urlHelpers.getBasePath(req),
      AUTH0_DOMAIN: config('AUTH0_DOMAIN'),
      AUTH0_MANAGE_URL: config('AUTH0_MANAGE_URL') || 'http://manage.auth0.com'
    };

    // Render from CDN.
    const clientVersion = process.env.CLIENT_VERSION;
    if (clientVersion) {
      return res.send(ejs.render(view(), {
        config: settings,
        assets: { version: clientVersion }
      }));
    }

    // Render locally.
    return fs.readFile(path.join(__dirname, '../../dist/manifest.json'), 'utf8', (err, data) => {
      const locals = {
        config: settings,
        assets: {
          app: 'bundle.js'
        }
      };

      if (!err && data) {
        locals.assets = JSON.parse(data);
      }

      // Render the HTML page.
      res.send(ejs.render(view(), locals));
    });
  };
};