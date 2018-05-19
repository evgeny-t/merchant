const MongoClient = require('mongodb').MongoClient;
const connectionString = process.env.CONNECTION_STRING;

module.exports = async () => {
  const client = await MongoClient.connect(connectionString, {
    useNewUrlParser: true
  });
  const db = client.db('test');
  const onShutdown = () => {
    console.log('got SIGTERM/SIGINT');
    client.close();
  };
  process.on('SIGTERM', onShutdown);
  process.on('SIGINT', onShutdown);
  return {
    createOrders: async items => {
      // TODO: validate shape of items
      const opResult = await db.collection('orders').insertMany(items);
      return opResult.ops;
    }
  };
};
