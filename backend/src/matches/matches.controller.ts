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
      matchNumber?: string;
      roundOrPhase?: string;
      missionOrderFileName?: string | null;
      missionOrderFileType?: string | null;
      missionOrderFileData?: string | null;
      athleteListFileName?: string | null;
      athleteListFileType?: string | null;
      athleteListFileData?: string | null;
      finalDocumentFileName?: string | null;
      finalDocumentFileType?: string | null;
      finalDocumentFileData?: string | null;
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
      matchNumber?: string;
      roundOrPhase?: string;
      missionOrderFileName?: string | null;
      missionOrderFileType?: string | null;
      missionOrderFileData?: string | null;
      athleteListFileName?: string | null;
      athleteListFileType?: string | null;
      athleteListFileData?: string | null;
      finalDocumentFileName?: string | null;
      finalDocumentFileType?: string | null;
      finalDocumentFileData?: string | null;
    },
  ) {
    return this.matchesService.update(
      id,
      body,
    );
  }

  @Patch(':id/mission-code')
  @Roles('ADMIN', 'COORDINATOR', 'OFFICIAL')
  async updateMissionCode(
    @Param('id') id: string,
    @Body()
    body: {
      missionCode: string;
    },
  ) {
    return this.matchesService.updateMissionCode(id, body.missionCode);
  }

  @Patch(':id/documents')
  @Roles('ADMIN', 'COORDINATOR', 'OFFICIAL')
  async updateDocuments(
    @Param('id') id: string,
    @Body()
    body: {
      athleteListFileName?: string | null;
      athleteListFileType?: string | null;
      athleteListFileData?: string | null;
      finalDocumentFileName?: string | null;
      finalDocumentFileType?: string | null;
      finalDocumentFileData?: string | null;
    },
  ) {
    return this.matchesService.updateDocuments(id, body);
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
      comment?: string | null;
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
        comment: body.comment || undefined,
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
      comment?: string | null;
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
        comment: body.comment || undefined,
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
