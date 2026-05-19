import { Test, TestingModule } from '@nestjs/testing';
import { OfficialsController } from './officials.controller';

describe('OfficialsController', () => {
  let controller: OfficialsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OfficialsController],
    }).compile();

    controller = module.get<OfficialsController>(OfficialsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
