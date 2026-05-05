process.env.JWT_SECRET = 'test-secret-32-chars-for-testing!!';

import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { JwtAuthGuard } from '../src/auth/jwt-auth.guard';
import { OrdersModule } from '../src/orders/orders.module';
import { PrismaModule } from '../src/prisma/prisma.module';
import { PrismaService } from '../src/prisma/prisma.service';

const testUser = { id: 'u1', email: 'test@example.com', name: 'Test User', role: 'user', image: null };

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
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  OrderAddress: { firstName: 'Jane', lastName: 'Doe' },
  OrderItem: [],
};

const sampleProduct = { id: 'prod1', title: 'Test Shirt', price: 50, inStock: 10 };

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

describe('Orders (integration)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [PrismaModule, OrdersModule],
    })
      .overrideProvider(PrismaService)
      .useValue(mockPrisma)
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActivate: (context: { switchToHttp: () => { getRequest: () => Record<string, unknown> } }) => {
          context.switchToHttp().getRequest().user = testUser;
          return true;
        },
      })
      .compile();

    app = module.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockTx.product.update.mockResolvedValue({ ...sampleProduct, inStock: 8 });
    mockTx.order.create.mockResolvedValue({ id: 'ord2', isPaid: false });
    mockTx.orderAddress.create.mockResolvedValue({});
  });

  describe('GET /orders', () => {
    it('returns 200 with all orders', async () => {
      mockPrisma.order.findMany.mockResolvedValue([sampleOrder]);

      await request(app.getHttpServer())
        .get('/orders')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveLength(1);
        });
    });
  });

  describe('GET /orders/:id', () => {
    it('returns 200 with the order', async () => {
      mockPrisma.order.findUnique.mockResolvedValue(sampleOrder);

      await request(app.getHttpServer())
        .get('/orders/ord1')
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toBe('ord1');
        });
    });

    it('returns 404 when order does not exist', async () => {
      mockPrisma.order.findUnique.mockResolvedValue(null);

      await request(app.getHttpServer())
        .get('/orders/missing')
        .expect(404);
    });
  });

  describe('GET /orders/user/:userId', () => {
    it('returns 200 with orders for the user', async () => {
      mockPrisma.order.findMany.mockResolvedValue([sampleOrder]);

      await request(app.getHttpServer())
        .get('/orders/user/u1')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveLength(1);
        });
    });
  });

  describe('POST /orders/place', () => {
    const placeOrderBody = {
      items: [{ productId: 'prod1', quantity: 2, size: 'M' }],
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

    it('returns 201 with the placed order', async () => {
      mockPrisma.product.findMany.mockResolvedValue([sampleProduct]);

      await request(app.getHttpServer())
        .post('/orders/place')
        .send(placeOrderBody)
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('order');
        });
    });

    it('returns 400 when a product does not exist', async () => {
      mockPrisma.product.findMany.mockResolvedValue([]);

      await request(app.getHttpServer())
        .post('/orders/place')
        .send(placeOrderBody)
        .expect(400);
    });

    it('returns 400 when items array is missing', async () => {
      await request(app.getHttpServer())
        .post('/orders/place')
        .send({ address: placeOrderBody.address })
        .expect(400);
    });
  });

  describe('PATCH /orders/:id/transaction', () => {
    it('returns 200 after setting transactionId', async () => {
      mockPrisma.order.findUnique.mockResolvedValue(sampleOrder);
      mockPrisma.order.update.mockResolvedValue({ ...sampleOrder, transactionId: 'paypal-tx-1' });

      await request(app.getHttpServer())
        .patch('/orders/ord1/transaction')
        .send({ transactionId: 'paypal-tx-1' })
        .expect(200);
    });
  });

  describe('DELETE /orders/:id', () => {
    it('returns 200 when order is deleted', async () => {
      mockPrisma.order.findUnique.mockResolvedValue(sampleOrder);
      mockPrisma.order.delete.mockResolvedValue(sampleOrder);

      await request(app.getHttpServer())
        .delete('/orders/ord1')
        .expect(200);
    });

    it('returns 404 when order does not exist', async () => {
      mockPrisma.order.findUnique.mockResolvedValue(null);

      await request(app.getHttpServer())
        .delete('/orders/missing')
        .expect(404);
    });
  });
});
