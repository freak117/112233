import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { User } from '@prisma/client';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { SendMessageDto } from './dto/send-message.dto';
import { MessagesService } from './messages.service';

@Controller('messages')
@UseGuards(AuthGuard('jwt'))
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Post()
  send(@CurrentUser() user: User, @Body() dto: SendMessageDto): Promise<unknown> {
    return this.messagesService.sendMessage(user.id, dto);
  }

  @Get()
  list(
    @CurrentUser() user: User,
    @Query('chatId') chatId: string,
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: string,
  ): Promise<unknown> {
    return this.messagesService.listMessages(user.id, chatId, cursor, limit ? Number(limit) : 30);
  }
}

