import React from 'react';

export default ({ config }) => {
  return (
    <div>
      <h4>Usage</h4>
      <p>
        A lot of teams live in Slack.  Almost all of our communication happens with in Slack.  It isn't always convenient to open a mobile device to get an access code.  That
        is ok by this extension.  Now you can use send MFA challenges to your users as Slack Direct Messages.  

        Here's how it works.
      </p>
      <p>
        <ol>
          <li>User attempts to authenticat with Auth0</li>
          <li>User is redirected to enroll in Slack MFA</li>
          <li>User is sent a MFA challenge via Direct Messages</li>
          <li>User click on the MFA link and is allowed to access the application.</li>
        </ol>
      </p>
    </div>
  );
};
