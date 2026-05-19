import { Test, TestingModule } from '@nestjs/testing';
import { OfficialsService } from './officials.service';

describe('OfficialsService', () => {
  let service: OfficialsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OfficialsService],
    }).compile();

    service = module.get<OfficialsService>(OfficialsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
