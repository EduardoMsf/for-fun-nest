import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as bcryptjs from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from './users.service';

const mockPrisma = {
  user: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
};

const baseUser = {
  id: 'u1',
  name: 'Alice',
  email: 'alice@example.com',
  role: 'user',
  image: null,
  emailVerified: null,
};

describe('UsersService', () => {
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('hashes the password before persisting', async () => {
      mockPrisma.user.create.mockResolvedValue(baseUser);
      const dto = { name: 'Alice', email: 'alice@example.com', password: 'plain123' };

      await service.create(dto);

      const data = mockPrisma.user.create.mock.calls[0][0].data;
      expect(data.password).not.toBe('plain123');
      expect(bcryptjs.compareSync('plain123', data.password)).toBe(true);
    });

    it('returns the created user without password', async () => {
      mockPrisma.user.create.mockResolvedValue(baseUser);
      const result = await service.create({ name: 'Alice', email: 'alice@example.com', password: 'plain' });
      expect(result).toEqual(baseUser);
    });
  });

  describe('findAll', () => {
    it('returns all users', async () => {
      mockPrisma.user.findMany.mockResolvedValue([baseUser]);
      const result = await service.findAll();
      expect(result).toHaveLength(1);
    });
  });

  describe('findOne', () => {
    it('returns user when found', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(baseUser);
      const result = await service.findOne('u1');
      expect(result).toEqual(baseUser);
    });

    it('throws NotFoundException when user does not exist', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      await expect(service.findOne('missing')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('hashes password when password is included in dto', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(baseUser);
      mockPrisma.user.update.mockResolvedValue({ ...baseUser, name: 'Updated' });

      await service.update('u1', { name: 'Updated', password: 'newpass' });

      const data = mockPrisma.user.update.mock.calls[0][0].data;
      expect(bcryptjs.compareSync('newpass', data.password)).toBe(true);
    });

    it('does not modify password when it is not in dto', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(baseUser);
      mockPrisma.user.update.mockResolvedValue({ ...baseUser, name: 'Updated' });

      await service.update('u1', { name: 'Updated' });

      const data = mockPrisma.user.update.mock.calls[0][0].data;
      expect(data.password).toBeUndefined();
    });

    it('throws NotFoundException when user does not exist', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      await expect(service.update('missing', { name: 'x' })).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('deletes user after verifying it exists', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(baseUser);
      mockPrisma.user.delete.mockResolvedValue(baseUser);

      await service.remove('u1');
      expect(mockPrisma.user.delete).toHaveBeenCalledWith({ where: { id: 'u1' } });
    });

    it('throws NotFoundException when user does not exist', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      await expect(service.remove('missing')).rejects.toThrow(NotFoundException);
    });
  });
});
