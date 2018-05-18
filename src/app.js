const express = require('express');
const bodyParser = require('body-parser');
const parse = require('csv-parse');

const makeOrder = (
  ignore,
  companyName,
  customerAddress,
  orderItem,
  price,
  currency
) => ({
  companyName,
  customerAddress,
  orderItem,
  price,
  currency
});

module.exports = service => {
  const app = express();
  app.use(bodyParser.text());

  app.post('/new', (req, res) => {
    parse(
      req.body.trim(),
      { quote: '', trim: true, cast: true },
      (err, output) => {
        if (err) {
          console.error(err);
          res.status(400).send(err.message);
        } else {
          const items = output.map(row => makeOrder(...row));
          service
            .createOrders(items)
            .then(items => res.status(200).send({ items }))
            .catch(error => res.status(500).send({ error }));
        }
      }
    );
  });
  return app;
};
