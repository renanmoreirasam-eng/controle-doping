import { Controller, Get, Query, UseGuards } from '@nestjs/common';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';

import { PushLogsService } from './push-logs.service';

@Controller('push-logs')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PushLogsController {
  constructor(private readonly pushLogsService: PushLogsService) {}

  @Get()
  @Roles('ADMIN')
  async findAll(
    @Query()
    query: {
      search?: string;
      status?: string;
      module?: string;
      userRole?: string;
      startDate?: string;
      endDate?: string;
      page?: string;
      limit?: string;
    },
  ) {
    return this.pushLogsService.findAll(query);
  }

  @Get('subscriptions')
  @Roles('ADMIN')
  async findSubscriptionUsers(
    @Query()
    query: {
      search?: string;
      userRole?: string;
      status?: 'ALL' | 'ENABLED' | 'DISABLED';
      page?: string;
      limit?: string;
    },
  ) {
    return this.pushLogsService.findSubscriptionUsers(query);
  }
}
