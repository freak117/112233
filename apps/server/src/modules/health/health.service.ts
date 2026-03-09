import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { HealthResponse } from './health.types';

@Injectable()
export class HealthService {
  constructor(private readonly prisma: PrismaService, private readonly configService: ConfigService) {}

  async getHealth(): Promise<HealthResponse> {
    const [database, redis, minio] = await Promise.all([
      this.checkDatabase(),
      this.checkRedis(),
      this.checkMinio(),
    ]);

    const services = {
      api: { ok: true },
      database,
      redis,
      minio,
    };

    const status: HealthResponse['status'] = Object.values(services).every((item) => item.ok)
      ? 'ok'
      : 'degraded';

    return { status, services };
  }

  private async checkDatabase(): Promise<{ ok: boolean; details?: string }> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return { ok: true };
    } catch (error) {
      return { ok: false, details: this.toMessage(error) };
    }
  }

  private async checkRedis(): Promise<{ ok: boolean; details?: string }> {
    const redisUrl = this.configService.get<string>('REDIS_URL');
    if (!redisUrl) {
      return { ok: false, details: 'REDIS_URL is not configured' };
    }
    return { ok: true };
  }

  private async checkMinio(): Promise<{ ok: boolean; details?: string }> {
    const endpoint = this.configService.get<string>('MINIO_ENDPOINT');
    const bucket = this.configService.get<string>('MINIO_BUCKET');
    if (!endpoint || !bucket) {
      return { ok: false, details: 'MINIO_ENDPOINT or MINIO_BUCKET is not configured' };
    }
    return { ok: true };
  }

  private toMessage(error: unknown): string {
    return error instanceof Error ? error.message : String(error);
  }
}

