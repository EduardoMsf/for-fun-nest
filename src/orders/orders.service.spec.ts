import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Size } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { OrdersService } from './orders.service';

const mockTx = {
  product: { update: jest.fn() },
  order: { create: jest.fn() },
  orderAddress: { create: jest.fn() },
};

const mockPrisma = {
  $transaction: jest.fn().mockImplementation((fn: (tx: typeof mockTx) => Promise<unknown>) => fn(mockTx)),
  product: { findMany: jest.fn() },
  order: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
};

const sampleOrder = {
  id: 'ord1',
  userId: 'u1',
  subTotal: 100,
  tax: 15,
  total: 115,
  itemsInOrder: 2,
  isPaid: false,
  paidAt: null,
  transactionId: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  OrderAddress: null,
  OrderItem: [],
};

const sampleProduct = {
  id: 'prod1',
  title: 'Test Shirt',
  price: 50,
  inStock: 10,
};

const placeOrderDto = {
  items: [{ productId: 'prod1', quantity: 2, size: 'M' as Size }],
  address: {
    firstName: 'Jane',
    lastName: 'Doe',
    address: '123 Main St',
    postalCode: '10001',
    city: 'New York',
    phone: '+1 555 000',
    countryId: 'US',
  },
};

describe('OrdersService', () => {
  let service: OrdersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('returns all orders sorted by createdAt desc', async () => {
      mockPrisma.order.findMany.mockResolvedValue([sampleOrder]);
      const result = await service.findAll();
      expect(mockPrisma.order.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ orderBy: { createdAt: 'desc' } }),
      );
      expect(result).toHaveLength(1);
    });
  });

  describe('findOne', () => {
    it('returns order when found', async () => {
      mockPrisma.order.findUnique.mockResolvedValue(sampleOrder);
      const result = await service.findOne('ord1');
      expect(result).toEqual(sampleOrder);
    });

    it('throws NotFoundException when order does not exist', async () => {
      mockPrisma.order.findUnique.mockResolvedValue(null);
      await expect(service.findOne('missing')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByUser', () => {
    it('returns orders filtered by userId', async () => {
      mockPrisma.order.findMany.mockResolvedValue([sampleOrder]);
      const result = await service.findByUser('u1');
      expect(mockPrisma.order.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { userId: 'u1' } }),
      );
      expect(result).toHaveLength(1);
    });
  });

  describe('placeOrder', () => {
    beforeEach(() => {
      mockPrisma.product.findMany.mockResolvedValue([sampleProduct]);
      mockTx.product.update.mockResolvedValue({ ...sampleProduct, inStock: 8 });
      mockTx.order.create.mockResolvedValue({ id: 'ord2', isPaid: false });
      mockTx.orderAddress.create.mockResolvedValue({});
    });

    it('calculates subtotal, tax (15%), total, and itemsInOrder correctly', async () => {
      await service.placeOrder('u1', placeOrderDto);

      const callData = mockTx.order.create.mock.calls[0][0].data;
      expect(callData.subTotal).toBe(100);
      expect(callData.tax).toBe(15);
      expect(callData.total).toBeCloseTo(115, 5);
      expect(callData.itemsInOrder).toBe(2);
    });

    it('creates order address inside the transaction', async () => {
      await service.placeOrder('u1', placeOrderDto);
      expect(mockTx.orderAddress.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ firstName: 'Jane', orderId: 'ord2' }),
        }),
      );
    });

    it('decrements stock for each item', async () => {
      await service.placeOrder('u1', placeOrderDto);
      expect(mockTx.product.update).toHaveBeenCalledWith({
        where: { id: 'prod1' },
        data: { inStock: { decrement: 2 } },
      });
    });

    it('throws BadRequestException when a product does not exist', async () => {
      mockPrisma.product.findMany.mockResolvedValue([]);
      await expect(service.placeOrder('u1', placeOrderDto)).rejects.toThrow(BadRequestException);
    });

    it('throws BadRequestException when stock goes negative', async () => {
      mockTx.product.update.mockResolvedValue({ ...sampleProduct, inStock: -1 });
      await expect(service.placeOrder('u1', placeOrderDto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('setTransaction', () => {
    it('sets the transactionId on the order', async () => {
      mockPrisma.order.findUnique.mockResolvedValue(sampleOrder);
      mockPrisma.order.update.mockResolvedValue({ ...sampleOrder, transactionId: 'paypal-tx-1' });

      await service.setTransaction('ord1', { transactionId: 'paypal-tx-1' });

      expect(mockPrisma.order.update).toHaveBeenCalledWith({
        where: { id: 'ord1' },
        data: { transactionId: 'paypal-tx-1' },
      });
    });

    it('throws NotFoundException when order does not exist', async () => {
      mockPrisma.order.findUnique.mockResolvedValue(null);
      await expect(service.setTransaction('missing', { transactionId: 'tx' })).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('deletes order after verifying it exists', async () => {
      mockPrisma.order.findUnique.mockResolvedValue(sampleOrder);
      mockPrisma.order.delete.mockResolvedValue(sampleOrder);

      await service.remove('ord1');
      expect(mockPrisma.order.delete).toHaveBeenCalledWith({ where: { id: 'ord1' } });
    });

    it('throws NotFoundException when order does not exist', async () => {
      mockPrisma.order.findUnique.mockResolvedValue(null);
      await expect(service.remove('missing')).rejects.toThrow(NotFoundException);
    });
  });
});
