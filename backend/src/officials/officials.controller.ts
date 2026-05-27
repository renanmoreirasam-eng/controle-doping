import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

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
      documentType?: string;
      documentNumber?: string;
      cpf?: string;
      birthDate?: string | Date | null;
      address?: string;
      shirtSize?: string;
      operationalRole?: string;
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
      documentType?: string;
      documentNumber?: string;
      cpf?: string;
      birthDate?: string | Date | null;
      address?: string;
      shirtSize?: string;
      operationalRole?: string;
    },
  ) {
    return this.officialsService.createFull(body);
  }

  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  async findMe(@Req() req: any) {
    return this.officialsService.findByUserId(req.user.id);
  }

  @Patch('me')
  @UseGuards(AuthGuard('jwt'))
  async updateMe(
    @Req() req: any,
    @Body()
    body: {
      name?: string;
      phone?: string;
      pixKey?: string;
      documentType?: string;
      documentNumber?: string;
      cpf?: string;
      birthDate?: string | Date | null;
      address?: string;
      shirtSize?: string;
    },
  ) {
    return this.officialsService.updateMe(req.user.id, body);
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
      documentType?: string;
      documentNumber?: string;
      cpf?: string;
      birthDate?: string | Date | null;
      address?: string;
      shirtSize?: string;
      operationalRole?: string;
    },
  ) {
    return this.officialsService.update(id, body);
  }

  @Get()
  @UseGuards(AuthGuard('jwt'))
  async findAll(@Req() req: any) {
    return this.officialsService.findAll(req.user);
  }
}
