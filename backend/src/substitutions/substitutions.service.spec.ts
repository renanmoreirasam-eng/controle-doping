import { Test, TestingModule } from '@nestjs/testing';
import { SubstitutionsService } from './substitutions.service';
import { PrismaService } from '../prisma/prisma.service';

describe('SubstitutionsService', () => {
  let service: SubstitutionsService;

  const mockPrismaService = {
    substitution: {
      create: jest.fn(),
      findMany: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SubstitutionsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<SubstitutionsService>(SubstitutionsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
