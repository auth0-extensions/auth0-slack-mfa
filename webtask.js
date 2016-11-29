var Webtask = require('webtask-tools');
var app = require('./index.js');

// This is the entry-point for the Webpack build. We need to convert our module
// (which is a simple Express server) into a Webtask-compatible function.
module.exports = Webtask.fromExpress(require(app));
