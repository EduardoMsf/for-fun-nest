import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import * as bcryptjs from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { AuthService } from './auth.service';

const mockPrisma = {
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
  },
};

const mockJwt = {
  sign: jest.fn().mockReturnValue('signed-token'),
};

const HASHED = bcryptjs.hashSync('secret123', 10);

const dbUser = {
  id: 'u1',
  name: 'Test User',
  email: 'test@example.com',
  password: HASHED,
  role: 'user',
  image: null,
  emailVerified: null,
};

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: JwtService, useValue: mockJwt },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('returns token and user (without password) on valid credentials', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(dbUser);

      const result = await service.login({ email: 'TEST@EXAMPLE.COM', password: 'secret123' });

      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({ where: { email: 'test@example.com' } });
      expect(result.token).toBe('signed-token');
      expect(result.user).not.toHaveProperty('password');
      expect(result.user.email).toBe('test@example.com');
    });

    it('throws UnauthorizedException when user does not exist', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      await expect(service.login({ email: 'x@x.com', password: 'any' })).rejects.toThrow(UnauthorizedException);
    });

    it('throws UnauthorizedException when password is wrong', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ ...dbUser, password: bcryptjs.hashSync('other', 10) });
      await expect(service.login({ email: 'test@example.com', password: 'wrong' })).rejects.toThrow(UnauthorizedException);
    });

    it('normalises email to lowercase before lookup', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(dbUser);
      await service.login({ email: 'TEST@EXAMPLE.COM', password: 'secret123' });
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({ where: { email: 'test@example.com' } });
    });
  });

  describe('register', () => {
    const dto = { name: 'New User', email: 'NEW@EXAMPLE.COM', password: 'pass1234' };

    it('creates user with hashed password and returns token', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      mockPrisma.user.create.mockResolvedValue({
        id: 'u2', name: 'New User', email: 'new@example.com', password: 'hashed', role: 'user', image: null, emailVerified: null,
      });

      const result = await service.register(dto);

      const createCall = mockPrisma.user.create.mock.calls[0][0];
      expect(createCall.data.email).toBe('new@example.com');
      expect(bcryptjs.compareSync('pass1234', createCall.data.password)).toBe(true);
      expect(result.token).toBe('signed-token');
      expect(result.user).not.toHaveProperty('password');
    });

    it('throws BadRequestException when email already in use', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ id: 'u1' });
      await expect(service.register(dto)).rejects.toThrow(BadRequestException);
    });

    it('normalises email to lowercase', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      mockPrisma.user.create.mockResolvedValue({
        id: 'u2', name: 'New User', email: 'new@example.com', password: 'h', role: 'user', image: null, emailVerified: null,
      });

      await service.register(dto);
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({ where: { email: 'new@example.com' } });
    });
  });
});
