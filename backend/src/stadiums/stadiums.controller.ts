import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { StadiumsService } from './stadiums.service';

@Controller('stadiums')
export class StadiumsController {
  constructor(private stadiumsService: StadiumsService) {}

  @Post()
  async create(
    @Body()
    body: {
      name: string;
      city: string;
      state: string;
      address?: string;
      cep?: string;
    },
  ) {
    return this.stadiumsService.create(body);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body()
    body: {
      name?: string;
      city?: string;
      state?: string;
      address?: string;
      cep?: string;
    },
  ) {
    return this.stadiumsService.update(id, body);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.stadiumsService.remove(id);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.stadiumsService.findOne(id);
  }

  @Get()
  async findAll() {
    return this.stadiumsService.findAll();
  }
}