import { Module } from '@nestjs/common';
import { ExtraMaterialsController } from './extra-materials.controller';
import { ExtraMaterialsService } from './extra-materials.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ExtraMaterialsController],
  providers: [ExtraMaterialsService],
  exports: [ExtraMaterialsService],
})
export class ExtraMaterialsModule {}
