import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { OrderItemsService } from './order-items.service';

const mockPrisma = {
  orderItem: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
};

const item = { id: 'i1', quantity: 2, price: 50, size: 'M', orderId: 'o1', productId: 'p1' };

describe('OrderItemsService', () => {
  let service: OrderItemsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OrderItemsService, { provide: PrismaService, useValue: mockPrisma }],
    }).compile();
    service = module.get(OrderItemsService);
    jest.clearAllMocks();
  });

  it('create delegates to prisma', () => {
    mockPrisma.orderItem.create.mockResolvedValue(item);
    service.create({ quantity: 2, price: 50, size: 'M' as never, orderId: 'o1', productId: 'p1' });
    expect(mockPrisma.orderItem.create).toHaveBeenCalled();
  });

  it('findAll returns all items', async () => {
    mockPrisma.orderItem.findMany.mockResolvedValue([item]);
    expect(await service.findAll()).toHaveLength(1);
  });

  it('findOne returns the item', async () => {
    mockPrisma.orderItem.findUnique.mockResolvedValue(item);
    expect(await service.findOne('i1')).toEqual(item);
  });

  it('findOne throws NotFoundException when not found', async () => {
    mockPrisma.orderItem.findUnique.mockResolvedValue(null);
    await expect(service.findOne('missing')).rejects.toThrow(NotFoundException);
  });

  it('update calls findOne then updates', async () => {
    mockPrisma.orderItem.findUnique.mockResolvedValue(item);
    mockPrisma.orderItem.update.mockResolvedValue({ ...item, quantity: 3 });
    await service.update('i1', { quantity: 3 });
    expect(mockPrisma.orderItem.update).toHaveBeenCalledWith({ where: { id: 'i1' }, data: { quantity: 3 } });
  });

  it('update throws NotFoundException when not found', async () => {
    mockPrisma.orderItem.findUnique.mockResolvedValue(null);
    await expect(service.update('missing', {})).rejects.toThrow(NotFoundException);
  });

  it('remove deletes the item', async () => {
    mockPrisma.orderItem.findUnique.mockResolvedValue(item);
    mockPrisma.orderItem.delete.mockResolvedValue(item);
    await service.remove('i1');
    expect(mockPrisma.orderItem.delete).toHaveBeenCalledWith({ where: { id: 'i1' } });
  });

  it('remove throws NotFoundException when not found', async () => {
    mockPrisma.orderItem.findUnique.mockResolvedValue(null);
    await expect(service.remove('missing')).rejects.toThrow(NotFoundException);
  });
});
