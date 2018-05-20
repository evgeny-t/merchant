const _ = require('lodash');
const MongoClient = require('mongodb').MongoClient;
const makeService = require('./service');

describe('service', () => {
  let client;
  let db;

  beforeAll(async () => {
    client = await MongoClient.connect(process.env.CONNECTION_STRING, {
      useNewUrlParser: true
    });
    db = client.db('test');
  });
  beforeEach(() => {
    db = client.db('test');
  });
  afterEach(async () => {
    await db.dropDatabase();
  });

  describe('#createOrders', () => {
    it('should insert items and return them', async () => {
      const service = await makeService(db);
      const items = await service.createOrders([
        {
          companyName: 'Żywiec Brewery',
          customerAddress: 'Plebańska 9, 34-300 Żywiec, Poland',
          orderItem: 'Amerykańskie Pszeniczne',
          price: 8.5,
          currency: 'PLN'
        }
      ]);
      expect(items).toEqual(
        expect.arrayContaining([
          {
            _id: expect.anything(),
            companyName: 'Żywiec Brewery',
            customerAddress: 'Plebańska 9, 34-300 Żywiec, Poland',
            orderItem: 'Amerykańskie Pszeniczne',
            price: 8.5,
            currency: 'PLN'
          }
        ])
      );
    });
  });

  describe('#orders', () => {
    it('should list all orders', async () => {
      const service = await makeService(db);
      const created = await service.createOrders(
        _.range(10).map(i => ({
          companyName: `company-${i}`,
          customerAddress: `address-${i}`
        }))
      );
      const items = await service.orders({});
      expect(items).toEqual(expect.arrayContaining(created));
    });
  });
});
