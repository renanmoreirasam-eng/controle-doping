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
    @Body() body: { status: MatchStatus },
  ) {
    return this.matchesService.updateStatus(
      id,
      body.status,
    );
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