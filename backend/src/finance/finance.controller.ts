import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { FinanceService } from './finance.service';

@Controller('finance')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class FinanceController {
  constructor(private readonly financeService: FinanceService) {}

  @Get('summary')
  getSummary(@Query('startDate') startDate?: string, @Query('endDate') endDate?: string) {
    return this.financeService.getSummary({ startDate, endDate });
  }

  @Get('entries')
  listEntries(
    @Query('direction') direction?: 'PAYABLE' | 'RECEIVABLE',
    @Query('status') status?: string,
    @Query('matchId') matchId?: string,
  ) {
    return this.financeService.listEntries({ direction, status, matchId });
  }

  @Get('rates')
  listRates(@Query('stadiumId') stadiumId?: string, @Query('active') active?: string) {
    return this.financeService.listRates({
      stadiumId,
      active: active === undefined || active === '' ? undefined : active === 'true',
    });
  }

  @Post('rates')
  createRate(@Body() body: {
    stadiumId: string;
    validFrom: string;
    validUntil?: string;
    dcoFee: number;
    assistantFee: number;
    travelExpense: number;
    notes?: string;
  }) {
    return this.financeService.createRate(body);
  }

  @Patch('rates/:id')
  updateRate(@Param('id') id: string, @Body() body: {
    stadiumId?: string;
    validFrom?: string;
    validUntil?: string | null;
    dcoFee?: number;
    assistantFee?: number;
    travelExpense?: number;
    notes?: string | null;
    active?: boolean;
  }) {
    return this.financeService.updateRate(id, body);
  }

  @Patch('rates/:id/toggle')
  toggleRate(@Param('id') id: string) {
    return this.financeService.toggleRate(id);
  }

  @Post('matches/:matchId/generate')
  generateForMatch(@Param('matchId') matchId: string) {
    return this.financeService.generateForAcceptedScale(matchId);
  }

  @Post('matches/:matchId/receivable')
  createReceivable(@Param('matchId') matchId: string, @Body() body: {
    amount: number;
    dueDate?: string;
    notes?: string;
  }) {
    return this.financeService.createCbfReceivable(matchId, body);
  }

  @Patch('entries/:id/pay')
  payEntry(@Param('id') id: string, @Body() body: any) {
    return this.financeService.payEntry(id, body);
  }

  @Patch('entries/:id/receive')
  receiveEntry(@Param('id') id: string, @Body() body: any) {
    return this.financeService.receiveEntry(id, body);
  }

  @Post('batches')
  createPaymentBatch(@Body() body: any) {
    return this.financeService.createPaymentBatch(body);
  }
}
