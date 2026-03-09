import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { User } from '@prisma/client';
import type { Request } from 'express';
import { Strategy } from 'passport-jwt';
import { PrismaService } from '../prisma/prisma.service';
import { JwtPayload } from './jwt-payload.type';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly configService: ConfigService, private readonly prisma: PrismaService) {
    super({
      jwtFromRequest: (request: Request) => {
        const auth = request?.headers?.authorization;
        if (!auth) return null;
        const [type, token] = auth.split(' ');
        return type === 'Bearer' ? token : null;
      },
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>('JWT_ACCESS_SECRET'),
    });
  }

  async validate(payload: JwtPayload): Promise<User> {
    return this.prisma.user.findUniqueOrThrow({ where: { id: payload.sub } });
  }
}

