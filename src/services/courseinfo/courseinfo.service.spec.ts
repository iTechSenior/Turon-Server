import { Test, TestingModule } from '@nestjs/testing';
import { CourseInfoService } from './courseinfo.service';

describe('CourseInfoService', () => {
  let service: CourseInfoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CourseInfoService],
    }).compile();

    service = module.get<CourseInfoService>(CourseInfoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
