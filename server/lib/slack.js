import Promise from 'bluebird';
import querystring from 'querystring';
import request from 'request';

const prequest = Promise.promisify(request);

const slack = {
  sendDM: (options) => {
    const text = JSON.stringify([ {
      fallback: `Follow this link to complete login: <${options.verifyUrl} | Complete Login>.`,
      title: 'You have attempted to log into a remote site.  Please click the link below to continue.',
      text: `<${options.verifyUrl} | Complete Login>\n\n<${options.cancelUrl} | That's not me>`,
      color: '#3AA3E3'
    } ]);

    const requestUrl = `https://slack.com/api/chat.postMessage?token=${options.token}&channel=%40${options.username}&attachments=${querystring.escape(text)}&pretty=1&as_user=true&unfurl_links=false&unfurl_media=false`;
    console.log(requestUrl);
    return prequest({
      method: 'GET',
      url: requestUrl
    });
  }
};

module.exports = slack;
