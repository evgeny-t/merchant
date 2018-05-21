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
      const opResult = await db
        .collection('orders')
        .find(
          Object.assign(
            {},
            query.companyName
              ? {
                  companyName: new RegExp(escape(query.companyName), 'ig')
                }
              : {}
          )
        )
        .toArray();
      return opResult;
    }
  };
};
