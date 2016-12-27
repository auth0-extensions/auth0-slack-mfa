import mongodb from 'mongodb';

const MongoClient = mongodb.MongoClient;

const tokenStore = {
  connect: connectToDb,
  find: findToken,
  remove: removeToken,
  save: saveToken
};

function connectToDb(connectionString) {
  return new Promise((resolve, reject) => MongoClient.connect(connectionString, (err, db) => {
    if (err) { return reject(err); }
    return resolve(db);
  }));
}

function findToken(db, decodedToken) {
  return new Promise((resolve, reject) => db.collection('Token').findOne({ jti: decodedToken.jti }, (err, record) => {
    if (err) { return reject(err); }
    return resolve(record);
  }));
}

function removeToken(db, decodedToken) {
  return new Promise((resolve, reject) => db.collection('Token').remove({ jti: decodedToken.jti }, (err) => {
    if (err) { return reject(err); }
    return resolve(true);
  }));
}

function saveToken(db, decodedToken) {
  return new Promise((resolve, reject) => {
    if (!decodedToken.jti) { return reject('The jwt must have a jti.'); }
    if (!decodedToken.iat || isNaN(decodedToken.iat)) { return reject('The jwt must have a valid iat.'); }

    const issuedAt = new Date(decodedToken.iat * 1000);
    const tokenRecord = {
      jti: decodedToken.jti,
      sub: decodedToken.sub,
      iss: decodedToken.iss,
      issued: issuedAt
    };

    const collection = db.collection('Token');
    const upsertFilter = { sub: decodedToken.sub, iss: decodedToken.iss };
    return collection.update(upsertFilter, tokenRecord, { upsert: true }, (err, record) => {
      if (err) { return reject(err); }
      return resolve(record);
    });
  });
}

module.exports = tokenStore;
