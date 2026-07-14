import { Controller, Get, Query, UseGuards } from '@nestjs/common';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';

import { ReportsService } from './reports.service';

@Controller('reports')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('operational')
  @Roles('ADMIN')
  async getOperationalReports(
    @Query()
    query: {
      startDate?: string;
      endDate?: string;
      championshipId?: string;
      stadiumId?: string;
      officialId?: string;
      status?: string;
    },
  ) {
    return this.reportsService.getOperationalReports(query);
  }
}