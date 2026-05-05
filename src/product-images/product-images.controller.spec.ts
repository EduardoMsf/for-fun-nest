import { Test, TestingModule } from '@nestjs/testing';
import { ProductImagesController } from './product-images.controller';
import { ProductImagesService } from './product-images.service';

const mockService = { create: jest.fn(), findAll: jest.fn(), findOne: jest.fn(), update: jest.fn(), remove: jest.fn() };

describe('ProductImagesController', () => {
  let controller: ProductImagesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductImagesController],
      providers: [{ provide: ProductImagesService, useValue: mockService }],
    }).compile();
    controller = module.get(ProductImagesController);
    jest.clearAllMocks();
  });

  it('create delegates to service', () => { controller.create({ url: 'img.jpg', productId: 'p1' }); expect(mockService.create).toHaveBeenCalled(); });
  it('findAll delegates to service', () => { controller.findAll(); expect(mockService.findAll).toHaveBeenCalled(); });
  it('findOne delegates to service with numeric id', () => { controller.findOne(1); expect(mockService.findOne).toHaveBeenCalledWith(1); });
  it('update delegates to service', () => { controller.update(1, { url: 'back.jpg' }); expect(mockService.update).toHaveBeenCalledWith(1, { url: 'back.jpg' }); });
  it('remove delegates to service', () => { controller.remove(1); expect(mockService.remove).toHaveBeenCalledWith(1); });
});
