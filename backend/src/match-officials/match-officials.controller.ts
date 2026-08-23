import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Query,
  Req,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { MatchOfficialsService } from './match-officials.service';

@Controller('match-officials')
@UseGuards(AuthGuard('jwt'))
export class MatchOfficialsController {
  constructor(
    private readonly matchOfficialsService: MatchOfficialsService,
  ) {}

  @Post()
  async create(
    @Body()
    body: {
      matchId: string;
      officialId: string;
      role: 'DCO' | 'ASSISTANT';
    },
  ) {
    return this.matchOfficialsService.create(body);
  }

  @Patch(':id/confirm')
  async confirm(@Param('id') id: string) {
    return this.matchOfficialsService.confirm(id);
  }

  @Patch(':id/refuse')
  async refuse(@Param('id') id: string) {
    return this.matchOfficialsService.refuse(id);
  }

  @Post(':id/resend-notification')
  async resendPendingNotification(@Param('id') id: string, @Req() req: any) {
    return this.matchOfficialsService.resendPendingNotification(id, req.user);
  }

  @Post(':id/whatsapp-link')
  async createWhatsAppLink(@Param('id') id: string, @Req() req: any) {
    return this.matchOfficialsService.createWhatsAppLink(id, req.user);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.matchOfficialsService.remove(id);
  }

  @Get('groups')
  async findGroups(
    @Query('tab') tab?: 'ACTIVE' | 'DONE',
    @Query('status') status?: 'PENDING' | 'CONFIRMED' | 'REFUSED',
    @Query('search') search?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Req() req?: any,
  ) {
    return this.matchOfficialsService.findGroups({
      tab,
      status,
      search,
      startDate,
      endDate,
      page,
      limit,
      user: req?.user,
    });
  }

  @Get()
  async findAll() {
    return this.matchOfficialsService.findAll();
  }
}