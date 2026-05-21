import { Test, TestingModule } from '@nestjs/testing';
import { MatchOfficialsService } from './match-officials.service';

describe('MatchOfficialsService', () => {
  let service: MatchOfficialsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MatchOfficialsService],
    }).compile();

    service = module.get<MatchOfficialsService>(MatchOfficialsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
