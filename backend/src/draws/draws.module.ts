import { Module } from '@nestjs/common';
import { DrawsService } from './draws.service';
import { DrawsController } from './draws.controller';
import { PushModule } from '../push/push.module';

@Module({
  imports: [PushModule],
  providers: [DrawsService],
  controllers: [DrawsController],
})
export class DrawsModule {}
