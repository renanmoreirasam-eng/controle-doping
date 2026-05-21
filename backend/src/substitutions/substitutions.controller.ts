import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { SubstitutionsService } from './substitutions.service';

@Controller('substitutions')
export class SubstitutionsController {
  constructor(private substitutionsService: SubstitutionsService) {}

  @Post()
  async create(
    @Body()
    body: {
      matchId: string;
      team: string;
      playerOutName: string;
      playerOutNumber: string;
      playerInName: string;
      playerInNumber: string;
      minute?: number;
      period?: string;
      notes?: string;
    },
  ) {
    return this.substitutionsService.create(body);
  }

  @Get()
  async findAll(@Query('matchId') matchId?: string) {
    return this.substitutionsService.findAll(matchId);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.substitutionsService.remove(id);
  }
}
