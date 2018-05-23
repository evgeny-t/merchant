const _ = require('lodash');
const MongoClient = require('mongodb').MongoClient;
const connectionString = process.env.CONNECTION_STRING;

const COMPANY = 'company';
const ORDER = 'order';

const escape = s => {
  return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
};

module.exports = async db => {
  return {
    createOrders: async items => {
      // TODO: validate shape of items
      const opResult = await db.collection(ORDER).insertMany(items);
      await db
        .collection(COMPANY)
        .insertMany(items.map(item => ({ companyName: item.companyName })));
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
        .collection(ORDER)
        .find(findQuery)
        .toArray();
      return opResult;
    },
    deleteOrder: async _id => {
      return await db.collection(ORDER).deleteOne({ _id });
    },
    stats: async () => {
      return await db
        .collection(ORDER)
        .aggregate([
          {
            $group: {
              _id: '$orderItem',
              count: { $sum: 1 }
            }
          },
          { $sort: { count: -1 } }
        ])
        .toArray();
    },
    ordersByCompany: async companyName => {
      return Promise.resolve();
    },
    companiesByOrder: async orderItem => {
      return Promise.resolve();
    },
    company: {
      get: async companyName => {
        return await db.collection(COMPANY).findOne({ companyName });
      },
      update: async (companyName, info) => {
        return await db
          .collection(COMPANY)
          .findOneAndUpdate(
            { companyName },
            { $set: _.omit(info, 'companyName') }
          );
      },
      delete: async name => {
        return Promise.resolve();
      },
      paid: async name => {
        return Promise.resolve();
      }
    }
  };
};
