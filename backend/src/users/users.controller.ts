import {
  Body,
  Controller,
  Param,
  Patch,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { UsersService } from './users.service';

@Controller('users')
@UseGuards(AuthGuard('jwt'))
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Patch('me/password')
  async changeMyPassword(
    @Req() req: any,
    @Body()
    body: {
      currentPassword: string;
      newPassword: string;
      confirmPassword: string;
    },
  ) {
    return this.usersService.changeMyPassword(req.user, body);
  }

  @Patch(':id/reset-password')
  async resetPassword(
    @Param('id') id: string,
    @Req() req: any,
    @Body()
    body: {
      newPassword: string;
      confirmPassword: string;
    },
  ) {
    return this.usersService.resetPassword(id, req.user, body);
  }
}
