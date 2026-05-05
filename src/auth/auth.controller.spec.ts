import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

const mockService = {
  login: jest.fn(),
  register: jest.fn(),
};

describe('AuthController', () => {
  let controller: AuthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: mockService }],
    }).compile();
    controller = module.get(AuthController);
    jest.clearAllMocks();
  });

  it('login delegates to AuthService.login', async () => {
    const dto = { email: 'a@a.com', password: 'pass' };
    mockService.login.mockResolvedValue({ token: 't', user: {} });
    await controller.login(dto);
    expect(mockService.login).toHaveBeenCalledWith(dto);
  });

  it('register delegates to AuthService.register', async () => {
    const dto = { name: 'Alice', email: 'a@a.com', password: 'pass' };
    mockService.register.mockResolvedValue({ token: 't', user: {} });
    await controller.register(dto);
    expect(mockService.register).toHaveBeenCalledWith(dto);
  });

  it('profile returns the current user from request', () => {
    const user = { id: 'u1', email: 'a@a.com' };
    const result = controller.profile(user);
    expect(result).toEqual(user);
  });
});
