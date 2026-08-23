import { Module } from '@nestjs/common';
import { MatchOfficialsService } from './match-officials.service';
import { MatchOfficialsController } from './match-officials.controller';
import { MatchOfficialsPublicController } from './match-officials-public.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { PushModule } from '../push/push.module';

@Module({
  imports: [PrismaModule, PushModule],
  providers: [MatchOfficialsService],
  controllers: [MatchOfficialsController, MatchOfficialsPublicController],
})
export class MatchOfficialsModule {}
