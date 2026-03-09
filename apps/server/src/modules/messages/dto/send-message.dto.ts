import { IsEnum, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class SendMessageDto {
  @IsUUID()
  chatId!: string;

  @IsOptional()
  @IsString()
  @MaxLength(4000)
  text?: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsString()
  clientMessageId!: string;

  @IsOptional()
  @IsEnum(['text', 'image', 'text_image'])
  type?: 'text' | 'image' | 'text_image';
}

