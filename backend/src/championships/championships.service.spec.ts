import { Test, TestingModule } from '@nestjs/testing';
import { ChampionshipsService } from './championships.service';

describe('ChampionshipsService', () => {
  let service: ChampionshipsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ChampionshipsService],
    }).compile();

    service = module.get<ChampionshipsService>(ChampionshipsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
