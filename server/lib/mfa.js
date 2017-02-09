import Promise from 'bluebird';
import request from 'request';

const prequest = Promise.promisify(request);

const mfa = {
  enroll: (options) => prequest({
    method: 'PATCH',
    url: `https://${options.apiDomain}/api/v2/users/${options.userId}`,
    headers: {
      'cache-control': 'no-cache',
      authorization: `Bearer ${options.apiToken}`,
      'content-type': 'application/json'
    },
    body: { user_metadata: { slack_mfa_username: options.slack_username, slack_mfa_enrolled: false } },
    json: true
  }),
  verify: (options) => prequest({
    method: 'PATCH',
    url: `https://${options.apiDomain}/api/v2/users/${options.userId}`,
    headers: {
      'cache-control': 'no-cache',
      authorization: `Bearer ${options.apiToken}`,
      'content-type': 'application/json'
    },
    body: { user_metadata: { slack_mfa_username: options.slack_username, slack_mfa_enrolled: true } },
    json: true
  })
};

module.exports = mfa;
