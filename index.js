const createApp = require('./src/app');
const port = 3003;
const app = createApp({
  createOrders: async items => {
    return items;
  }
});

app.listen(port, () => {
  console.log(`listening on ${port}`);
});
