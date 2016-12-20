var express = require('express');
var token = require('../lib/token');
var view = require('../views/cancel');
var router = express();

function getCancel(req, res) {
  var client_secret = config('SIGNING_SECRET');
  var connectionString = config('MONGO_CONNECTION_STRING');
  var secret = new Buffer(client_secret, 'base64');

  token.verify(req.query.token, secret, connectionString).then(function (decoded) {
    return token.revoke(decoded, connectionString);
  }).then(function () {
    res.end(require('ejs').render(view()));
    res.end();
  }).catch(function (err) {
    res.status(500).send('Error.').end();
  });
}

router.get('/cancel', getCancel);

module.exports = router;
