import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';

import { AuthGuard } from '@nestjs/passport';
import { InventoryService } from './inventory.service';

@Controller('inventory')
@UseGuards(AuthGuard('jwt'))
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get('summary')
  getSummary() {
    return this.inventoryService.getSummary();
  }

  @Get('kits')
  listKits(
    @Query('status') status?: string,
    @Query('officialId') officialId?: string,
    @Query('number') number?: string,
  ) {
    return this.inventoryService.listKits({
      status,
      officialId,
      number,
    });
  }

  @Get('kits/my')
  listMyKits(@Req() req: any) {
    return this.inventoryService.listMyKits(req.user);
  }

  @Get('kits/by-official')
  listKitsByOfficial(@Query('officialId') officialId: string) {
    return this.inventoryService.listKitsByOfficial(officialId);
  }

  @Get('movements')
  listMovements(@Query('kitId') kitId?: string) {
    return this.inventoryService.listMovements(kitId);
  }

  @Post('entries')
  createEntry(@Req() req: any, @Body() body: any) {
    return this.inventoryService.createEntry(req.user, {
      quantity: Number(body.quantity),
      initialNumber: String(body.initialNumber || '').trim(),
      finalNumber: String(body.finalNumber || '').trim(),
      notes: body.notes,
    });
  }

  @Post('transfers')
  transferToDco(@Req() req: any, @Body() body: any) {
    return this.inventoryService.transferToDco(req.user, {
      officialId: body.officialId,
      initialNumber: String(body.initialNumber || '').trim(),
      finalNumber: String(body.finalNumber || '').trim(),
      notes: body.notes,
    });
  }
}