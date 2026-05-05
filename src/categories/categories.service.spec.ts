import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { CategoriesService } from './categories.service';

const mockPrisma = {
  category: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
};

const cat = { id: 'c1', name: 'Shirts' };

describe('CategoriesService', () => {
  let service: CategoriesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CategoriesService, { provide: PrismaService, useValue: mockPrisma }],
    }).compile();
    service = module.get(CategoriesService);
    jest.clearAllMocks();
  });

  it('create delegates to prisma', () => {
    mockPrisma.category.create.mockResolvedValue(cat);
    service.create({ name: 'Shirts' });
    expect(mockPrisma.category.create).toHaveBeenCalledWith({ data: { name: 'Shirts' } });
  });

  it('findAll returns all categories', async () => {
    mockPrisma.category.findMany.mockResolvedValue([cat]);
    const result = await service.findAll();
    expect(result).toHaveLength(1);
  });

  it('findOne returns the category', async () => {
    mockPrisma.category.findUnique.mockResolvedValue(cat);
    expect(await service.findOne('c1')).toEqual(cat);
  });

  it('findOne throws NotFoundException when not found', async () => {
    mockPrisma.category.findUnique.mockResolvedValue(null);
    await expect(service.findOne('missing')).rejects.toThrow(NotFoundException);
  });

  it('update calls findOne then updates', async () => {
    mockPrisma.category.findUnique.mockResolvedValue(cat);
    mockPrisma.category.update.mockResolvedValue({ ...cat, name: 'Updated' });
    await service.update('c1', { name: 'Updated' });
    expect(mockPrisma.category.update).toHaveBeenCalledWith({ where: { id: 'c1' }, data: { name: 'Updated' } });
  });

  it('update throws NotFoundException when category not found', async () => {
    mockPrisma.category.findUnique.mockResolvedValue(null);
    await expect(service.update('missing', { name: 'x' })).rejects.toThrow(NotFoundException);
  });

  it('remove deletes the category', async () => {
    mockPrisma.category.findUnique.mockResolvedValue(cat);
    mockPrisma.category.delete.mockResolvedValue(cat);
    await service.remove('c1');
    expect(mockPrisma.category.delete).toHaveBeenCalledWith({ where: { id: 'c1' } });
  });

  it('remove throws NotFoundException when not found', async () => {
    mockPrisma.category.findUnique.mockResolvedValue(null);
    await expect(service.remove('missing')).rejects.toThrow(NotFoundException);
  });
});
