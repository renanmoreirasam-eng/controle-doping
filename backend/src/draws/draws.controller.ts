import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { DrawsService } from './draws.service';

@Controller('draws')
export class DrawsController {
  constructor(private drawsService: DrawsService) {}

  @Post()
  async create(
    @Body()
    body: {
      matchId: string;
      players: {
        team: string;
        name: string;
        nickname?: string;
        number: string;
        type: 'EXAME' | 'RESERVA';
      }[];
    },
  ) {
    return this.drawsService.create(body);
  }

  @Get('selected-athletes')
  async findSelectedAthletesByTeam(@Query('teamName') teamName?: string) {
    if (!teamName?.trim()) {
      return [];
    }

    return this.drawsService.findSelectedAthletesByTeam(teamName);
  }

  @Get()
  async findAll() {
    return this.drawsService.findAll();
  }
}
