import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { RoomInspectionsService } from './room-inspections.service';

@Controller('room-inspections')
export class RoomInspectionsController {
  constructor(
    private roomInspectionsService: RoomInspectionsService,
  ) {}

  @Post()
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
  async findAll(@Query('matchId') matchId?: string) {
    if (matchId) {
      return this.roomInspectionsService.findByMatch(matchId);
    }

    return this.roomInspectionsService.findAll();
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.roomInspectionsService.remove(id);
  }
}