import { Test, TestingModule } from '@nestjs/testing';
import { RoomInspectionsController } from './room-inspections.controller';

describe('RoomInspectionsController', () => {
  let controller: RoomInspectionsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RoomInspectionsController],
    }).compile();

    controller = module.get<RoomInspectionsController>(RoomInspectionsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
