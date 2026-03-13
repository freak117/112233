import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './src/modules/app.module';
import { PrismaService } from './src/modules/prisma/prisma.service';

describe('Auth API (Integration)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  const testUser = {
    email: `integration-${Date.now()}@test.com`,
    password: 'password123',
    username: `testuser${Date.now()}`,
    displayName: 'Integration Test User',
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
      }),
    );
    await app.init();
    prisma = app.get<PrismaService>(PrismaService);
  });

  afterAll(async () => {
    await prisma.refreshToken.deleteMany({ where: { user: { email: { startsWith: 'integration-' } } } });
    await prisma.user.deleteMany({ where: { email: { startsWith: 'integration-' } } });
    await app.close();
  });

  describe('POST /auth/register', () => {
    it('должен успешно регистрировать пользователя', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send(testUser)
        .expect(201)
        .then((res) => {
          expect(res.body.user.email).toBe(testUser.email);
          expect(res.body.user.username).toBe(testUser.username);
          expect(res.body.accessToken).toBeDefined();
          expect(res.body.refreshToken).toBeDefined();
        });
    });

    it('должен отклонять невалидный email', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({ ...testUser, email: 'invalid-email' })
        .expect(400);
    });

    it('должен отклонять короткий пароль', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({ ...testUser, password: 'short' })
        .expect(400);
    });

    it('должен отклонять невалидный username', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({ ...testUser, username: 'ab' })
        .expect(400);
    });
  });

  describe('POST /auth/login', () => {
    it('должен успешно входить', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: testUser.email, password: testUser.password })
        .expect(201)
        .then((res) => {
          expect(res.body.accessToken).toBeDefined();
          expect(res.body.refreshToken).toBeDefined();
        });
    });

    it('должен отклонять неверный пароль', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: testUser.email, password: 'wrongpassword' })
        .expect(401);
    });
  });
});
