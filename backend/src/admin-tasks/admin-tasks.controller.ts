import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';

import { AdminTasksService } from './admin-tasks.service';

@Controller('admin-tasks')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class AdminTasksController {
  constructor(private adminTasksService: AdminTasksService) {}

  @Get()
  async findAll() {
    return this.adminTasksService.findAll();
  }

  @Post()
  async create(
    @Body()
    body: {
      title: string;
      description?: string | null;
      dueDate: string;
      remindAt?: string | null;
    },
    @Req() req: any,
  ) {
    return this.adminTasksService.create(body, req.user);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body()
    body: {
      title?: string;
      description?: string | null;
      dueDate?: string;
      remindAt?: string | null;
      done?: boolean;
    },
  ) {
    return this.adminTasksService.update(id, body);
  }

  @Patch(':id/done')
  async toggleDone(
    @Param('id') id: string,
    @Body()
    body: {
      done?: boolean;
    },
  ) {
    return this.adminTasksService.toggleDone(id, body.done);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.adminTasksService.remove(id);
  }
}
