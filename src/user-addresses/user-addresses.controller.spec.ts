import { Test, TestingModule } from '@nestjs/testing';
import { UserAddressesController } from './user-addresses.controller';
import { UserAddressesService } from './user-addresses.service';

const mockService = {
  create: jest.fn(), findAll: jest.fn(), findOne: jest.fn(),
  findByUserId: jest.fn(), upsertByUserId: jest.fn(), deleteByUserId: jest.fn(),
  update: jest.fn(), remove: jest.fn(),
};

const addrDto = { firstName: 'Jane', lastName: 'Doe', address: '123', postalCode: '10001', city: 'NY', phone: '+1', countryId: 'US' };

describe('UserAddressesController', () => {
  let controller: UserAddressesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserAddressesController],
      providers: [{ provide: UserAddressesService, useValue: mockService }],
    }).compile();
    controller = module.get(UserAddressesController);
    jest.clearAllMocks();
  });

  it('create delegates to service', () => { controller.create({ ...addrDto, userId: 'u1' }); expect(mockService.create).toHaveBeenCalled(); });
  it('findAll delegates to service', () => { controller.findAll(); expect(mockService.findAll).toHaveBeenCalled(); });
  it('findOne delegates to service', () => { controller.findOne('a1'); expect(mockService.findOne).toHaveBeenCalledWith('a1'); });
  it('findByUserId delegates to service', () => { controller.findByUserId('u1'); expect(mockService.findByUserId).toHaveBeenCalledWith('u1'); });
  it('upsertByUserId delegates to service', () => { controller.upsertByUserId('u1', addrDto); expect(mockService.upsertByUserId).toHaveBeenCalledWith('u1', addrDto); });
  it('deleteByUserId delegates to service', () => { controller.deleteByUserId('u1'); expect(mockService.deleteByUserId).toHaveBeenCalledWith('u1'); });
  it('update delegates to service', () => { controller.update('a1', { city: 'LA' }); expect(mockService.update).toHaveBeenCalledWith('a1', { city: 'LA' }); });
  it('remove delegates to service', () => { controller.remove('a1'); expect(mockService.remove).toHaveBeenCalledWith('a1'); });
});
