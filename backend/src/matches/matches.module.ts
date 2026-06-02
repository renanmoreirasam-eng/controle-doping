import { Module } from '@nestjs/common';
import { MatchesService } from './matches.service';
import { MatchesController } from './matches.controller';
import { PushModule } from '../push/push.module';

@Module({
  imports: [PushModule],
  providers: [MatchesService],
  controllers: [MatchesController],
})
export class MatchesModule {}
