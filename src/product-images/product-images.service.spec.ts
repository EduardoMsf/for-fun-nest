import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { ProductImagesService } from './product-images.service';

const mockPrisma = {
  productImage: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
};

const image = { id: 1, url: 'front.jpg', productId: 'p1', product: { slug: 'test-shirt' } };

describe('ProductImagesService', () => {
  let service: ProductImagesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProductImagesService, { provide: PrismaService, useValue: mockPrisma }],
    }).compile();
    service = module.get(ProductImagesService);
    jest.clearAllMocks();
  });

  it('create delegates to prisma', () => {
    mockPrisma.productImage.create.mockResolvedValue(image);
    service.create({ url: 'front.jpg', productId: 'p1' });
    expect(mockPrisma.productImage.create).toHaveBeenCalledWith({ data: { url: 'front.jpg', productId: 'p1' } });
  });

  it('findAll returns all images', async () => {
    mockPrisma.productImage.findMany.mockResolvedValue([image]);
    expect(await service.findAll()).toHaveLength(1);
  });

  it('findOne returns the image', async () => {
    mockPrisma.productImage.findUnique.mockResolvedValue(image);
    expect(await service.findOne(1)).toEqual(image);
  });

  it('findOne throws NotFoundException when not found', async () => {
    mockPrisma.productImage.findUnique.mockResolvedValue(null);
    await expect(service.findOne(99)).rejects.toThrow(NotFoundException);
  });

  it('update calls findOne then updates', async () => {
    mockPrisma.productImage.findUnique.mockResolvedValue(image);
    mockPrisma.productImage.update.mockResolvedValue({ ...image, url: 'back.jpg' });
    await service.update(1, { url: 'back.jpg' });
    expect(mockPrisma.productImage.update).toHaveBeenCalledWith({ where: { id: 1 }, data: { url: 'back.jpg' } });
  });

  it('update throws NotFoundException when not found', async () => {
    mockPrisma.productImage.findUnique.mockResolvedValue(null);
    await expect(service.update(99, {})).rejects.toThrow(NotFoundException);
  });

  it('remove deletes and includes product slug', async () => {
    mockPrisma.productImage.findUnique.mockResolvedValue(image);
    mockPrisma.productImage.delete.mockResolvedValue(image);
    await service.remove(1);
    expect(mockPrisma.productImage.delete).toHaveBeenCalledWith({
      where: { id: 1 },
      include: { product: { select: { slug: true } } },
    });
  });

  it('remove throws NotFoundException when not found', async () => {
    mockPrisma.productImage.findUnique.mockResolvedValue(null);
    await expect(service.remove(99)).rejects.toThrow(NotFoundException);
  });
});
