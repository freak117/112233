import { Injectable } from '@nestjs/common';

@Injectable()
export class PresenceService {
  private readonly onlineUsers = new Set<string>();

  markOnline(userId: string): void {
    this.onlineUsers.add(userId);
  }

  markOffline(userId: string): void {
    this.onlineUsers.delete(userId);
  }

  isOnline(userId: string): boolean {
    return this.onlineUsers.has(userId);
  }
}

