import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Gender } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ProductsService } from './products.service';

const baseProduct = {
  id: 'p1',
  title: 'Test Shirt',
  description: 'A shirt',
  slug: 'test-shirt',
  price: 49.99,
  inStock: 10,
  size: ['S', 'M', 'L'],
  tags: ['shirt'],
  gender: 'men' as Gender,
  categoryId: 'cat1',
  productImages: [{ url: 'front.jpg', id: 1 }, { url: 'back.jpg', id: 2 }],
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

describe('ProductsService', () => {
  let service: ProductsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('delegates to prisma.product.create', () => {
      const dto = { title: 'New', description: 'd', slug: 'new', inStock: 5, gender: 'men' as Gender, categoryId: 'cat1' };
      mockPrisma.product.create.mockResolvedValue({ id: 'p2', ...dto });
      service.create(dto);
      expect(mockPrisma.product.create).toHaveBeenCalledWith({ data: dto });
    });
  });

  describe('findAll', () => {
    it('returns paginated products with images and sizes', async () => {
      mockPrisma.product.findMany.mockResolvedValue([baseProduct]);
      mockPrisma.product.count.mockResolvedValue(1);

      const result = await service.findAll({ page: 1, take: 12 });

      expect(result.currentPage).toBe(1);
      expect(result.totalPages).toBe(1);
      expect(result.products[0]).toHaveProperty('images');
      expect(result.products[0]).toHaveProperty('sizes');
      expect(result.products[0]).not.toHaveProperty('productImages');
      expect(result.products[0]).not.toHaveProperty('size');
    });

    it('applies gender filter when provided', async () => {
      mockPrisma.product.findMany.mockResolvedValue([]);
      mockPrisma.product.count.mockResolvedValue(0);

      await service.findAll({ gender: 'women' as Gender });

      expect(mockPrisma.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { gender: 'women' } }),
      );
    });

    it('calculates totalPages correctly', async () => {
      mockPrisma.product.findMany.mockResolvedValue([]);
      mockPrisma.product.count.mockResolvedValue(25);

      const result = await service.findAll({ page: 1, take: 12 });
      expect(result.totalPages).toBe(3);
    });

    it('uses skip based on page number', async () => {
      mockPrisma.product.findMany.mockResolvedValue([]);
      mockPrisma.product.count.mockResolvedValue(0);

      await service.findAll({ page: 3, take: 10 });

      expect(mockPrisma.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 20, take: 10 }),
      );
    });
  });

  describe('findOne', () => {
    it('returns product when found', async () => {
      mockPrisma.product.findUnique.mockResolvedValue(baseProduct);
      const result = await service.findOne('p1');
      expect(result).toEqual(baseProduct);
    });

    it('throws NotFoundException when product does not exist', async () => {
      mockPrisma.product.findUnique.mockResolvedValue(null);
      await expect(service.findOne('missing')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findBySlug', () => {
    it('returns transformed product with images and sizes', async () => {
      mockPrisma.product.findFirst.mockResolvedValue(baseProduct);
      const result = await service.findBySlug('test-shirt');
      expect(result).toHaveProperty('images');
      expect(result).toHaveProperty('sizes');
    });

    it('throws NotFoundException when slug not found', async () => {
      mockPrisma.product.findFirst.mockResolvedValue(null);
      await expect(service.findBySlug('unknown')).rejects.toThrow(NotFoundException);
    });
  });

  describe('getStockBySlug', () => {
    it('returns inStock value', async () => {
      mockPrisma.product.findFirst.mockResolvedValue({ inStock: 7 });
      const result = await service.getStockBySlug('test-shirt');
      expect(result).toEqual({ inStock: 7 });
    });

    it('throws NotFoundException when slug not found', async () => {
      mockPrisma.product.findFirst.mockResolvedValue(null);
      await expect(service.getStockBySlug('unknown')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('updates product after verifying it exists', async () => {
      mockPrisma.product.findUnique.mockResolvedValue(baseProduct);
      mockPrisma.product.update.mockResolvedValue({ ...baseProduct, title: 'Updated' });

      const result = await service.update('p1', { title: 'Updated' });

      expect(mockPrisma.product.update).toHaveBeenCalledWith({ where: { id: 'p1' }, data: { title: 'Updated' } });
      expect(result.title).toBe('Updated');
    });

    it('throws NotFoundException when product does not exist', async () => {
      mockPrisma.product.findUnique.mockResolvedValue(null);
      await expect(service.update('missing', {})).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('deletes product after verifying it exists', async () => {
      mockPrisma.product.findUnique.mockResolvedValue(baseProduct);
      mockPrisma.product.delete.mockResolvedValue(baseProduct);

      await service.remove('p1');
      expect(mockPrisma.product.delete).toHaveBeenCalledWith({ where: { id: 'p1' } });
    });

    it('throws NotFoundException when product does not exist', async () => {
      mockPrisma.product.findUnique.mockResolvedValue(null);
      await expect(service.remove('missing')).rejects.toThrow(NotFoundException);
    });
  });
});
