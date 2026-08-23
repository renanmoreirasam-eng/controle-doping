import { Controller, Get, Param, Post } from '@nestjs/common';

import { MatchOfficialsService } from './match-officials.service';

@Controller('scale-confirmation')
export class MatchOfficialsPublicController {
  constructor(
    private readonly matchOfficialsService: MatchOfficialsService,
  ) {}

  @Get(':token')
  async getConfirmation(@Param('token') token: string) {
    return this.matchOfficialsService.getPublicConfirmation(token);
  }

  @Post(':token/confirm')
  async confirm(@Param('token') token: string) {
    return this.matchOfficialsService.confirmByToken(token);
  }

  @Post(':token/refuse')
  async refuse(@Param('token') token: string) {
    return this.matchOfficialsService.refuseByToken(token);
  }
}
