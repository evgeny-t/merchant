const MongoClient = require('mongodb').MongoClient;
const connectionString = process.env.CONNECTION_STRING;

module.exports = async db => {
  return {
    createOrders: async items => {
      // TODO: validate shape of items
      const opResult = await db.collection('orders').insertMany(items);
      return opResult.ops;
    },
    orders: async query => {
      const opResult = await db
        .collection('orders')
        .find()
        .toArray();
      return opResult;
    }
  };
};
