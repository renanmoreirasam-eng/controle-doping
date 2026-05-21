import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';

import { OfficialsService } from './officials.service';

@Controller('officials')
export class OfficialsController {
  constructor(
    private officialsService: OfficialsService,
  ) {}

  @Post()
  async create(
    @Body()
    body: {
      userId: string;
      phone?: string;
      pixKey?: string;
    },
  ) {
    return this.officialsService.create(body);
  }

  @Post('full')
  async createFull(
    @Body()
    body: {
      name: string;
      email: string;
      password: string;
      phone?: string;
      pixKey?: string;
      role?: string;
    },
  ) {
    return this.officialsService.createFull(body);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body()
    body: {
      name?: string;
      email?: string;
      phone?: string;
      pixKey?: string;
      active?: boolean;
      role?: string;
    },
  ) {
    return this.officialsService.update(id, body);
  }

  @Get()
  async findAll() {
    return this.officialsService.findAll();
  }
}