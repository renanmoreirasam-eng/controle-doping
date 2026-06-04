import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { AdminTasksController } from './admin-tasks.controller';
import { AdminTasksService } from './admin-tasks.service';

@Module({
  imports: [PrismaModule],
  controllers: [AdminTasksController],
  providers: [AdminTasksService],
})
export class AdminTasksModule {}
