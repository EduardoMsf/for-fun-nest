import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { OrderAddressesService } from './order-addresses.service';

const mockPrisma = {
  orderAddress: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
};

const addr = { id: 'oa1', firstName: 'Jane', lastName: 'Doe', address: '123 Main', postalCode: '10001', city: 'NY', phone: '+1', countryId: 'US', orderId: 'o1' };

describe('OrderAddressesService', () => {
  let service: OrderAddressesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OrderAddressesService, { provide: PrismaService, useValue: mockPrisma }],
    }).compile();
    service = module.get(OrderAddressesService);
    jest.clearAllMocks();
  });

  it('create delegates to prisma', () => {
    mockPrisma.orderAddress.create.mockResolvedValue(addr);
    service.create({ firstName: 'Jane', lastName: 'Doe', address: '123 Main', postalCode: '10001', city: 'NY', phone: '+1', countryId: 'US', orderId: 'o1' });
    expect(mockPrisma.orderAddress.create).toHaveBeenCalled();
  });

  it('findAll returns all order addresses', async () => {
    mockPrisma.orderAddress.findMany.mockResolvedValue([addr]);
    expect(await service.findAll()).toHaveLength(1);
  });

  it('findOne returns the address', async () => {
    mockPrisma.orderAddress.findUnique.mockResolvedValue(addr);
    expect(await service.findOne('oa1')).toEqual(addr);
  });

  it('findOne throws NotFoundException when not found', async () => {
    mockPrisma.orderAddress.findUnique.mockResolvedValue(null);
    await expect(service.findOne('missing')).rejects.toThrow(NotFoundException);
  });

  it('update calls findOne then updates', async () => {
    mockPrisma.orderAddress.findUnique.mockResolvedValue(addr);
    mockPrisma.orderAddress.update.mockResolvedValue({ ...addr, city: 'LA' });
    await service.update('oa1', { city: 'LA' });
    expect(mockPrisma.orderAddress.update).toHaveBeenCalledWith({ where: { id: 'oa1' }, data: { city: 'LA' } });
  });

  it('update throws NotFoundException when not found', async () => {
    mockPrisma.orderAddress.findUnique.mockResolvedValue(null);
    await expect(service.update('missing', {})).rejects.toThrow(NotFoundException);
  });

  it('remove deletes the address', async () => {
    mockPrisma.orderAddress.findUnique.mockResolvedValue(addr);
    mockPrisma.orderAddress.delete.mockResolvedValue(addr);
    await service.remove('oa1');
    expect(mockPrisma.orderAddress.delete).toHaveBeenCalledWith({ where: { id: 'oa1' } });
  });

  it('remove throws NotFoundException when not found', async () => {
    mockPrisma.orderAddress.findUnique.mockResolvedValue(null);
    await expect(service.remove('missing')).rejects.toThrow(NotFoundException);
  });
});
