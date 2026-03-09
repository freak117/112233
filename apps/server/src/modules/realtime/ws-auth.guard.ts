import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';
import { Socket } from 'socket.io';

@Injectable()
export class WsAuthGuard implements CanActivate {
  constructor(private readonly configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const client = context.switchToWs().getClient<Socket>();
    const token = this.extractToken(client);
    if (!token) {
      client.disconnect(true);
      return false;
    }

    try {
      const payload = jwt.verify(token, this.configService.getOrThrow<string>('JWT_ACCESS_SECRET')) as {
        sub: string;
      };
      client.data.userId = payload.sub;
      return true;
    } catch {
      client.disconnect(true);
      return false;
    }
  }

  private extractToken(client: Socket): string | null {
    const authToken = client.handshake.auth?.token;
    if (typeof authToken === 'string' && authToken.length > 0) {
      return authToken;
    }

    const authHeader = client.handshake.headers?.authorization;
    if (typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
      return authHeader.slice(7);
    }

    return null;
  }
}

