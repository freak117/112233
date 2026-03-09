import { Controller, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Body } from '@nestjs/common';
import { User } from '@prisma/client';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UploadImageDto } from './dto/upload-image.dto';
import { UploadsService } from './uploads.service';

@Controller('uploads')
@UseGuards(AuthGuard('jwt'))
export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) {}

  @Post('image')
  uploadImage(
    @CurrentUser() user: User,
    @Body() dto: UploadImageDto,
  ): Promise<{ fileId: string; url: string; mimeType: string; size: number }> {
    return this.uploadsService.uploadImage(user.id, dto.base64, dto.filename);
  }
}

