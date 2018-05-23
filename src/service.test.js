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

    it('should filter orders by company', async () => {
      const service = await makeService(db);
      const created = await service.createOrders(
        _.range(10).map(i => ({
          companyName: `company-${i * 2}`,
          customerAddress: `address-${i * 2}`
        }))
      );
      const items = await service.orders({
        companyName: '0'
      });
      expect(items).toEqual(
        expect.arrayContaining([
          {
            _id: expect.anything(),
            companyName: 'company-0',
            customerAddress: 'address-0'
          },
          {
            _id: expect.anything(),
            companyName: 'company-10',
            customerAddress: 'address-10'
          }
        ])
      );
      expect(items).toHaveLength(2);
    });

    it('should filter orders by address', async () => {
      const service = await makeService(db);
      const created = await service.createOrders(
        _.range(10).map(i => ({
          companyName: `company-${i * 2}`,
          customerAddress: `address-${i * 2}`
        }))
      );
      const items = await service.orders({
        customerAddress: '4'
      });
      expect(items).toHaveLength(2);
      expect(items).toEqual(
        expect.arrayContaining([
          {
            _id: expect.anything(),
            companyName: 'company-4',
            customerAddress: 'address-4'
          },
          {
            _id: expect.anything(),
            companyName: 'company-14',
            customerAddress: 'address-14'
          }
        ])
      );
    });
  });

  describe('#deleteOrder', () => {
    it('should delete an order by id', async () => {
      const service = await makeService(db);
      const data = _.range(10).map(i => ({
        companyName: `company-${i}`,
        customerAddress: `address-${i}`
      }));
      const created = await service.createOrders(data);
      const items = await service.orders();
      const id = _.chain(items)
        .find(['companyName', 'company-4'])
        .get('_id')
        .value();
      await service.deleteOrder(id);
      const itemsAfterDelete = await service.orders();
      expect(itemsAfterDelete).toHaveLength(created.length - 1);
      expect(itemsAfterDelete).toEqual(
        expect.arrayContaining(
          _.chain(data)
            .map(i => Object.assign({}, i, { _id: expect.anything() }))
            .filter(_.negate(_.matchesProperty('companyName', 'company-4')))
            .value()
        )
      );
    });
  });

  describe('#stats', () => {
    it(`should return how often each item
    has been ordered, in descending order`, async () => {
      const service = await makeService(db);
      await service.createOrders(
        _.union(
          _.range(3).map(i => ({ orderItem: 'Macbook' })),
          _.range(137).map(i => ({ orderItem: 'Amerykańskie Pszeniczne' })),
          _.range(10).map(i => ({ orderItem: 'Item' }))
        )
      );
      const stats = await service.stats();
      expect(stats).toEqual([
        { _id: 'Amerykańskie Pszeniczne', count: 137 },
        { _id: 'Item', count: 10 },
        { _id: 'Macbook', count: 3 }
      ]);
    });
  });

  describe('#ordersByCompany', () => {
    it('should work');
  });

  describe('#ordersByCompany', () => {
    it('companiesByOrder');
  });

  describe('company', () => {
    describe('#get', () => {
      it('#get', async () => {
        const service = await makeService(db);
        const created = await service.createOrders(
          _.range(10).map(i => ({
            companyName: `company-${i}`,
            customerAddress: `address-${i}`
          }))
        );

        const info = service.company.get('company-4');
        return await expect(info).resolves.toEqual({
          _id: expect.anything(),
          companyName: 'company-4'
        });
      });
    });
    describe('#update', () => {
      it('#update', async () => {
        const service = await makeService(db);
        const created = await service.createOrders(
          _.range(10).map(i => ({
            companyName: `company-${i}`,
            customerAddress: `address-${i}`
          }))
        );

        let info = service.company.get('company-4');
        await expect(info).resolves.toEqual({
          _id: expect.anything(),
          companyName: 'company-4'
        });

        await service.company.update('company-4', { foo: 'bar' });
        info = service.company.get('company-4');
        await expect(info).resolves.toEqual({
          _id: expect.anything(),
          companyName: 'company-4',
          foo: 'bar'
        });
      });
    });
    describe('#delete', () => {
      it('#delete');
    });
    describe('#paid', () => {
      it('#paid');
    });
  });
});
