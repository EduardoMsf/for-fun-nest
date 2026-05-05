import { Test, TestingModule } from '@nestjs/testing';
import { OrderAddressesController } from './order-addresses.controller';
import { OrderAddressesService } from './order-addresses.service';

const mockService = { create: jest.fn(), findAll: jest.fn(), findOne: jest.fn(), update: jest.fn(), remove: jest.fn() };

const dto = { firstName: 'Jane', lastName: 'Doe', address: '123', postalCode: '10001', city: 'NY', phone: '+1', countryId: 'US', orderId: 'o1' };

describe('OrderAddressesController', () => {
  let controller: OrderAddressesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrderAddressesController],
      providers: [{ provide: OrderAddressesService, useValue: mockService }],
    }).compile();
    controller = module.get(OrderAddressesController);
    jest.clearAllMocks();
  });

  it('create delegates to service', () => { controller.create(dto); expect(mockService.create).toHaveBeenCalled(); });
  it('findAll delegates to service', () => { controller.findAll(); expect(mockService.findAll).toHaveBeenCalled(); });
  it('findOne delegates to service', () => { controller.findOne('oa1'); expect(mockService.findOne).toHaveBeenCalledWith('oa1'); });
  it('update delegates to service', () => { controller.update('oa1', { city: 'LA' }); expect(mockService.update).toHaveBeenCalledWith('oa1', { city: 'LA' }); });
  it('remove delegates to service', () => { controller.remove('oa1'); expect(mockService.remove).toHaveBeenCalledWith('oa1'); });
});
