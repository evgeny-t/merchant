const MongoClient = require('mongodb').MongoClient;
const connectionString = process.env.CONNECTION_STRING;

const escape = s => {
  return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
};

module.exports = async db => {
  return {
    createOrders: async items => {
      // TODO: validate shape of items
      const opResult = await db.collection('orders').insertMany(items);
      return opResult.ops;
    },
    orders: async (query = {}) => {
      let findQuery = {};
      if (query.companyName) {
        findQuery = Object.assign(findQuery, {
          companyName: new RegExp(escape(query.companyName), 'ig')
        });
      }

      if (query.customerAddress) {
        findQuery = Object.assign(findQuery, {
          customerAddress: new RegExp(escape(query.customerAddress), 'ig')
        });
      }

      const opResult = await db
        .collection('orders')
        .find(findQuery)
        .toArray();
      return opResult;
    },
    deleteOrder: async _id => {
      return await db.collection('orders').deleteOne({ _id });
    }
  };
};
