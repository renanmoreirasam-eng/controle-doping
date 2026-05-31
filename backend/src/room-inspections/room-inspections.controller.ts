import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';

import { RoomInspectionsService } from './room-inspections.service';

@Controller('room-inspections')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RoomInspectionsController {
  constructor(
    private roomInspectionsService: RoomInspectionsService,
  ) {}

  @Post()
  @Roles('ADMIN', 'COORDINATOR', 'OFFICIAL')
  async create(
    @Body()
    body: {
      matchId: string;
      status: string;
      notes?: string;
      items: {
        label: string;
        status: string;
        notes?: string;
      }[];
      photos?: {
        fileName: string;
        dataUrl: string;
      }[];
    },
  ) {
    return this.roomInspectionsService.create(body);
  }

  @Get()
  @Roles('ADMIN', 'COORDINATOR', 'OFFICIAL')
  async findAll(
    @Query('matchId') matchId?: string,
    @Query('stadiumId') stadiumId?: string,
  ) {
    if (matchId) {
      return this.roomInspectionsService.findByMatch(matchId);
    }

    if (stadiumId) {
      return this.roomInspectionsService.findByStadium(stadiumId);
    }

    return this.roomInspectionsService.findAll();
  }

  @Delete(':id')
  @Roles('ADMIN')
  async remove(@Param('id') id: string) {
    return this.roomInspectionsService.remove(id);
  }
}
