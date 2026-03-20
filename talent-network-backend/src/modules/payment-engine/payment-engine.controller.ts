import {
  Controller,
  Post,
  Req,
  Headers,
  UnauthorizedException,
} from '@nestjs/common';
import type { RawBodyRequest } from '@nestjs/common';
import { PaymentEngineService } from './payment-engine.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import type { Request } from 'express';

@ApiTags('Payments')
@Controller('payments')
export class PaymentEngineController {
  constructor(private readonly paymentEngineService: PaymentEngineService) {}

  @Post('webhook')
  @ApiOperation({
    summary: 'Stripe Webhook Listener (Strictly Unauthenticated)',
  })
  async handleStripeWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('stripe-signature') signature: string,
  ) {
    if (!signature || !req.rawBody) {
      throw new UnauthorizedException('Missing stripe signature or raw body');
    }

    await this.paymentEngineService.handleWebhook(req.rawBody, signature);
    return { received: true };
  }
}
