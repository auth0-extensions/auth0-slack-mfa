import mongodb from 'mongodb';
import config from './config';

const MongoClient = mongodb.MongoClient;

function connectToDb(connectionString) {
  const promise = new Promise((resolve, reject) => MongoClient.connect(connectionString, (err, db) => {
    if (err) { return reject(err); }
    return resolve(db);
  }));

  return promise;
}

function createCollection(db) {
  const promise = new Promise((resolve, reject) => {
    db.createCollection('Token', (err, creatCollection) => {
      if (err) {
        return reject(err);
      }

      return resolve(collection);
    });
  });

  return promise;
}

function createTtlIndex(collection) {
  const promise = new Promise((resolve, reject) => {
    const key =  { issued: 1 };
    const options = {
      name: 'token-cleanse',
      background: true,
      expireAfterSeconds: 300
    };

    collection.createIndex(key, options, (err, index) => {
      if (err) {
        return reject(err);
      }

      return resolve(collection);
    });
  });

  return promsise;
}

function createIdIndex(collection) {
  const promise = new Promise((resolve, reject) => {
    const key =  { _id: 1 };
    const options = { name: '_id_' };

    collection.createIndex(key, options, (err, index) => {
      if (err) {
        return reject(err);
      }

      return resolve(collection);
    });
  });

  return promise;
}

export default () => {
  const connectionString = config('MONGO_CONNECTION_STRING');
  let db;
  
  connectToDb(connectionString)
    .then(connection => {
      db = connection;
      return Promise.resolve(db);
    })
    .then(createCollection)
    .then(createTtlIndex)
    .then(createIdIndex)
    .finally(() => {
      if(db) {
        db.close();
      }
    });
}