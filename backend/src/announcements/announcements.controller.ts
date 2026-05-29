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
import { AnnouncementTargetRole } from '@prisma/client';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';

import { AnnouncementsService } from './announcements.service';

@Controller('announcements')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AnnouncementsController {
  constructor(private announcementsService: AnnouncementsService) {}

  @Post()
  @Roles('ADMIN')
  async create(
    @Body()
    body: {
      title: string;
      message: string;
      targetRole: AnnouncementTargetRole;
    },
    @Req() req: any,
  ) {
    return this.announcementsService.create(body, req.user);
  }

  @Get()
  @Roles('ADMIN')
  async findAll() {
    return this.announcementsService.findAll();
  }

  @Get('pending/me')
  @Roles('ADMIN', 'COORDINATOR', 'OFFICIAL')
  async findPendingForMe(@Req() req: any) {
    return this.announcementsService.findPendingForMe(req.user);
  }

  @Post(':id/acknowledge')
  @Roles('ADMIN', 'COORDINATOR', 'OFFICIAL')
  async acknowledge(
    @Param('id') id: string,
    @Req() req: any,
  ) {
    return this.announcementsService.acknowledge(id, req.user);
  }

  @Patch(':id')
  @Roles('ADMIN')
  async update(
    @Param('id') id: string,
    @Body()
    body: {
      title?: string;
      message?: string;
      targetRole?: AnnouncementTargetRole;
      active?: boolean;
    },
  ) {
    return this.announcementsService.update(id, body);
  }

  @Delete(':id')
  @Roles('ADMIN')
  async remove(@Param('id') id: string) {
    return this.announcementsService.remove(id);
  }
}
