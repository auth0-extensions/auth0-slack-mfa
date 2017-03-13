module.exports = `/*
*  This rule been automatically generated by the auth0-slack-mfa extension on <%= updateTime() %>.
*/
function (user, context, callback) {
  var jwt = require('jsonwebtoken');
  var MongoClient = require('mongodb');

  var mongoConnectionString = '<%= mongoConnectionString %>';
  var signingSecret = '<%= signingSecret %>';
  var mfaUrl = '<%= extensionUrl %>';

  // If you do not wish to use Slack MFA for all the clients in this account, uncomment
  // the code below and specify the client_ids to protect.
  //
  // var CLIENTS_WITH_MFA = [/* Enter the client_ids of all the clients to protect with Slack MFA*/];
  //if (CLIENTS_WITH_MFA.indexOf(context.clientID) === -1) {
  //  return callback(null,user,context);
  //}

  // returning from MFA validation
  if(context.protocol === 'redirect-callback') {
    var decoded = jwt.verify(context.request.query.token, new Buffer(signingSecret, 'base64'));
    if (!decoded || decoded.iss !== 'urn:sgmeyer:slack:mfacallback') return callback(new Error('Invalid Token'));

    MongoClient = require('mongodb').MongoClient;
    MongoClient.connect(mongoConnectionString, function(err, db) {
      var collection = db.collection('Token');

      var filter = { "jti": decoded.jti };
      collection.findOne(filter, function (err, whitelist) {
        if (!whitelist) return callback(new Error('Invalid JWT ID'));

        collection.remove(filter, function (err) {
          if (err) throw new Error('Failed to revoke token');
          return callback(null,user,context);
        });
      });
    });

    return callback(null,user,context);
  } else {

    var uuid = require('uuid');
    var token_payload = {
      sub: user.user_id,
      aud: context.clientID,
      jti: uuid.v4(),
      iat: new Date().getTime() / 1000,
      iss: 'urn:sgmeyer:slack:mfa'
    };

    if (user.user_metadata) {
      token_payload.slack_username = user.user_metadata.slack_mfa_username;
      token_payload.slack_enrolled = user.user_metadata.slack_mfa_enrolled;
    }

    var token = jwt.sign(token_payload, new Buffer(signingSecret, 'base64'), {
        subject: user.user_id,
        expiresInMinutes: 5,
        audience: context.clientID,
        issuer: 'urn:sgmeyer:slack:mfa',
        iat: new Date().getTime() / 1000
      });

    MongoClient = require('mongodb').MongoClient;
    MongoClient.connect(mongoConnectionString, function (err, db) {
      var tokenRecord = {
        jti: token_payload.jti,
        sub: token_payload.sub,
        iss: token_payload.iss,
        issued: new Date(token_payload.iat * 1000)
      };

      var upsertFilter = { 'sub': token_payload.sub, 'iss': token_payload.iss };
      return db.collection('Token').update(upsertFilter, tokenRecord, { upsert: true }, function (err, record) {
        if (err) { throw new Error('Failed to whitelist JWT.'); }

      var route = user.user_metadata && user.user_metadata.slack_mfa_username ? "/mfa/mfa" : "/mfa/enroll";
        context.redirect = { url: mfaUrl + route + '?token=' + token };
        return callback(null, user, context);
      });
    });
  }
}`;
