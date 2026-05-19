import { Module } from '@nestjs/common';
import { OfficialsService } from './officials.service';
import { OfficialsController } from './officials.controller';

@Module({
  providers: [OfficialsService],
  controllers: [OfficialsController]
})
export class OfficialsModule {}
