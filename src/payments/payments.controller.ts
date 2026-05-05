import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { VerifyPaypalPaymentDto } from './dto/verify-paypal-payment.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiBearerAuth()
@ApiTags('Payments')
@UseGuards(JwtAuthGuard)
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @ApiOperation({ summary: 'Verify a PayPal payment and mark order as paid' })
  @Post('paypal/verify')
  verifyPaypal(@Body() dto: VerifyPaypalPaymentDto) {
    return this.paymentsService.verifyPaypalPayment(dto.transactionId);
  }
}
