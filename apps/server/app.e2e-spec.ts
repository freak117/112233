import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/modules/app.module';
import { PrismaService } from '../src/modules/prisma/prisma.service';

describe('Telegram Lite API (E2E)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let userAToken: string;
  let userBToken: string;
  let userAId: string;
  let userBId: string;
  let chatId: string;

  const userA = {
    email: `e2e-user-a-${Date.now()}@test.com`,
    password: 'password123',
    username: `e2eusera${Date.now()}`,
    displayName: 'User A',
  };

  const userB = {
    email: `e2e-user-b-${Date.now()}@test.com`,
    password: 'password123',
    username: `e2euserb${Date.now()}`,
    displayName: 'User B',
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

    // Регистрация пользователя A
    const resA = await request(app.getHttpServer())
      .post('/auth/register')
      .send(userA);
    userAToken = resA.body.accessToken;
    userAId = resA.body.user.id;

    // Регистрация пользователя B
    const resB = await request(app.getHttpServer())
      .post('/auth/register')
      .send(userB);
    userBToken = resB.body.accessToken;
    userBId = resB.body.user.id;
  });

  afterAll(async () => {
    await prisma.message.deleteMany({ where: { chat: { members: { some: { user: { email: { startsWith: 'e2e-' } } } } } } });
    await prisma.chatMember.deleteMany({ where: { user: { email: { startsWith: 'e2e-' } } } });
    await prisma.chat.deleteMany({ where: { members: { some: { user: { email: { startsWith: 'e2e-' } } } } } });
    await prisma.refreshToken.deleteMany({ where: { user: { email: { startsWith: 'e2e-' } } } });
    await prisma.user.deleteMany({ where: { email: { startsWith: 'e2e-' } } });
    await app.close();
  });

  describe('1. Регистрация и логин', () => {
    it('должен регистрировать пользователя A', () => {
      expect(userAToken).toBeDefined();
      expect(userAId).toBeDefined();
    });

    it('должен регистрировать пользователя B', () => {
      expect(userBToken).toBeDefined();
      expect(userBId).toBeDefined();
    });
  });

  describe('2. Поиск пользователей', () => {
    it('должен находить пользователя B по username', () => {
      return request(app.getHttpServer())
        .get(`/search/users?username=${userB.username}`)
        .set('Authorization', `Bearer ${userAToken}`)
        .expect(200)
        .then((res) => {
          expect(res.body).toBeInstanceOf(Array);
          expect(res.body.length).toBeGreaterThan(0);
          expect(res.body[0].username).toBe(userB.username);
        });
    });
  });

  describe('3. Создание direct-чата', () => {
    it('должен создавать unique direct чат между A и B', () => {
      return request(app.getHttpServer())
        .post('/chats/direct')
        .set('Authorization', `Bearer ${userAToken}`)
        .send({ targetUserId: userBId })
        .expect(201)
        .then((res) => {
          chatId = res.body.id;
          expect(chatId).toBeDefined();
          expect(res.body.type).toBe('direct');
        });
    });

    it('не должен создавать дубликат чата при повторном запросе', () => {
      return request(app.getHttpServer())
        .post('/chats/direct')
        .set('Authorization', `Bearer ${userAToken}`)
        .send({ targetUserId: userBId })
        .expect(201)
        .then((res) => {
          expect(res.body.id).toBe(chatId); // Тот же самый чат
        });
    });
  });

  describe('4. Отправка сообщений', () => {
    it('должен отправлять текстовое сообщение', () => {
      return request(app.getHttpServer())
        .post('/messages')
        .set('Authorization', `Bearer ${userAToken}`)
        .send({
          chatId,
          text: 'Привет от пользователя A!',
          clientMessageId: `client-${Date.now()}`,
        })
        .expect(201);
    });

    it('должен получать историю сообщений', () => {
      return request(app.getHttpServer())
        .get(`/messages?chatId=${chatId}&limit=20`)
        .set('Authorization', `Bearer ${userAToken}`)
        .expect(200)
        .then((res) => {
          expect(res.body.items).toBeInstanceOf(Array);
          expect(res.body.items.length).toBeGreaterThan(0);
        });
    });
  });

  describe('5. Список чатов', () => {
    it('должен получать список чатов пользователя A', () => {
      return request(app.getHttpServer())
        .get('/chats')
        .set('Authorization', `Bearer ${userAToken}`)
        .expect(200)
        .then((res) => {
          expect(res.body).toBeInstanceOf(Array);
          expect(res.body.length).toBeGreaterThan(0);
          expect(res.body[0].chatId).toBe(chatId);
        });
    });
  });

  describe('6. Профиль пользователя', () => {
    it('должен получать свой профиль', () => {
      return request(app.getHttpServer())
        .get('/users/me')
        .set('Authorization', `Bearer ${userAToken}`)
        .expect(200)
        .then((res) => {
          expect(res.body.username).toBe(userA.username);
          expect(res.body.email).toBe(userA.email);
        });
    });

    it('должен обновлять профиль', () => {
      return request(app.getHttpServer())
        .patch('/users/me')
        .set('Authorization', `Bearer ${userAToken}`)
        .send({ bio: 'E2E тест биография' })
        .expect(200);
    });
  });

  describe('7. Health check', () => {
    it('должен возвращать статус здоровья API', () => {
      return request(app.getHttpServer())
        .get('/health')
        .expect(200)
        .then((res) => {
          expect(res.body.status).toBe('ok');
        });
    });
  });
});
