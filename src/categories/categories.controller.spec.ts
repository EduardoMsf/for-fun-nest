import { Test, TestingModule } from '@nestjs/testing';
import { CategoriesController } from './categories.controller';
import { CategoriesService } from './categories.service';

const mockService = { create: jest.fn(), findAll: jest.fn(), findOne: jest.fn(), update: jest.fn(), remove: jest.fn() };

describe('CategoriesController', () => {
  let controller: CategoriesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CategoriesController],
      providers: [{ provide: CategoriesService, useValue: mockService }],
    }).compile();
    controller = module.get(CategoriesController);
    jest.clearAllMocks();
  });

  it('create delegates to service', () => { controller.create({ name: 'Shirts' }); expect(mockService.create).toHaveBeenCalled(); });
  it('findAll delegates to service', () => { controller.findAll(); expect(mockService.findAll).toHaveBeenCalled(); });
  it('findOne delegates to service', () => { controller.findOne('c1'); expect(mockService.findOne).toHaveBeenCalledWith('c1'); });
  it('update delegates to service', () => { controller.update('c1', { name: 'X' }); expect(mockService.update).toHaveBeenCalledWith('c1', { name: 'X' }); });
  it('remove delegates to service', () => { controller.remove('c1'); expect(mockService.remove).toHaveBeenCalledWith('c1'); });
});
