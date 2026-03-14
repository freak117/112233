import { Body, Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { User } from '@prisma/client';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UsersService } from './users.service';
import { PresenceService } from '../presence/presence.service';

interface PublicUser {
  id: string;
  email: string;
  username: string;
  displayName: string;
  bio: string | null;
  avatarUrl: string | null;
}

@Controller('users')
@UseGuards(AuthGuard('jwt'))
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly presenceService: PresenceService,
  ) {}

  @Get('me')
  async getMe(@CurrentUser() user: User): Promise<PublicUser> {
    const me = await this.usersService.getMe(user.id);
    return {
      id: me.id,
      email: me.email,
      username: me.username,
      displayName: me.displayName,
      bio: me.bio,
      avatarUrl: me.avatarUrl,
    };
  }

  @Patch('me')
  async updateMe(@CurrentUser() user: User, @Body() dto: UpdateProfileDto): Promise<PublicUser> {
    const updated = await this.usersService.updateMe(user.id, dto);
    return {
      id: updated.id,
      email: updated.email,
      username: updated.username,
      displayName: updated.displayName,
      bio: updated.bio,
      avatarUrl: updated.avatarUrl,
    };
  }

  @Get(':id/online')
  async isOnline(@Param('id') userId: string): Promise<{ online: boolean }> {
    return { online: this.presenceService.isOnline(userId) };
  }

  @Get('online/bulk')
  async getOnlineStatus(@CurrentUser() user: User, @Body('userIds') userIds: string[]): Promise<Record<string, boolean>> {
    const result: Record<string, boolean> = {};
    for (const id of userIds) {
      result[id] = this.presenceService.isOnline(id);
    }
    return result;
  }
}

