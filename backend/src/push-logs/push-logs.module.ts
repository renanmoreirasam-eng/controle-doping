import { Module } from '@nestjs/common';

import { PrismaModule } from '../prisma/prisma.module';

import { PushLogsController } from './push-logs.controller';
import { PushLogsService } from './push-logs.service';

@Module({
  imports: [PrismaModule],
  controllers: [PushLogsController],
  providers: [PushLogsService],
})
export class PushLogsModule {}

