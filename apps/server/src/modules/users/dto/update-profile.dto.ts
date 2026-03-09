import { IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator';
import { USERNAME_REGEX } from '../../common/username.util';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(64)
  displayName?: string;

  @IsOptional()
  @IsString()
  @Matches(USERNAME_REGEX)
  username?: string;

  @IsOptional()
  @IsString()
  @MaxLength(280)
  bio?: string;

  @IsOptional()
  @IsString()
  avatarUrl?: string;
}

