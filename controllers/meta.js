var express  = require('express');
var router   = express();
var metadata = require('./webtask.json');

function getMeta(req, res) {
  res.status(200).send(metadata);
}

router.get('/meta', getMeta);

module.exports = router;