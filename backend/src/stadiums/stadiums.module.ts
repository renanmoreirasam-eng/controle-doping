import { Module } from '@nestjs/common';
import { StadiumsService } from './stadiums.service';
import { StadiumsController } from './stadiums.controller';

@Module({
  providers: [StadiumsService],
  controllers: [StadiumsController]
})
export class StadiumsModule {}
