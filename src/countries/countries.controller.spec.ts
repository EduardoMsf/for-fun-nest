import { Test, TestingModule } from '@nestjs/testing';
import { CountriesController } from './countries.controller';
import { CountriesService } from './countries.service';

const mockService = { create: jest.fn(), findAll: jest.fn(), findOne: jest.fn(), update: jest.fn(), remove: jest.fn() };

describe('CountriesController', () => {
  let controller: CountriesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CountriesController],
      providers: [{ provide: CountriesService, useValue: mockService }],
    }).compile();
    controller = module.get(CountriesController);
    jest.clearAllMocks();
  });

  it('create delegates to service', () => { controller.create({ id: 'US', name: 'United States' }); expect(mockService.create).toHaveBeenCalled(); });
  it('findAll delegates to service', () => { controller.findAll(); expect(mockService.findAll).toHaveBeenCalled(); });
  it('findOne delegates to service', () => { controller.findOne('US'); expect(mockService.findOne).toHaveBeenCalledWith('US'); });
  it('update delegates to service', () => { controller.update('US', { name: 'USA' }); expect(mockService.update).toHaveBeenCalledWith('US', { name: 'USA' }); });
  it('remove delegates to service', () => { controller.remove('US'); expect(mockService.remove).toHaveBeenCalledWith('US'); });
});
