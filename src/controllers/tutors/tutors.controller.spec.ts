import { Test, TestingModule } from '@nestjs/testing';
import { TutorsController } from './tutors.controller';

describe('Tutors Controller', () => {
  let controller: TutorsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TutorsController],
    }).compile();

    controller = module.get<TutorsController>(TutorsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
