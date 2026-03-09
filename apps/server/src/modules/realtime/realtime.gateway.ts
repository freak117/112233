import { Logger, UseGuards } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Message } from '@prisma/client';
import { PresenceService } from '../presence/presence.service';
import { WsAuthGuard } from './ws-auth.guard';
import { ChatsService } from '../chats/chats.service';

@WebSocketGateway({ cors: { origin: '*' } })
@UseGuards(WsAuthGuard)
export class RealtimeGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(RealtimeGateway.name);

  constructor(
    private readonly presenceService: PresenceService,
    private readonly chatsService: ChatsService,
  ) {}

  handleConnection(client: Socket): void {
    const userId = this.getUserId(client);
    if (userId) {
      this.presenceService.markOnline(userId);
      this.server.emit('user_online', { userId });
    }
    this.logger.log(`Socket connected: ${client.id}`);
  }

  handleDisconnect(client: Socket): void {
    const userId = this.getUserId(client);
    if (userId) {
      this.presenceService.markOffline(userId);
      this.server.emit('user_offline', { userId });
    }
    this.logger.log(`Socket disconnected: ${client.id}`);
  }

  @SubscribeMessage('join_chat')
  async joinChat(@ConnectedSocket() client: Socket, @MessageBody() payload: { chatId: string }): Promise<void> {
    const userId = this.getUserId(client);
    if (!userId) return;
    await this.chatsService.assertUserInChat(userId, payload.chatId);
    client.join(`chat:${payload.chatId}`);
  }

  @SubscribeMessage('user_typing')
  typing(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { chatId: string; isTyping: boolean },
  ): void {
    const userId = this.getUserId(client);
    this.server.to(`chat:${payload.chatId}`).emit('user_typing', {
      chatId: payload.chatId,
      userId,
      isTyping: payload.isTyping,
    });
  }

  private getUserId(client: Socket): string | null {
    return (client.data?.userId as string | undefined) ?? null;
  }

  emitNewMessage(chatId: string, message: Message): void {
    this.server.to(`chat:${chatId}`).emit('new_message', { chatId, message });
  }

  emitChatUpdated(chatId: string): void {
    this.server.to(`chat:${chatId}`).emit('chat_updated', { chatId });
  }
}

