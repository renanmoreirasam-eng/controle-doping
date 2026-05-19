import { Body, Controller, Get, Post } from '@nestjs/common';
import { OfficialsService } from './officials.service';

@Controller('officials')
export class OfficialsController {
  constructor(private officialsService: OfficialsService) {}

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

  @Get()
  async findAll() {
    return this.officialsService.findAll();
  }
}