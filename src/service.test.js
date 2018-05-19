const makeService = require('./service');

describe('service', () => {
  describe('#createOrders', () => {
    it('should work', async () => {
      const service = await makeService();
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
});
