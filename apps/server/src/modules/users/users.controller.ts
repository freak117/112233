import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { User } from '@prisma/client';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UsersService } from './users.service';

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
  constructor(private readonly usersService: UsersService) {}

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
}

