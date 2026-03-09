import { ConflictException, Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { normalizeUsername } from '../common/username.util';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async getMe(userId: string): Promise<User> {
    return this.prisma.user.findUniqueOrThrow({ where: { id: userId } });
  }

  async updateMe(userId: string, dto: UpdateProfileDto): Promise<User> {
    if (dto.username) {
      const existing = await this.prisma.user.findFirst({
        where: {
          usernameNormalized: normalizeUsername(dto.username),
          NOT: { id: userId },
        },
      });
      if (existing) {
        throw new ConflictException('Username already taken');
      }
    }

    return this.prisma.user.update({
      where: { id: userId },
      data: {
        displayName: dto.displayName,
        username: dto.username,
        usernameNormalized: dto.username ? normalizeUsername(dto.username) : undefined,
        bio: dto.bio,
        avatarUrl: dto.avatarUrl,
      },
    });
  }
}

