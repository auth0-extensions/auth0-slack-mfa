function render() {
  return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <title>Auth0 - Slack MFA</title>
    <meta charset="UTF-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=Edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="shortcut icon" href="https://cdn.auth0.com/styleguide/4.6.13/lib/logos/img/favicon.png">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link rel="stylesheet" type="text/css" href="https://cdn.auth0.com/styles/zocial.min.css">
    <link rel="stylesheet" type="text/css" href="https://cdn.auth0.com/manage/v0.3.1715/css/index.min.css">
    <link rel="stylesheet" type="text/css" href="https://cdn.auth0.com/styleguide/4.6.13/index.css">
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
  <body>
    Hello, friend.
  </body>
  </html>
  `;
}

module.exports = render;
