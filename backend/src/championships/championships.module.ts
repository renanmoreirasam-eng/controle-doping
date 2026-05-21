import { Module } from '@nestjs/common';
import { ChampionshipsService } from './championships.service';
import { ChampionshipsController } from './championships.controller';

@Module({
  providers: [ChampionshipsService],
  controllers: [ChampionshipsController]
})
export class ChampionshipsModule {}
