require('dotenv').config();

const MongoClient = require('mongodb').MongoClient;

const createApp = require('./src/app');
const createService = require('./src/service');
const port = 3003;

MongoClient.connect(process.env.CONNECTION_STRING, {
  useNewUrlParser: true
})
  .then(client => client.db('merchant'))
  .then(db => createService(db))
  .then(service => {
    const app = createApp(service);
    app.listen(port, () => {
      console.log(`listening on ${port}`);
    });
  });
