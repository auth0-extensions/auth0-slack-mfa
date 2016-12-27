import jwt from 'jsonwebtoken';
import tokens from './tokenStore';

const token = {
  issue: (payload, secret, options, connectionString) => {
    let database;
    return tokens.connect(connectionString).then((db) => {
      database = db;
      return tokens.find(database, payload);
    })
    .then((record) => {
      if (record) { throw new Error('JWT already white listed.'); }
      return tokens.save(database, payload);
    })
    .then((record) => {
      if (!record) { throw new Error('Failed to whitelist JWT.'); }
      return sign(payload, secret, options);
    });
  },
  revoke: (decodedToken, connectionString) =>
    tokens.connect(connectionString)
    .then((db) => tokens.remove(db, decodedToken)),
  verify: (token, secret, connectionString) => {
    let decodedToken;
    return verify(token, secret).then((decoded) => {
      decodedToken = decoded;
      return tokens.connect(connectionString);
    })
    .then((db) => tokens.find(db, decodedToken))
    .then((record) => new Promise((resolve, reject) => {
      if (!record) { return reject('JWT is not whitelisted.'); }
      return resolve(decodedToken);
    }));
  }
};

function verify(token, secret) {
  return new Promise((resolve, reject) => jwt.verify(token, secret, (err, decoded) => {
    if (err) { return reject(err); }
    return resolve(decoded);
  }));
}

function sign(payload, secret, options) {
  return new Promise((resolve) => {
    let token = jwt.sign(payload, secret, options);
    return resolve(token);
  });
}

module.exports = token;
