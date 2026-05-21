import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';

import { MatchOfficialsService } from './match-officials.service';

@Controller('match-officials')
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

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.matchOfficialsService.remove(id);
  }

  @Get()
  async findAll() {
    return this.matchOfficialsService.findAll();
  }
}