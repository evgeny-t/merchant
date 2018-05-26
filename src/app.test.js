/* global
  describe, it,
  expect, jest,
 */
const request = require('supertest');
const makeApp = require('./app');

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

describe('/order', () => {
  describe('POST', () => {
    it('should reply with created items', async () => {
      const service = {
        createOrders: jest.fn(items => Promise.resolve(items))
      };
      const app = makeApp(service);

      const response = await request(app)
        .post('/order')
        .set('Content-Type', 'text/plain')
        .send(
          `001, SuperTrader, Steindamm 80, Macbook, 1700, EUR
          003, MegaCorp, Steindamm 80, Book "Guide to Hamburg", 20, EUR
          004, SuperTrader, Sternstrasse 125, Book "Cooking 101", 10, EUR
          `
        );

      expect(response.status).toBe(200);
      expect(response.body.items.length).toBe(3);
      expect(response.body.items).toEqual(
        expect.arrayContaining([
          {
            companyName: 'SuperTrader',
            customerAddress: 'Steindamm 80',
            orderItem: 'Macbook',
            price: 1700,
            currency: 'EUR'
          },
          {
            companyName: 'MegaCorp',
            customerAddress: 'Steindamm 80',
            orderItem: 'Book "Guide to Hamburg"',
            price: 20,
            currency: 'EUR'
          },
          {
            companyName: 'SuperTrader',
            customerAddress: 'Sternstrasse 125',
            orderItem: 'Book "Cooking 101"',
            price: 10,
            currency: 'EUR'
          }
        ])
      );
    });
  });

  describe('GET', () => {
    it('should pass query params down to service', async () => {
      const service = {
        orders: jest.fn(() => Promise.resolve([{ a: 1 }, { b: 2 }]))
      };
      const app = makeApp(service);
      const response = await request(app)
        .get('/orders')
        .query({ param1: 'qwerty', param2: '42' })
        .send();

      expect(response.status).toBe(200);
      expect(response.body.orders.length).toBe(2);
      expect(response.body.orders).toEqual(
        expect.arrayContaining([{ b: 2 }, { a: 1 }])
      );
      expect(service.orders).toHaveBeenCalledWith({
        param1: 'qwerty',
        param2: '42'
      });
    });
  });

  describe('DELETE', () => {
    it('should delete order by id', async () => {
      const service = {
        deleteOrder: jest.fn().mockReturnValueOnce(Promise.resolve())
      };
      const response = await request(makeApp(service))
        .delete('/order')
        .send({ id: 12345 });

      expect(response.status).toBe(200);
      expect(service.deleteOrder).toBeCalledWith(12345);
    });
  });
});

describe('/stats', () => {
  it(`GET should display how often each item
  has been ordered, in descending order`, async () => {
    const service = {
      stats: jest
        .fn()
        .mockReturnValueOnce(Promise.resolve([{ a: 1 }, { b: 2 }, { c: 3 }]))
    };
    const response = await request(makeApp(service))
      .get('/stats')
      .send();
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      items: expect.arrayContaining([{ a: 1 }, { b: 2 }, { c: 3 }])
    });
  });
});

describe('/company', () => {
  it(`GET should get company info`, async () => {
    const service = {
      company: {
        get: jest.fn(() =>
          Promise.resolve({ companyName: 'State Street', foo: 'bar' })
        )
      }
    };
    const response = await request(makeApp(service))
      .get(`/company?name=${encodeURIComponent('State Street')}`)
      .send();
    expect(service.company.get).toHaveBeenCalledWith('State Street');
    expect(response.body).toEqual({
      companyName: 'State Street',
      foo: 'bar'
    });
  });
  it(`PUT should update company info`, async () => {
    const service = {
      company: {
        update: jest.fn(() => Promise.resolve())
      }
    };
    const response = await request(makeApp(service))
      .put(`/company`)
      .send({
        companyName: 'Atlassian',
        info: {
          foobar: 'qwerty'
        }
      });
    expect(service.company.update).toHaveBeenCalledWith('Atlassian', {
      foobar: 'qwerty'
    });
  });
  it(`DELETE should delete company info`, async () => {
    const service = {
      company: {
        delete: jest.fn(() => Promise.resolve())
      }
    };
    const response = await request(makeApp(service))
      .delete(`/company`)
      .send({
        companyName: 'GitHub'
      });
    expect(service.company.delete).toHaveBeenCalledWith('GitHub');
  });
});

test('GET /company/orders should return all orders bought by a company', async () => {
  const service = {
    ordersByCompany: jest.fn(() =>
      Promise.resolve([
        {
          companyName: 'BorderGuru',
          orderItem: 'QWER',
          price: 100
        }
      ])
    )
  };
  const response = await request(makeApp(service))
    .get(`/company/orders?name=${encodeURIComponent('BorderGuru')}`)
    .send();
  expect(response.body.items).toEqual(
    expect.arrayContaining([
      {
        companyName: 'BorderGuru',
        orderItem: 'QWER',
        price: 100
      }
    ])
  );
  expect(service.ordersByCompany).toHaveBeenCalledWith('BorderGuru');
});

test('GET /company/paid should get the amount of money paid by a company', async () => {
  const service = {
    company: {
      paid: jest.fn(() =>
        Promise.resolve({
          amount: 1337
        })
      )
    }
  };
  const response = await request(makeApp(service))
    .get(`/company/paid?name=${encodeURIComponent('Foobar')}`)
    .send();
  expect(response.body.amount).toEqual(1337);
  expect(service.company.paid).toHaveBeenCalledWith('Foobar');
});

test('GET /order/companies should get et all companies that bought a certain orderItem', async () => {
  const service = {
    companiesByOrder: jest.fn(() =>
      Promise.resolve([
        {
          companyName: 'BorderGuru',
          foo: 'bar'
        },
        {
          companyName: 'Brain.fm',
          qwerty: 42
        }
      ])
    )
  };
  const response = await request(makeApp(service))
    .get(`/order/companies?name=${encodeURIComponent('An Order Item')}`)
    .send();
  expect(response.body.items).toEqual(
    expect.arrayContaining([
      {
        companyName: 'BorderGuru',
        foo: 'bar'
      },
      {
        companyName: 'Brain.fm',
        qwerty: 42
      }
    ])
  );
  expect(service.companiesByOrder).toHaveBeenCalledWith('An Order Item');
});
