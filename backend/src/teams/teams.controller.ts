import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { TeamsService } from './teams.service';

@Controller('teams')
export class TeamsController {
  constructor(private teamsService: TeamsService) {}

  @Post()
  async create(
    @Body()
    body: {
      name: string;
      shortName?: string;
      cnpj?: string;
      city: string;
      state: string;
      category?: string;
      isActive?: boolean;
    },
  ) {
    return this.teamsService.create(body);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body()
    body: {
      name?: string;
      shortName?: string;
      cnpj?: string;
      city?: string;
      state?: string;
      category?: string;
      isActive?: boolean;
    },
  ) {
    return this.teamsService.update(id, body);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.teamsService.remove(id);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.teamsService.findOne(id);
  }

  @Get()
  async findAll() {
    return this.teamsService.findAll();
  }
}