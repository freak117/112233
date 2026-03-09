import { PrismaClient } from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  const passwordHash = await argon2.hash('password123');

  const userA = await prisma.user.upsert({
    where: { email: 'demo1@example.com' },
    update: {},
    create: {
      email: 'demo1@example.com',
      passwordHash,
      username: 'demo_user_1',
      usernameNormalized: 'demo_user_1',
      displayName: 'Demo User 1',
    },
  });

  const userB = await prisma.user.upsert({
    where: { email: 'demo2@example.com' },
    update: {},
    create: {
      email: 'demo2@example.com',
      passwordHash,
      username: 'demo_user_2',
      usernameNormalized: 'demo_user_2',
      displayName: 'Demo User 2',
    },
  });

  const directKey = [userA.id, userB.id].sort().join(':');
  const chat = await prisma.chat.upsert({
    where: { directKey },
    update: {},
    create: {
      type: 'direct',
      directKey,
      members: {
        create: [{ userId: userA.id }, { userId: userB.id }],
      },
    },
  });

  await prisma.message.createMany({
    data: [
      {
        chatId: chat.id,
        senderId: userA.id,
        clientMessageId: 'seed-message-1',
        type: 'text',
        text: 'Привет! Это seed сообщение.',
      },
      {
        chatId: chat.id,
        senderId: userB.id,
        clientMessageId: 'seed-message-2',
        type: 'text',
        text: 'Привет, принято.',
      },
    ],
    skipDuplicates: true,
  });

  console.log('Seed completed');
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

