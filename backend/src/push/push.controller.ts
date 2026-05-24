import { Body, Controller, Headers, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PushService } from './push.service';

@Controller('push')
@UseGuards(AuthGuard('jwt'))
export class PushController {
  constructor(private readonly pushService: PushService) {}

  @Post('subscribe')
  async subscribe(
    @Req() req: any,
    @Body('subscription') subscription: any,
    @Headers('user-agent') userAgent?: string,
  ) {
    return this.pushService.subscribe(req.user.id, subscription, userAgent);
  }

  @Post('test')
  async test(@Req() req: any) {
    return this.pushService.sendTest(req.user.id);
  }
}