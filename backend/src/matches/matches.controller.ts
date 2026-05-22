import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';

import { MatchesService } from './matches.service';

type MatchStatus =
  | 'SCHEDULED'
  | 'SCALE_ACCEPTED'
  | 'IN_PROGRESS'
  | 'CONTROL_DONE'
  | 'CANCELED';

@Controller('matches')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MatchesController {
  constructor(
    private matchesService: MatchesService,
  ) {}

  @Post()
  @Roles('ADMIN', 'COORDINATOR')
  async create(
    @Body()
    body: {
      championshipId: string;
      stadiumId: string;
      homeTeam: string;
      awayTeam: string;
      matchDate: string;
      missionCode?: string;
    },
  ) {
    return this.matchesService.create(body);
  }

  @Patch(':id')
  @Roles('ADMIN', 'COORDINATOR')
  async update(
    @Param('id') id: string,
    @Body()
    body: {
      championshipId?: string;
      stadiumId?: string;
      homeTeam?: string;
      awayTeam?: string;
      matchDate?: string;
      status?: MatchStatus;
      missionCode?: string;
    },
  ) {
    return this.matchesService.update(
      id,
      body,
    );
  }

  @Patch(':id/status')
  @Roles('ADMIN', 'COORDINATOR', 'OFFICIAL')
  async updateStatus(
    @Param('id') id: string,
    @Body()
    body: {
      status: MatchStatus;
      latitude?: number;
      longitude?: number;
    },
    @Req() req: any,
  ) {
    return this.matchesService.updateStatus(
      id,
      body.status,
      req.user,
      {
        latitude: body.latitude,
        longitude: body.longitude,
      },
    );
  }


  @Post(':id/operational-logs')
  @Roles('ADMIN', 'COORDINATOR', 'OFFICIAL')
  async createOperationalLog(
    @Param('id') id: string,
    @Body()
    body: {
      step:
        | 'CHECKIN_STADIUM'
        | 'MATCH_IN_PROGRESS'
        | 'DRAW_DONE'
        | 'CONTROL_DONE';
      latitude?: number;
      longitude?: number;
    },
    @Req() req: any,
  ) {
    return this.matchesService.createOperationalLog(
      id,
      body.step,
      req.user,
      {
        latitude: body.latitude,
        longitude: body.longitude,
      },
    );
  }

  @Get(':id/operational-logs')
  @Roles('ADMIN', 'COORDINATOR', 'OFFICIAL')
  async findOperationalLogs(@Param('id') id: string) {
    return this.matchesService.findOperationalLogs(id);
  }

  @Delete(':id')
  @Roles('ADMIN')
  async remove(@Param('id') id: string) {
    return this.matchesService.remove(id);
  }

  @Get(':id')
  @Roles('ADMIN', 'COORDINATOR', 'OFFICIAL')
  async findOne(@Param('id') id: string) {
    return this.matchesService.findOne(id);
  }

  @Get()
  @Roles('ADMIN', 'COORDINATOR', 'OFFICIAL')
  async findAll(@Req() req: any) {
    return this.matchesService.findAll(
      req.user,
    );
  }
}