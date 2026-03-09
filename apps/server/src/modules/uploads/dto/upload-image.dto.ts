import { IsString, MaxLength, MinLength } from 'class-validator';

export class UploadImageDto {
  @IsString()
  @MinLength(10)
  base64!: string;

  @IsString()
  @MaxLength(255)
  filename!: string;
}

