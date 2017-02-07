function render() {
  return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <title>Auth0 - Slack MFA Extension</title>
    <meta charset="UTF-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=Edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="shortcut icon" href="https://cdn.auth0.com/styleguide/4.6.13/lib/logos/img/favicon.png">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link rel="stylesheet" type="text/css" href="https://cdn.auth0.com/styles/zocial.min.css">
    <link rel="stylesheet" type="text/css" href="https://cdn.auth0.com/manage/v0.3.1715/css/index.min.css">
    <link rel="stylesheet" type="text/css" href="https://cdn.auth0.com/styleguide/4.6.13/index.css">
    <% if (assets.style) { %><link rel="stylesheet" type="text/css" href="/app/<%= assets.style %>"><% } %>
    <% if (assets.version) { %><link rel="stylesheet" type="text/css" href="https://s3.amazonaws.com/assets.auth0.com/extensions/develop/auth0-slack-mfa/assets/auth0-slack-mfa.ui.<%= assets.version %>.css"><% } %>
    <style type="text/css">
    pre {
      background-color: #fbfbfb;
      border: 1px solid #f1f1f1;
      border-radius: 0px;
      padding: 10px 10px;
      font-size: 12px;
    }
    </style>
  </head>
  <body class="a0-extension">
    <div id="app"></div>
    <script type="text/javascript" src="//cdn.auth0.com/js/lock-9.0.min.js"></script>
    <script type="text/javascript" src="//cdn.auth0.com/manage/v0.3.1715/js/bundle.js"></script>
    <script type="text/javascript">window.config = <%- JSON.stringify(config) %>;</script>
    <% if (assets.vendors) { %><script type="text/javascript" src="/app/<%= assets.vendors %>"></script><% } %>
    <% if (assets.app) { %><script type="text/javascript" src="//localhost:3000/app/<%= assets.app %>"></script><% } %>
    <% if (assets.version) { %>
    <script type="text/javascript" src="https://s3.amazonaws.com/assets.auth0.com/extensions/develop/auth0-slack-mfa/assets/auth0-slack-mfa.ui.vendors.<%= assets.version %>.js"></script>
    <script type="text/javascript" src="https://s3.amazonaws.com/assets.auth0.com/extensions/develop/auth0-slack-mfa/assets/auth0-slack-mfa.ui.<%= assets.version %>.js"></script>
    <% } %>
  </body>
  </html>
  `;
}

module.exports = render;
