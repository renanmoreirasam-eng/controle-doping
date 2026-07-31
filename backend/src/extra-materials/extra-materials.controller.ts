import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ExtraMaterialsService } from './extra-materials.service';

@Controller('extra-materials')
@UseGuards(AuthGuard('jwt'))
export class ExtraMaterialsController {
  constructor(private readonly extraMaterialsService: ExtraMaterialsService) {}

  @Get('items')
  listItems(@Req() req: any) {
    return this.extraMaterialsService.listItems(req.user);
  }

  @Post('items')
  createItem(@Req() req: any, @Body() body: any) {
    return this.extraMaterialsService.createItem(req.user, {
      name: body.name,
    });
  }

  @Patch('items/:itemId')
  updateItem(
    @Req() req: any,
    @Param('itemId') itemId: string,
    @Body() body: any,
  ) {
    return this.extraMaterialsService.updateItem(req.user, itemId, {
      name: body.name,
      active: body.active,
    });
  }

  @Get('summary')
  getSummary(@Req() req: any) {
    return this.extraMaterialsService.getSummary(req.user);
  }

  @Get('stocks')
  listStocks(
    @Req() req: any,
    @Query('officialId') officialId?: string,
    @Query('itemId') itemId?: string,
  ) {
    return this.extraMaterialsService.listStocks(req.user, {
      officialId,
      itemId,
    });
  }

  @Get('stocks/my')
  listMyStock(@Req() req: any) {
    return this.extraMaterialsService.listMyStock(req.user);
  }

  @Get('stocks/official/:officialId')
  listOfficialStockForUsage(
    @Req() req: any,
    @Param('officialId') officialId: string,
  ) {
    return this.extraMaterialsService.listOfficialStockForUsage(
      req.user,
      officialId,
    );
  }

  @Post('entries')
  createStockEntry(@Req() req: any, @Body() body: any) {
    return this.extraMaterialsService.createStockEntry(req.user, {
      itemId: body.itemId,
      quantity: Number(body.quantity),
      notes: body.notes,
    });
  }

  @Post('transfers')
  transferToDco(@Req() req: any, @Body() body: any) {
    return this.extraMaterialsService.transferToDco(req.user, {
      officialId: body.officialId,
      items: Array.isArray(body.items) ? body.items : [],
      notes: body.notes,
    });
  }

  @Post('returns')
  returnFromDco(@Req() req: any, @Body() body: any) {
    return this.extraMaterialsService.returnFromDco(req.user, {
      officialId: body.officialId,
      itemId: body.itemId,
      quantity: Number(body.quantity),
      notes: body.notes,
    });
  }

  @Get('reports/usages')
  listUsageReport(
    @Req() req: any,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('officialId') officialId?: string,
    @Query('itemId') itemId?: string,
  ) {
    return this.extraMaterialsService.listUsageReport(req.user, {
      startDate,
      endDate,
      officialId,
      itemId,
    });
  }

  @Get('movements')
  listMovements(
    @Req() req: any,
    @Query('itemId') itemId?: string,
    @Query('officialId') officialId?: string,
  ) {
    return this.extraMaterialsService.listMovements(req.user, {
      itemId,
      officialId,
    });
  }

  @Get('matches/:matchId/usages')
  listMatchUsages(@Req() req: any, @Param('matchId') matchId: string) {
    return this.extraMaterialsService.listMatchUsages(req.user, matchId);
  }

  @Post('matches/:matchId/usages')
  registerMatchUsages(
    @Req() req: any,
    @Param('matchId') matchId: string,
    @Body() body: any,
  ) {
    return this.extraMaterialsService.registerMatchUsages(req.user, matchId, {
      used: Boolean(body.used),
      officialId: body.officialId,
      notes: body.notes,
      items: Array.isArray(body.items) ? body.items : [],
    });
  }

  @Delete('matches/:matchId/usages/:usageId')
  deleteMatchUsage(
    @Req() req: any,
    @Param('matchId') matchId: string,
    @Param('usageId') usageId: string,
  ) {
    return this.extraMaterialsService.deleteMatchUsage(req.user, matchId, usageId);
  }
}
