import { Test, TestingModule } from '@nestjs/testing';
import { SubstitutionsController } from './substitutions.controller';
import { SubstitutionsService } from './substitutions.service';

describe('SubstitutionsController', () => {
  let controller: SubstitutionsController;

  const mockSubstitutionsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SubstitutionsController],
      providers: [
        {
          provide: SubstitutionsService,
          useValue: mockSubstitutionsService,
        },
      ],
    }).compile();

    controller = module.get<SubstitutionsController>(SubstitutionsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
