var express    = require('express');
var bodyParser = require('body-parser');
var auth0      = require('auth0-oauth2-express');
var Webtask    = require('webtask-tools');
var app        = express();
var metadata   = require('./webtask.json');

app.use(auth0({
  scopes: 'update:users'
}));

var controllers = [
  require('./controllers/cancel'),
  require('./controllers/enroll'),
  require('./controllers/mfa'),
  require('./controllers/verify')
];

app.use(bodyParser.urlencoded({ extended: false }));
app.use('/', controllers);

app.use(function (req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

app.use(function (err, req, res, next) {
  console.log('Application Error Handler: ' + err + '\r\nStack: \r\n' + err.stack);
  res.status(err.status || 500).send("Oh no!  This is pretty embarrassing").end();
});

// This endpoint would be called by webtask-gallery to dicover your metadata
app.get('/meta', function (req, res) {
  res.status(200).send(metadata);
});

module.exports = app;
