import { Module } from '@nestjs/common';

import { FinanceModule } from '../finance/finance.module';
import { MatchOfficialsService } from './match-officials.service';
import { MatchOfficialsController } from './match-officials.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { PushModule } from '../push/push.module';

@Module({
  imports: [PrismaModule, PushModule, FinanceModule],
  providers: [MatchOfficialsService],
  controllers: [MatchOfficialsController],
})
export class MatchOfficialsModule {}