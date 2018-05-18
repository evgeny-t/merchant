/* global
  describe, it,
  expect, jest,
 */
const request = require('supertest');
const makeApp = require('./app');

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

describe('/new', () => {
  let app;
  let service;

  beforeEach(() => {
    service = {
      createOrders(items) {
        return Promise.resolve({ items });
      }
    };
    app = makeApp(service);
  });

  it('should reply with created items', async () => {
    const response = await request(app)
      .post('/new')
      .set('Content-Type', 'text/plain')
      .send(
        `001, SuperTrader, Steindamm 80, Macbook, 1700, EUR
        003, MegaCorp, Steindamm 80, Book "Guide to Hamburg", 20, EUR
        004, SuperTrader, Sternstrasse 125, Book "Cooking 101", 10, EUR
        `
      )
      .expect(200);

    expect(response.body.items.length).toBe(3);
    expect(response.body.items).toEqual(
      jest.arrayContaining([
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
