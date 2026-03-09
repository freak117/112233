import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { User } from '@prisma/client';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CreateDirectChatDto } from './dto/create-direct-chat.dto';
import { ChatsService } from './chats.service';

@Controller('chats')
@UseGuards(AuthGuard('jwt'))
export class ChatsController {
  constructor(private readonly chatsService: ChatsService) {}

  @Post('direct')
  createDirect(@CurrentUser() user: User, @Body() dto: CreateDirectChatDto): Promise<unknown> {
    return this.chatsService.createOrGetDirectChat(user.id, dto.targetUserId);
  }

  @Get()
  list(@CurrentUser() user: User): Promise<unknown[]> {
    return this.chatsService.listUserChats(user.id);
  }
}

