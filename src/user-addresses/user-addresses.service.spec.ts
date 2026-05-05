import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { UserAddressesService } from './user-addresses.service';

const mockPrisma = {
  userAddress: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    upsert: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
};

const addr = { id: 'a1', userId: 'u1', firstName: 'Jane', lastName: 'Doe', address: '123 Main', postalCode: '10001', city: 'NY', phone: '+1', countryId: 'US' };

describe('UserAddressesService', () => {
  let service: UserAddressesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserAddressesService, { provide: PrismaService, useValue: mockPrisma }],
    }).compile();
    service = module.get(UserAddressesService);
    jest.clearAllMocks();
  });

  it('create delegates to prisma', () => {
    mockPrisma.userAddress.create.mockResolvedValue(addr);
    service.create({ userId: 'u1', firstName: 'Jane', lastName: 'Doe', address: '123 Main', postalCode: '10001', city: 'NY', phone: '+1', countryId: 'US' });
    expect(mockPrisma.userAddress.create).toHaveBeenCalled();
  });

  it('findAll returns all addresses', async () => {
    mockPrisma.userAddress.findMany.mockResolvedValue([addr]);
    expect(await service.findAll()).toHaveLength(1);
  });

  it('findOne returns the address', async () => {
    mockPrisma.userAddress.findUnique.mockResolvedValue(addr);
    expect(await service.findOne('a1')).toEqual(addr);
  });

  it('findOne throws NotFoundException when not found', async () => {
    mockPrisma.userAddress.findUnique.mockResolvedValue(null);
    await expect(service.findOne('missing')).rejects.toThrow(NotFoundException);
  });

  it('findByUserId delegates to prisma', () => {
    mockPrisma.userAddress.findUnique.mockResolvedValue(addr);
    service.findByUserId('u1');
    expect(mockPrisma.userAddress.findUnique).toHaveBeenCalledWith({ where: { userId: 'u1' } });
  });

  it('upsertByUserId delegates to prisma upsert', () => {
    mockPrisma.userAddress.upsert.mockResolvedValue(addr);
    const dto = { firstName: 'Jane', lastName: 'Doe', address: '123 Main', postalCode: '10001', city: 'NY', phone: '+1', countryId: 'US' };
    service.upsertByUserId('u1', dto);
    expect(mockPrisma.userAddress.upsert).toHaveBeenCalledWith({
      where: { userId: 'u1' },
      update: dto,
      create: { ...dto, userId: 'u1' },
    });
  });

  it('deleteByUserId deletes when address exists', async () => {
    mockPrisma.userAddress.findUnique.mockResolvedValue(addr);
    mockPrisma.userAddress.delete.mockResolvedValue(addr);
    await service.deleteByUserId('u1');
    expect(mockPrisma.userAddress.delete).toHaveBeenCalledWith({ where: { userId: 'u1' } });
  });

  it('deleteByUserId throws NotFoundException when not found', async () => {
    mockPrisma.userAddress.findUnique.mockResolvedValue(null);
    await expect(service.deleteByUserId('missing')).rejects.toThrow(NotFoundException);
  });

  it('update calls findOne then updates', async () => {
    mockPrisma.userAddress.findUnique.mockResolvedValue(addr);
    mockPrisma.userAddress.update.mockResolvedValue({ ...addr, city: 'LA' });
    await service.update('a1', { city: 'LA' });
    expect(mockPrisma.userAddress.update).toHaveBeenCalledWith({ where: { id: 'a1' }, data: { city: 'LA' } });
  });

  it('update throws NotFoundException when not found', async () => {
    mockPrisma.userAddress.findUnique.mockResolvedValue(null);
    await expect(service.update('missing', {})).rejects.toThrow(NotFoundException);
  });

  it('remove deletes the address', async () => {
    mockPrisma.userAddress.findUnique.mockResolvedValue(addr);
    mockPrisma.userAddress.delete.mockResolvedValue(addr);
    await service.remove('a1');
    expect(mockPrisma.userAddress.delete).toHaveBeenCalledWith({ where: { id: 'a1' } });
  });

  it('remove throws NotFoundException when not found', async () => {
    mockPrisma.userAddress.findUnique.mockResolvedValue(null);
    await expect(service.remove('missing')).rejects.toThrow(NotFoundException);
  });
});
