import { Test, TestingModule } from '@nestjs/testing';
import { OrderItemsController } from './order-items.controller';
import { OrderItemsService } from './order-items.service';

const mockService = { create: jest.fn(), findAll: jest.fn(), findOne: jest.fn(), update: jest.fn(), remove: jest.fn() };

describe('OrderItemsController', () => {
  let controller: OrderItemsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrderItemsController],
      providers: [{ provide: OrderItemsService, useValue: mockService }],
    }).compile();
    controller = module.get(OrderItemsController);
    jest.clearAllMocks();
  });

  it('create delegates to service', () => { controller.create({ quantity: 1, price: 50, size: 'M' as never, orderId: 'o1', productId: 'p1' }); expect(mockService.create).toHaveBeenCalled(); });
  it('findAll delegates to service', () => { controller.findAll(); expect(mockService.findAll).toHaveBeenCalled(); });
  it('findOne delegates to service', () => { controller.findOne('i1'); expect(mockService.findOne).toHaveBeenCalledWith('i1'); });
  it('update delegates to service', () => { controller.update('i1', { quantity: 2 }); expect(mockService.update).toHaveBeenCalledWith('i1', { quantity: 2 }); });
  it('remove delegates to service', () => { controller.remove('i1'); expect(mockService.remove).toHaveBeenCalledWith('i1'); });
});
