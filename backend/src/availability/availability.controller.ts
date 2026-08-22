import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AvailabilityService } from './availability.service';

@Controller('availability')
@UseGuards(AuthGuard('jwt'))
export class AvailabilityController {
  constructor(private readonly availabilityService: AvailabilityService) {}

  @Get('admin')
  listAll(@Req() req: any, @Query('month') month?: string) {
    return this.availabilityService.listAll(req.user, month);
  }

  @Get('me')
  listMine(@Req() req: any, @Query('month') month?: string) {
    return this.availabilityService.listMine(req.user, month);
  }

  @Post()
  create(@Req() req: any, @Body() body: { date?: string; note?: string }) {
    return this.availabilityService.create(req.user, {
      date: String(body?.date || ''),
      note: body?.note,
    });
  }

  @Delete(':id')
  remove(@Req() req: any, @Param('id') id: string) {
    return this.availabilityService.remove(req.user, id);
  }

  @Get('official/:officialId')
  checkOfficial(
    @Req() req: any,
    @Param('officialId') officialId: string,
    @Query('date') date?: string,
  ) {
    return this.availabilityService.checkOfficial(
      req.user,
      officialId,
      String(date || ''),
    );
  }
}
