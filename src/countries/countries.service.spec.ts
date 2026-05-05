import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { CountriesService } from './countries.service';

const mockPrisma = {
  country: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
};

const country = { id: 'US', name: 'United States' };

describe('CountriesService', () => {
  let service: CountriesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CountriesService, { provide: PrismaService, useValue: mockPrisma }],
    }).compile();
    service = module.get(CountriesService);
    jest.clearAllMocks();
  });

  it('create delegates to prisma', () => {
    mockPrisma.country.create.mockResolvedValue(country);
    service.create({ id: 'US', name: 'United States' });
    expect(mockPrisma.country.create).toHaveBeenCalledWith({ data: { id: 'US', name: 'United States' } });
  });

  it('findAll returns all countries', async () => {
    mockPrisma.country.findMany.mockResolvedValue([country]);
    expect(await service.findAll()).toHaveLength(1);
  });

  it('findOne returns the country', async () => {
    mockPrisma.country.findUnique.mockResolvedValue(country);
    expect(await service.findOne('US')).toEqual(country);
  });

  it('findOne throws NotFoundException when not found', async () => {
    mockPrisma.country.findUnique.mockResolvedValue(null);
    await expect(service.findOne('XX')).rejects.toThrow(NotFoundException);
  });

  it('update calls findOne then updates', async () => {
    mockPrisma.country.findUnique.mockResolvedValue(country);
    mockPrisma.country.update.mockResolvedValue({ ...country, name: 'USA' });
    await service.update('US', { name: 'USA' });
    expect(mockPrisma.country.update).toHaveBeenCalledWith({ where: { id: 'US' }, data: { name: 'USA' } });
  });

  it('update throws NotFoundException when not found', async () => {
    mockPrisma.country.findUnique.mockResolvedValue(null);
    await expect(service.update('XX', {})).rejects.toThrow(NotFoundException);
  });

  it('remove deletes the country', async () => {
    mockPrisma.country.findUnique.mockResolvedValue(country);
    mockPrisma.country.delete.mockResolvedValue(country);
    await service.remove('US');
    expect(mockPrisma.country.delete).toHaveBeenCalledWith({ where: { id: 'US' } });
  });

  it('remove throws NotFoundException when not found', async () => {
    mockPrisma.country.findUnique.mockResolvedValue(null);
    await expect(service.remove('XX')).rejects.toThrow(NotFoundException);
  });
});
