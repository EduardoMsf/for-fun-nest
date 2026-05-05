import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

const mockService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

const user = { id: 'u1', name: 'Alice', email: 'alice@example.com', role: 'user' };

describe('UsersController', () => {
  let controller: UsersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [{ provide: UsersService, useValue: mockService }],
    }).compile();
    controller = module.get(UsersController);
    jest.clearAllMocks();
  });

  it('create delegates to UsersService.create', () => {
    mockService.create.mockResolvedValue(user);
    controller.create({ name: 'Alice', email: 'alice@example.com', password: 'pass' });
    expect(mockService.create).toHaveBeenCalled();
  });

  it('findAll delegates to UsersService.findAll', () => {
    mockService.findAll.mockResolvedValue([user]);
    controller.findAll();
    expect(mockService.findAll).toHaveBeenCalled();
  });

  it('findOne delegates to UsersService.findOne', () => {
    mockService.findOne.mockResolvedValue(user);
    controller.findOne('u1');
    expect(mockService.findOne).toHaveBeenCalledWith('u1');
  });

  it('update delegates to UsersService.update', () => {
    mockService.update.mockResolvedValue(user);
    controller.update('u1', { name: 'Updated' });
    expect(mockService.update).toHaveBeenCalledWith('u1', { name: 'Updated' });
  });

  it('remove delegates to UsersService.remove', () => {
    mockService.remove.mockResolvedValue(user);
    controller.remove('u1');
    expect(mockService.remove).toHaveBeenCalledWith('u1');
  });
});
