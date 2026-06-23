import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  async register(
    @Body()
    body: {
      name: string;
      email: string;
      password: string;
    },
  ) {
    return this.authService.register(body);
  }

  @Post('login')
  async login(
    @Body()
    body: {
      email: string;
      password: string;
    },
  ) {
    return this.authService.login(body);
  }

  @Post('forgot-password')
  async forgotPassword(
    @Body()
    body: {
      email: string;
    },
  ) {
    return this.authService.forgotPassword(body);
  }

  @Post('reset-password')
  async resetPassword(
    @Body()
    body: {
      token: string;
      password: string;
      confirmPassword: string;
    },
  ) {
    return this.authService.resetPassword(body);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('me')
  async me(@Req() req: any) {
    return req.user;
  }
}
