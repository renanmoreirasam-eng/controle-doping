import { Module } from '@nestjs/common';
import { SubstitutionsService } from './substitutions.service';
import { SubstitutionsController } from './substitutions.controller';

@Module({
  controllers: [SubstitutionsController],
  providers: [SubstitutionsService],
})
export class SubstitutionsModule {}
