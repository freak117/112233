import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';

const ALLOWED_IMAGE_MIME = new Set(['image/png', 'image/jpeg', 'image/webp']);
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

@Injectable()
export class UploadsService {
  constructor(private readonly prisma: PrismaService, private readonly configService: ConfigService) {}

  async uploadImage(userId: string, base64: string, filename: string): Promise<{
    fileId: string;
    url: string;
    mimeType: string;
    size: number;
  }> {
    const parsed = this.parseBase64Image(base64);

    if (!ALLOWED_IMAGE_MIME.has(parsed.mimeType)) {
      throw new BadRequestException('Unsupported image mime type');
    }

    if (parsed.size > MAX_IMAGE_BYTES) {
      throw new BadRequestException('Image is too large');
    }

    const file = await this.prisma.file.create({
      data: {
        ownerId: userId,
        storageKey: this.createStorageKey(parsed.mimeType),
        originalName: filename,
        mimeType: parsed.mimeType,
        fileSize: parsed.size,
        publicUrl: this.createPublicUrl(),
      },
    });

    return {
      fileId: file.id,
      url: file.publicUrl,
      mimeType: file.mimeType,
      size: file.fileSize,
    };
  }

  private parseBase64Image(input: string): { mimeType: string; size: number } {
    const match = input.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);
    if (!match) {
      throw new BadRequestException('Invalid base64 image payload');
    }

    const mimeType = match[1];
    const payload = match[2];
    const size = Buffer.from(payload, 'base64').byteLength;
    return { mimeType, size };
  }

  private createStorageKey(mimeType: string): string {
    const extension = mimeType === 'image/png' ? 'png' : mimeType === 'image/webp' ? 'webp' : 'jpg';
    return `images/${randomUUID()}.${extension}`;
  }

  private createPublicUrl(): string {
    const endpoint = this.configService.get<string>('MINIO_ENDPOINT', 'localhost');
    const port = this.configService.get<string>('MINIO_PORT', '9000');
    const bucket = this.configService.get<string>('MINIO_BUCKET', 'telegram-lite');
    return `http://${endpoint}:${port}/${bucket}/stub/${randomUUID()}`;
  }
}

