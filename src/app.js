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

const handleError = (req, res) => error => res.status(500).send({ error });

module.exports = service => {
  const app = express();
  app.use(bodyParser.text());
  app.use(bodyParser.json());

  app.post('/order', (req, res) => {
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
            .catch(handleError(req, res));
        }
      }
    );
  });

  app.get('/orders', (req, res) => {
    service
      .orders(req.query)
      .then(orders => res.status(200).send({ orders }))
      .catch(handleError(req, res));
  });

  app.delete('/order', (req, res) => {
    service
      .deleteOrder(req.body.id)
      .then(() => res.sendStatus(200))
      .catch(handleError(req, res));
  });

  app.get('/stats', (req, res) => {
    service
      .stats()
      .then(items => res.status(200).send({ items }))
      .catch(handleError(req, res));
  });

  app.get('/company', (req, res) => {
    service.company
      .get(req.query.name)
      .then(company => res.status(200).send(company))
      .catch(handleError(req, res));
  });

  app.put('/company', (req, res) => {
    service.company
      .update(req.body.companyName, req.body.info)
      .then(() => res.status(200).send({}))
      .catch(handleError(req, res));
  });

  app.delete('/company', (req, res) => {
    service.company
      .delete(req.body.companyName)
      .then(() => res.status(200).send({}))
      .catch(handleError(req, res));
  });

  app.get('/company/orders', (req, res) => {
    service
      .ordersByCompany(req.query.name)
      .then(items => res.status(200).send({ items }))
      .catch(handleError(req, res));
  });

  app.get('/company/paid', (req, res) => {
    service.company
      .paid(req.query.name)
      .then(result => res.status(200).send(result))
      .catch(handleError(req, res));
  });

  app.get('/order/companies', (req, res) => {
    service
      .companiesByOrder(req.query.name)
      .then(items => res.status(200).send({ items }))
      .catch(handleError(req, res));
  });

  return app;
};
