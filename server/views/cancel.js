function render() {
  return `<html>
    <head>
      <meta charset="utf-8">
      <link href="https://cdn.auth0.com/styleguide/latest/index.min.css" rel="stylesheet" />
      <link rel="stylesheet" href="https://cdn.auth0.com/backend-templates/main.css">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <title>Auth0 - Slack Multifactor Authentication</title>
    </head>
    <body>
      <div class="unhandled-error-cont tenant-error-cont ">
        <div class="error-header">
          <span class="error-icon">
            <span class="error-face">
              <span class="error-face-eye left-eye eye-blink"></span>
              <span class="error-face-eye right-eye eye-blink"></span>
              <span class="error-mouth"></span>
            </span>
          </span>
          <h3 class="error-title">How embarrassing!</h3>
          <h3 class="error-subtitle">Thank you for letting us know.</h3>
        </div>
        <div class="error-body">
          <p class="error-message">
            We have deactivated the link.  Thank you for letting us know.
          </p>
        </div>
        <div class="error-footer">
            <span class="footer-group">
              <h4 class="footer-group-title">SUPPORT</h4>
                <p class="footer-group-detail">Please contact the systems administrator.</p>
            </span>
          </div>
        </div>
      </div>
      <script src="https://ajax.googleapis.com/ajax/libs/jquery/2.1.4/jquery.min.js"></script>
      <script src="https://cdn.auth0.com/backend-templates/main.js"></script>
    </body>
  </html>`;
}

module.exports = render;
