import { Test, TestingModule } from '@nestjs/testing';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';

const mockService = {
  create: jest.fn(),
  placeOrder: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  findByUser: jest.fn(),
  update: jest.fn(),
  setTransaction: jest.fn(),
  remove: jest.fn(),
};

const currentUser = { id: 'u1', email: 'test@example.com', name: 'Test', role: 'user', image: null };

describe('OrdersController', () => {
  let controller: OrdersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrdersController],
      providers: [{ provide: OrdersService, useValue: mockService }],
    }).compile();
    controller = module.get(OrdersController);
    jest.clearAllMocks();
  });

  it('create delegates to OrdersService.create', () => {
    controller.create({ subTotal: 100, tax: 15, total: 115, itemsInOrder: 2, userId: 'u1' });
    expect(mockService.create).toHaveBeenCalled();
  });

  it('placeOrder passes currentUser.id to OrdersService.placeOrder', () => {
    const dto = { items: [], address: {} as never };
    controller.placeOrder(currentUser, dto);
    expect(mockService.placeOrder).toHaveBeenCalledWith('u1', dto);
  });

  it('findAll delegates to OrdersService.findAll', () => {
    controller.findAll();
    expect(mockService.findAll).toHaveBeenCalled();
  });

  it('findOne delegates to OrdersService.findOne', () => {
    controller.findOne('o1');
    expect(mockService.findOne).toHaveBeenCalledWith('o1');
  });

  it('findByUser delegates to OrdersService.findByUser', () => {
    controller.findByUser('u1');
    expect(mockService.findByUser).toHaveBeenCalledWith('u1');
  });

  it('update delegates to OrdersService.update', () => {
    controller.update('o1', { isPaid: true });
    expect(mockService.update).toHaveBeenCalledWith('o1', { isPaid: true });
  });

  it('setTransaction delegates to OrdersService.setTransaction', () => {
    controller.setTransaction('o1', { transactionId: 'tx-1' });
    expect(mockService.setTransaction).toHaveBeenCalledWith('o1', { transactionId: 'tx-1' });
  });

  it('remove delegates to OrdersService.remove', () => {
    controller.remove('o1');
    expect(mockService.remove).toHaveBeenCalledWith('o1');
  });
});
