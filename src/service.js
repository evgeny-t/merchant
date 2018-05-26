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
      await _.chain(items)
        .uniqBy('companyName')
        .map(item => () =>
          db.collection(COMPANY).findOneAndUpdate(
            { companyName: item.companyName },
            {
              $setOnInsert: {
                companyName: item.companyName
              }
            },
            { upsert: true }
          )
        )
        .reduce((acc, cur) => acc.then(cur), Promise.resolve())
        .value();
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
      return await db
        .collection(ORDER)
        .find({ companyName })
        .toArray();
    },
    companiesByOrder: async orderItem => {
      return await db
        .collection(ORDER)
        .aggregate([
          /* {
            $match: {
              orderItem
            },
          }, {
            $group: {
              _id: '$companyName',
            }
          }, */ {
            $lookup: {
              from: 'company',
              localField: 'companyName',
              foreignField: 'companyName',
              as: 'companies'
            }
          }
        ])
        .toArray();
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
      delete: async companyName => {
        return await db.collection(COMPANY).findOneAndDelete({ companyName });
      },
      paid: async companyName => {
        return (await db
          .collection(ORDER)
          .aggregate([
            {
              $match: {
                companyName
              }
            },
            {
              $group: {
                _id: '$companyName',
                amount: { $sum: '$price' }
              }
            }
          ])
          .toArray())[0];
      }
    }
  };
};
