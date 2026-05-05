import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

interface PaypalTokenResponse {
  access_token: string;
}

interface PaypalOrderResponse {
  status: string;
  purchase_units: Array<{
    invoice_id: string;
  }>;
}

@Injectable()
export class PaymentsService {
  constructor(private readonly prisma: PrismaService) {}

  async verifyPaypalPayment(transactionId: string): Promise<{ ok: boolean }> {
    const token = await this.getPaypalBearerToken();
    const ordersUrl = process.env.PAYPAL_ORDERS_URL ?? 'https://api-m.sandbox.paypal.com/v2/checkout/orders';

    const res = await fetch(`${ordersUrl}/${transactionId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      throw new BadRequestException('Could not verify PayPal order');
    }

    const paypalOrder = (await res.json()) as PaypalOrderResponse;

    if (paypalOrder.status !== 'COMPLETED') {
      throw new BadRequestException(
        `PayPal order not completed. Status: ${paypalOrder.status}`,
      );
    }

    const orderId = paypalOrder.purchase_units[0]?.invoice_id;
    if (!orderId) {
      throw new BadRequestException('Missing invoice_id in PayPal response');
    }

    await this.prisma.order.update({
      where: { id: orderId },
      data: { isPaid: true, paidAt: new Date(), transactionId },
    });

    return { ok: true };
  }

  private async getPaypalBearerToken(): Promise<string> {
    const clientId = process.env.PAYPAL_CLIENT_ID;
    const secret = process.env.PAYPAL_SECRET;
    const oauthUrl =
      process.env.PAYPAL_OAUTH_URL ??
      'https://api-m.sandbox.paypal.com/v1/oauth2/token';

    if (!clientId || !secret) {
      throw new InternalServerErrorException('PayPal credentials not configured');
    }

    const credentials = Buffer.from(`${clientId}:${secret}`).toString('base64');

    const res = await fetch(oauthUrl, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
    });

    if (!res.ok) {
      throw new InternalServerErrorException('Failed to get PayPal bearer token');
    }

    const data = (await res.json()) as PaypalTokenResponse;
    return data.access_token;
  }
}
