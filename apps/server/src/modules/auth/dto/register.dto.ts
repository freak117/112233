import { IsEmail, IsString, Matches, MaxLength, MinLength } from 'class-validator';
import { USERNAME_REGEX } from '../../common/username.util';

export class RegisterDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  @MaxLength(128)
  password!: string;

  @IsString()
  @Matches(USERNAME_REGEX)
  username!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(64)
  displayName!: string;
}

