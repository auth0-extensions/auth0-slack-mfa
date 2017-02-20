import mongodb from 'mongodb';
import config from '../config';
import logger from '../logger';

const MongoClient = mongodb.MongoClient;

const connectToDb = (connectionString) => new Promise(
  (resolve, reject) => MongoClient.connect(connectionString, (err, db) => {
    if (err) { return reject(err); }
    return resolve(db);
  }));


const createCollection = (db) => new Promise(
  (resolve, reject) => {
    db.createCollection('Token', (err, collection) => {
      if (err) {
        return reject(err);
      }

      return resolve(collection);
    });
  });

const createTtlIndex = (collection) => new Promise(
  (resolve, reject) => {
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

const createIdIndex = (collection) => new Promise(
  (resolve, reject) => {
    const key =  { _id: 1 };
    const options = { name: '_id_' };

    collection.createIndex(key, options, (err, index) => {
      if (err) {
        return reject(err);
      }

      return resolve(collection);
    });
  });

const deleteCollection = (db) => new Promise(
  (resolve, reject) => {
    db.dropCollection('Token', (err, result) => {
      if (err) {
        // Despite this being an error, let's just log it an continue.
        // This is likely an issue if the collection doesn't exist.
        logger.error('Failed to delete collection.');
      }

      return resolve(db);
    });
  });

module.exports.remove = () => {
  const connectionString = config('MONGO_CONNECTION_STRING');
  let db;

  return connectToDb(connectionString)
  .then(connection => {
      db = connection;
      return db;
    })
    .then(deleteCollection)
    .then((db) => {
      if(db) {
        db.close();
      }
      logger.debug('Token whitelist collection successfully deleted.');
    })
    .catch((err) => {
      db.close();
      logger.debug('Token whitelist collection failed to delete.');
      logger.error(err);
      throw err;
    });
};

module.exports.provision = () => {
  const connectionString = config('MONGO_CONNECTION_STRING');
  let db;
  
  return connectToDb(connectionString)
    .then(connection => {
      db = connection;
      return db;
    })
    .then(createCollection)
    .then(createTtlIndex)
    .then(createIdIndex)
    .then(() => {
      if(db) {
        db.close();
      }
      logger.debug('Token whitelist collection successfully created.');
    })
    .catch((err) => {
      db.close(); 
      logger.debug('There was a failure trying to provision the token whitelist collection.');
      logger.error(err);
      throw err;
    });
};

