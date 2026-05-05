import { BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { PaymentsService } from './payments.service';

const mockPrisma = {
  order: { update: jest.fn() },
};

const mockFetch = jest.fn();

describe('PaymentsService', () => {
  let service: PaymentsService;
  const originalFetch = global.fetch;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentsService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<PaymentsService>(PaymentsService);
    global.fetch = mockFetch;
    jest.clearAllMocks();

    process.env.PAYPAL_CLIENT_ID = 'test-client-id';
    process.env.PAYPAL_SECRET = 'test-secret';
    process.env.PAYPAL_OAUTH_URL = 'https://paypal.test/oauth';
    process.env.PAYPAL_ORDERS_URL = 'https://paypal.test/orders';
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  const mockTokenResponse = () =>
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ access_token: 'paypal-token' }),
    });

  describe('verifyPaypalPayment', () => {
    it('marks the order as paid when PayPal status is COMPLETED', async () => {
      mockTokenResponse();
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          status: 'COMPLETED',
          purchase_units: [{ invoice_id: 'order-123' }],
        }),
      });
      mockPrisma.order.update.mockResolvedValue({});

      const result = await service.verifyPaypalPayment('paypal-tx-1');

      expect(result).toEqual({ ok: true });
      expect(mockPrisma.order.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'order-123' },
          data: expect.objectContaining({ isPaid: true, transactionId: 'paypal-tx-1' }),
        }),
      );
    });

    it('throws BadRequestException when PayPal fetch fails', async () => {
      mockTokenResponse();
      mockFetch.mockResolvedValueOnce({ ok: false });

      await expect(service.verifyPaypalPayment('bad-tx')).rejects.toThrow(BadRequestException);
    });

    it('throws BadRequestException when PayPal status is not COMPLETED', async () => {
      mockTokenResponse();
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ status: 'PENDING', purchase_units: [{ invoice_id: 'ord1' }] }),
      });

      await expect(service.verifyPaypalPayment('tx-pending')).rejects.toThrow(BadRequestException);
    });

    it('throws BadRequestException when invoice_id is missing', async () => {
      mockTokenResponse();
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ status: 'COMPLETED', purchase_units: [{}] }),
      });

      await expect(service.verifyPaypalPayment('tx-no-invoice')).rejects.toThrow(BadRequestException);
    });

    it('throws InternalServerErrorException when PayPal credentials are missing', async () => {
      delete process.env.PAYPAL_CLIENT_ID;
      await expect(service.verifyPaypalPayment('tx-1')).rejects.toThrow(InternalServerErrorException);
    });

    it('throws InternalServerErrorException when OAuth token fetch fails', async () => {
      mockFetch.mockResolvedValueOnce({ ok: false });
      await expect(service.verifyPaypalPayment('tx-1')).rejects.toThrow(InternalServerErrorException);
    });
  });
});
