import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SearchService {
  constructor(private readonly prisma: PrismaService) {}

  async searchUsers(username: string): Promise<Array<{ id: string; username: string; displayName: string }>> {
    const normalized = username.trim().toLowerCase();
    if (!normalized) return [];

    const users = await this.prisma.user.findMany({
      where: {
        usernameNormalized: {
          startsWith: normalized,
        },
      },
      take: 20,
      orderBy: { usernameNormalized: 'asc' },
      select: {
        id: true,
        username: true,
        displayName: true,
      },
    });

    return users;
  }
}

