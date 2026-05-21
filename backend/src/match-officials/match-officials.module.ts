import { Module } from '@nestjs/common';
import { MatchOfficialsService } from './match-officials.service';
import { MatchOfficialsController } from './match-officials.controller';

@Module({
  providers: [MatchOfficialsService],
  controllers: [MatchOfficialsController]
})
export class MatchOfficialsModule {}
