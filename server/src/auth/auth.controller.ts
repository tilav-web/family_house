import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Request,
  UnauthorizedException,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import type { Request as ExpressRequest } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { ChangeCredentialsDto } from './dto/change-credentials.dto';
import { Public } from '../common/decorators/public.decorator';

interface AuthenticatedRequest extends ExpressRequest {
  user: {
    id: string;
    username: string;
  };
}

@Controller('api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Throttle({ short: { ttl: 60_000, limit: 5 } })
  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    const admin = await this.authService.validateAdmin(
      loginDto.username,
      loginDto.password,
    );
    if (!admin) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return this.authService.login(admin);
  }

  @Get('me')
  async getMe(@Request() req: AuthenticatedRequest) {
    return this.authService.getMe(req.user.id);
  }

  @Patch('change-credentials')
  async changeCredentials(
    @Request() req: AuthenticatedRequest,
    @Body() dto: ChangeCredentialsDto,
  ) {
    return this.authService.changeCredentials(
      req.user.id,
      dto.currentPassword,
      dto.newUsername,
      dto.newPassword,
    );
  }
}
