import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ChampionshipsService } from './championships.service';

@Controller('championships')
export class ChampionshipsController {
  constructor(private championshipsService: ChampionshipsService) {}

  @Post()
  async create(@Body() body: { name: string }) {
    return this.championshipsService.create(body);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() body: { name: string },
  ) {
    return this.championshipsService.update(id, body);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.championshipsService.remove(id);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.championshipsService.findOne(id);
  }

  @Get()
  async findAll() {
    return this.championshipsService.findAll();
  }
}