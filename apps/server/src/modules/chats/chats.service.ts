import { BadRequestException, ForbiddenException, Injectable } from '@nestjs/common';
import { Prisma, type Chat } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

function directKeyForUsers(a: string, b: string): string {
  return [a, b].sort().join(':');
}

@Injectable()
export class ChatsService {
  constructor(private readonly prisma: PrismaService) {}

  async createOrGetDirectChat(userId: string, targetUserId: string): Promise<Chat> {
    if (userId === targetUserId) {
      throw new BadRequestException('Cannot create direct chat with self');
    }

    const directKey = directKeyForUsers(userId, targetUserId);
    const existing = await this.prisma.chat.findUnique({ where: { directKey } });
    if (existing) {
      return existing;
    }

    return this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const created = await tx.chat.create({
        data: {
          type: 'direct',
          directKey,
          members: {
            create: [{ userId }, { userId: targetUserId }],
          },
        },
      });
      return created;
    });
  }

  async listUserChats(userId: string): Promise<unknown[]> {
    const members = await this.prisma.chatMember.findMany({
      where: { userId },
      include: {
        chat: {
          include: {
            messages: { orderBy: { createdAt: 'desc' }, take: 1 },
            members: { include: { user: true } },
          },
        },
      },
      orderBy: { chat: { updatedAt: 'desc' } },
    });

    return members.map((m) => ({
      chatId: m.chat.id,
      type: m.chat.type,
      updatedAt: m.chat.updatedAt,
      participants: m.chat.members.map((cm) => ({
        id: cm.user.id,
        username: cm.user.username,
        displayName: cm.user.displayName,
      })),
      lastMessage: m.chat.messages[0] ?? null,
    }));
  }

  async assertUserInChat(userId: string, chatId: string): Promise<void> {
    const membership = await this.prisma.chatMember.findFirst({ where: { userId, chatId } });
    if (!membership) {
      throw new ForbiddenException('No access to chat');
    }
  }
}

