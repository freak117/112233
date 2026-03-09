import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RealtimeGateway } from '../realtime/realtime.gateway';
import { ChatsService } from '../chats/chats.service';
import { SendMessageDto } from './dto/send-message.dto';

@Injectable()
export class MessagesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly chatsService: ChatsService,
    private readonly realtimeGateway: RealtimeGateway,
  ) {}

  async sendMessage(userId: string, dto: SendMessageDto): Promise<unknown> {
    const membership = await this.prisma.chatMember.findFirst({
      where: { chatId: dto.chatId, userId },
    });
    if (!membership) {
      throw new ForbiddenException('No access to chat');
    }

    const existing = await this.prisma.message.findFirst({
      where: {
        chatId: dto.chatId,
        senderId: userId,
        clientMessageId: dto.clientMessageId,
      },
      include: { attachments: true },
    });
    if (existing) return existing;

    const type = dto.type ?? (dto.text && dto.imageUrl ? 'text_image' : dto.imageUrl ? 'image' : 'text');

    const created = await this.prisma.message.create({
      data: {
        chatId: dto.chatId,
        senderId: userId,
        clientMessageId: dto.clientMessageId,
        type,
        text: dto.text,
        attachments: dto.imageUrl
          ? {
              create: {
                fileUrl: dto.imageUrl,
                mimeType: 'image/*',
                fileSize: 0,
              },
            }
          : undefined,
      },
      include: { attachments: true },
    });

    const chatMembers = await this.prisma.chatMember.findMany({
      where: { chatId: dto.chatId },
      select: { userId: true },
    });

    await this.prisma.messageStatus.createMany({
      data: chatMembers.map((member) => ({
        messageId: created.id,
        userId: member.userId,
        status: member.userId === userId ? 'read' : 'delivered',
      })),
      skipDuplicates: true,
    });

    await this.prisma.chat.update({
      where: { id: dto.chatId },
      data: { lastMessageId: created.id, updatedAt: new Date() },
    });

    this.realtimeGateway.emitNewMessage(dto.chatId, created);
    this.realtimeGateway.emitChatUpdated(dto.chatId);

    return created;
  }

  async listMessages(userId: string, chatId: string, cursor?: string, limit = 30): Promise<unknown> {
    await this.chatsService.assertUserInChat(userId, chatId);

    const messages = await this.prisma.message.findMany({
      where: { chatId },
      orderBy: { createdAt: 'desc' },
      ...(cursor
        ? {
            cursor: { id: cursor },
            skip: 1,
          }
        : {}),
      take: Math.min(Math.max(limit, 1), 50),
      include: { attachments: true, statuses: true },
    });

    const nextCursor = messages.length > 0 ? messages[messages.length - 1].id : null;
    return { items: messages, nextCursor };
  }
}

