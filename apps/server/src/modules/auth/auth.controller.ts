import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { User } from '@prisma/client';
import { CurrentUser } from './decorators/current-user.decorator';
import { LoginDto } from './dto/login.dto';
import { RefreshDto } from './dto/refresh.dto';
import { RegisterDto } from './dto/register.dto';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() dto: RegisterDto): Promise<unknown> {
    const { user, tokens } = await this.authService.register(dto);
    return {
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        displayName: user.displayName,
      },
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }

  @Post('login')
  async login(@Body() dto: LoginDto): Promise<unknown> {
    const { user, tokens } = await this.authService.login(dto);
    return {
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        displayName: user.displayName,
      },
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }

  @Post('refresh')
  async refresh(@Body() dto: RefreshDto): Promise<unknown> {
    return this.authService.refresh(dto.refreshToken);
  }

  @Post('logout')
  async logout(@Body() dto: RefreshDto): Promise<{ success: boolean }> {
    await this.authService.logout(dto.refreshToken);
    return { success: true };
  }

  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  me(@CurrentUser() user: User): { id: string; email: string; username: string; displayName: string } {
    return {
      id: user.id,
      email: user.email,
      username: user.username,
      displayName: user.displayName,
    };
  }
}

