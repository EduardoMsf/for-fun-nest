import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { PrismaModule } from '../src/prisma/prisma.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { ProductsModule } from '../src/products/products.module';

const baseProduct = {
  id: 'p1',
  title: 'Test Shirt',
  description: 'A great shirt',
  slug: 'test-shirt',
  price: 49.99,
  inStock: 10,
  size: ['S', 'M', 'L'],
  tags: ['shirt'],
  gender: 'men',
  categoryId: 'cat1',
  productImages: [{ url: 'front.jpg', id: 1 }],
  category: { id: 'cat1', name: 'Shirts' },
};

const mockPrisma = {
  product: {
    create: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
};

describe('Products (integration)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [PrismaModule, ProductsModule],
    })
      .overrideProvider(PrismaService)
      .useValue(mockPrisma)
      .compile();

    app = module.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => jest.clearAllMocks());

  describe('GET /products', () => {
    it('returns 200 with paginated product list', async () => {
      mockPrisma.product.findMany.mockResolvedValue([baseProduct]);
      mockPrisma.product.count.mockResolvedValue(1);

      await request(app.getHttpServer())
        .get('/products')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('currentPage', 1);
          expect(res.body).toHaveProperty('totalPages', 1);
          expect(res.body.products).toHaveLength(1);
        });
    });

    it('accepts gender query parameter', async () => {
      mockPrisma.product.findMany.mockResolvedValue([]);
      mockPrisma.product.count.mockResolvedValue(0);

      await request(app.getHttpServer())
        .get('/products?gender=men')
        .expect(200);

      expect(mockPrisma.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { gender: 'men' } }),
      );
    });

    it('applies skip based on page query param', async () => {
      mockPrisma.product.findMany.mockResolvedValue([]);
      mockPrisma.product.count.mockResolvedValue(0);

      await request(app.getHttpServer())
        .get('/products?page=2&take=5')
        .expect(200);

      expect(mockPrisma.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 5, take: 5 }),
      );
    });
  });

  describe('GET /products/:id', () => {
    it('returns 200 with the product', async () => {
      mockPrisma.product.findUnique.mockResolvedValue(baseProduct);

      await request(app.getHttpServer())
        .get('/products/p1')
        .expect(200)
        .expect((res) => {
          expect(res.body.title).toBe('Test Shirt');
        });
    });

    it('returns 404 when product does not exist', async () => {
      mockPrisma.product.findUnique.mockResolvedValue(null);

      await request(app.getHttpServer())
        .get('/products/missing')
        .expect(404);
    });
  });

  describe('GET /products/slug/:slug', () => {
    it('returns 200 with the product by slug', async () => {
      mockPrisma.product.findFirst.mockResolvedValue(baseProduct);

      await request(app.getHttpServer())
        .get('/products/slug/test-shirt')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('images');
          expect(res.body).toHaveProperty('sizes');
        });
    });

    it('returns 404 when slug does not exist', async () => {
      mockPrisma.product.findFirst.mockResolvedValue(null);

      await request(app.getHttpServer())
        .get('/products/slug/unknown')
        .expect(404);
    });
  });

  describe('GET /products/slug/:slug/stock', () => {
    it('returns 200 with inStock value', async () => {
      mockPrisma.product.findFirst.mockResolvedValue({ inStock: 7 });

      await request(app.getHttpServer())
        .get('/products/slug/test-shirt/stock')
        .expect(200)
        .expect((res) => {
          expect(res.body).toEqual({ inStock: 7 });
        });
    });

    it('returns 404 when slug not found', async () => {
      mockPrisma.product.findFirst.mockResolvedValue(null);

      await request(app.getHttpServer())
        .get('/products/slug/unknown/stock')
        .expect(404);
    });
  });

  describe('POST /products', () => {
    it('returns 201 with the created product', async () => {
      mockPrisma.product.create.mockResolvedValue({ ...baseProduct, id: 'p2', title: 'New Hoodie' });

      await request(app.getHttpServer())
        .post('/products')
        .send({ title: 'New Hoodie', description: 'A hoodie', slug: 'new-hoodie', inStock: 5, gender: 'men', categoryId: 'cat1' })
        .expect(201)
        .expect((res) => {
          expect(res.body.title).toBe('New Hoodie');
        });
    });

    it('returns 400 when required fields are missing', async () => {
      await request(app.getHttpServer())
        .post('/products')
        .send({ title: 'Incomplete' })
        .expect(400);
    });
  });

  describe('PATCH /products/:id', () => {
    it('returns 200 with the updated product', async () => {
      mockPrisma.product.findUnique.mockResolvedValue(baseProduct);
      mockPrisma.product.update.mockResolvedValue({ ...baseProduct, price: 59.99 });

      await request(app.getHttpServer())
        .patch('/products/p1')
        .send({ price: 59.99 })
        .expect(200)
        .expect((res) => {
          expect(res.body.price).toBe(59.99);
        });
    });

    it('returns 404 when product does not exist', async () => {
      mockPrisma.product.findUnique.mockResolvedValue(null);

      await request(app.getHttpServer())
        .patch('/products/missing')
        .send({ price: 10 })
        .expect(404);
    });
  });

  describe('DELETE /products/:id', () => {
    it('returns 200 when product is deleted', async () => {
      mockPrisma.product.findUnique.mockResolvedValue(baseProduct);
      mockPrisma.product.delete.mockResolvedValue(baseProduct);

      await request(app.getHttpServer())
        .delete('/products/p1')
        .expect(200);
    });

    it('returns 404 when product does not exist', async () => {
      mockPrisma.product.findUnique.mockResolvedValue(null);

      await request(app.getHttpServer())
        .delete('/products/missing')
        .expect(404);
    });
  });
});
