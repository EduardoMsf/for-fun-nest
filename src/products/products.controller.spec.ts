import { Test, TestingModule } from '@nestjs/testing';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';

const mockService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  findBySlug: jest.fn(),
  getStockBySlug: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

describe('ProductsController', () => {
  let controller: ProductsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductsController],
      providers: [{ provide: ProductsService, useValue: mockService }],
    }).compile();
    controller = module.get(ProductsController);
    jest.clearAllMocks();
  });

  it('create delegates to ProductsService.create', () => {
    controller.create({ title: 'T', description: 'd', slug: 's', inStock: 1, gender: 'men' as never, categoryId: 'c1' });
    expect(mockService.create).toHaveBeenCalled();
  });

  it('findAll delegates to ProductsService.findAll', () => {
    controller.findAll({});
    expect(mockService.findAll).toHaveBeenCalled();
  });

  it('findOne delegates to ProductsService.findOne', () => {
    controller.findOne('p1');
    expect(mockService.findOne).toHaveBeenCalledWith('p1');
  });

  it('findBySlug delegates to ProductsService.findBySlug', () => {
    controller.findBySlug('test-shirt');
    expect(mockService.findBySlug).toHaveBeenCalledWith('test-shirt');
  });

  it('getStockBySlug delegates to ProductsService.getStockBySlug', () => {
    controller.getStockBySlug('test-shirt');
    expect(mockService.getStockBySlug).toHaveBeenCalledWith('test-shirt');
  });

  it('update delegates to ProductsService.update', () => {
    controller.update('p1', { price: 99 });
    expect(mockService.update).toHaveBeenCalledWith('p1', { price: 99 });
  });

  it('remove delegates to ProductsService.remove', () => {
    controller.remove('p1');
    expect(mockService.remove).toHaveBeenCalledWith('p1');
  });
});
