import { Test, TestingModule } from '@nestjs/testing';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';

const mockService = { verifyPaypalPayment: jest.fn() };

describe('PaymentsController', () => {
  let controller: PaymentsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PaymentsController],
      providers: [{ provide: PaymentsService, useValue: mockService }],
    }).compile();
    controller = module.get(PaymentsController);
    jest.clearAllMocks();
  });

  it('verifyPaypal delegates to PaymentsService.verifyPaypalPayment', () => {
    mockService.verifyPaypalPayment.mockResolvedValue({ ok: true });
    controller.verifyPaypal({ transactionId: 'paypal-tx-1' });
    expect(mockService.verifyPaypalPayment).toHaveBeenCalledWith('paypal-tx-1');
  });
});
