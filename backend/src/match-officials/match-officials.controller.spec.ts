import { Test, TestingModule } from '@nestjs/testing';
import { MatchOfficialsController } from './match-officials.controller';
import { MatchOfficialsService } from './match-officials.service';

describe('MatchOfficialsController', () => {
  let controller: MatchOfficialsController;

  const mockMatchOfficialsService = {
    create: jest.fn(),
    confirm: jest.fn(),
    refuse: jest.fn(),
    remove: jest.fn(),
    findAll: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MatchOfficialsController],
      providers: [
        {
          provide: MatchOfficialsService,
          useValue: mockMatchOfficialsService,
        },
      ],
    }).compile();

    controller = module.get<MatchOfficialsController>(
      MatchOfficialsController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});