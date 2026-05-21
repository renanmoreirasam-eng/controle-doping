import { Test, TestingModule } from '@nestjs/testing';
import { RoomInspectionsService } from './room-inspections.service';

describe('RoomInspectionsService', () => {
  let service: RoomInspectionsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RoomInspectionsService],
    }).compile();

    service = module.get<RoomInspectionsService>(RoomInspectionsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
