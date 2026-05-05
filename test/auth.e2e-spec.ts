process.env.JWT_SECRET = 'test-secret-32-chars-for-testing!!';

import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as bcryptjs from 'bcryptjs';
import request from 'supertest';
import { App } from 'supertest/types';
import { AuthModule } from '../src/auth/auth.module';
import { PrismaModule } from '../src/prisma/prisma.module';
import { PrismaService } from '../src/prisma/prisma.service';

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

const mockPrisma = {
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
  },
};

describe('Auth (integration)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [PrismaModule, AuthModule],
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

  describe('POST /auth/register', () => {
    it('creates a new user and returns 201 with token', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      mockPrisma.user.create.mockResolvedValue({
        ...dbUser, id: 'u2', email: 'new@example.com', name: 'New User',
      });

      await request(app.getHttpServer())
        .post('/auth/register')
        .send({ name: 'New User', email: 'new@example.com', password: 'pass1234' })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('token');
          expect(res.body.user).not.toHaveProperty('password');
        });
    });

    it('returns 400 when email is already in use', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(dbUser);

      await request(app.getHttpServer())
        .post('/auth/register')
        .send({ name: 'Test', email: 'test@example.com', password: 'pass1234' })
        .expect(400);
    });

    it('returns 400 when required fields are missing', async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({ email: 'incomplete@example.com' })
        .expect(400);
    });

    it('returns 400 when email format is invalid', async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({ name: 'Test', email: 'not-an-email', password: 'pass1234' })
        .expect(400);
    });
  });

  describe('POST /auth/login', () => {
    it('returns 201 with token on valid credentials', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(dbUser);

      await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'test@example.com', password: 'secret123' })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('token');
          expect(res.body.user.email).toBe('test@example.com');
        });
    });

    it('returns 401 when user does not exist', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'nobody@example.com', password: 'validpassword' })
        .expect(401);
    });

    it('returns 401 when password is wrong', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(dbUser);

      await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'test@example.com', password: 'wrongpass' })
        .expect(401);
    });

    it('returns 400 when email field is missing', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({ password: 'pass' })
        .expect(400);
    });
  });

  describe('GET /auth/profile', () => {
    let token: string;

    beforeAll(async () => {
      mockPrisma.user.findUnique.mockResolvedValue(dbUser);
      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'test@example.com', password: 'secret123' });
      token = res.body.token as string;
    });

    it('returns 200 with user data when token is valid', async () => {
      await request(app.getHttpServer())
        .get('/auth/profile')
        .set('Authorization', `Bearer ${token}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.email).toBe('test@example.com');
        });
    });

    it('returns 401 without Authorization header', async () => {
      await request(app.getHttpServer())
        .get('/auth/profile')
        .expect(401);
    });

    it('returns 401 with an invalid token', async () => {
      await request(app.getHttpServer())
        .get('/auth/profile')
        .set('Authorization', 'Bearer invalid.token.here')
        .expect(401);
    });
  });
});
