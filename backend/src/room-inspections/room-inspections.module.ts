import { Module } from '@nestjs/common';
import { RoomInspectionsService } from './room-inspections.service';
import { RoomInspectionsController } from './room-inspections.controller';

@Module({
  providers: [RoomInspectionsService],
  controllers: [RoomInspectionsController]
})
export class RoomInspectionsModule {}
