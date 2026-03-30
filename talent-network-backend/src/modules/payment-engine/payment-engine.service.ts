import { Injectable, Logger } from '@nestjs/common';
import Stripe from 'stripe';
import { PrismaService } from '../../config/prisma.service';
import { GuardianService } from '../guardian/guardian.service';

export interface IPaymentWrapper {
  createCheckoutSession(
    sponsorId: string,
    planId: string,
    amount: number,
    type: 'MONTHLY' | 'ONE_TIME',
    childName: string,
  ): Promise<string>; // Returns checkout URL
  handleWebhook(payload: Buffer, signature: string): Promise<void>;
}

@Injectable()
export class PaymentEngineService implements IPaymentWrapper {
  private stripe: Stripe;
  private readonly logger = new Logger(PaymentEngineService.name);

  constructor(
    private prisma: PrismaService,
    private guardianService: GuardianService,
  ) {
    // Fallback to a mock key to prevent crashing if user hasn't supplied one in .env yet
    this.stripe = new Stripe(
      process.env.STRIPE_SECRET_KEY || 'sk_test_mocked',
      {
        apiVersion: '2025-01-27.acacia' as any,
      },
    );
  }

  async createCheckoutSession(
    sponsorId: string,
    planId: string,
    amount: number,
    type: 'MONTHLY' | 'ONE_TIME',
    childName: string,
  ): Promise<string> {
    try {
      const frontendUrl =
        process.env.FRONTEND_URL || process.env.NEXT_PUBLIC_FRONTEND_URL;

      const session = await this.stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: `Sponsorship for ${childName}`,
                description:
                  type === 'MONTHLY'
                    ? 'Monthly recurring sponsorship'
                    : 'One-time sponsorship gift',
              },
              unit_amount: amount * 100, // Stripe expects cents
              ...(type === 'MONTHLY' && { recurring: { interval: 'month' } }),
            },
            quantity: 1,
          },
        ],
        mode: type === 'MONTHLY' ? 'subscription' : 'payment',
        success_url: `${frontendUrl}/dashboard?payment=success&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${frontendUrl}/dashboard?payment=cancel`,
        metadata: {
          sponsorId,
          planId,
          type,
        },
      });

      return session.url as string;
    } catch (error) {
      this.logger.error('Failed to create Stripe Checkout Session', error);
      // If we are using a mock key, just return a fake success URL so the dev flow isn't completely broken
      if (!process.env.STRIPE_SECRET_KEY) {
        this.logger.warn(
          'Returning mock checkout URL because STRIPE_SECRET_KEY is missing',
        );
        const frontendUrl =
          process.env.FRONTEND_URL || process.env.NEXT_PUBLIC_FRONTEND_URL;
        return `${frontendUrl}/dashboard?payment=success&mock=true`;
      }
      throw new Error('Payment service unavailable');
    }
  }

  async handleWebhook(payload: Buffer, signature: string): Promise<void> {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!webhookSecret) {
      this.logger.warn(
        'Stripe webhook disabled: STRIPE_WEBHOOK_SECRET not defined',
      );
      return;
    }

    let event: Stripe.Event;

    try {
      event = this.stripe.webhooks.constructEvent(
        payload,
        signature,
        webhookSecret,
      );
    } catch (err: any) {
      this.logger.error(
        `Webhook signature verification failed: ${err.message}`,
      );
      throw new Error(`Webhook Error: ${err.message}`);
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const metadata = session.metadata;

      if (metadata && metadata.planId && metadata.sponsorId) {
        // Determine PlanStatus
        // If one-time, it's completed immediately. If monthly, the plan is now 'ACTIVE' and payments will recur.

        await this.prisma.payment.create({
          data: {
            sponsorId: metadata.sponsorId,
            planId: metadata.planId,
            amount: session.amount_total ? session.amount_total / 100 : 0,
            currency: session.currency || 'USD',
            status: 'COMPLETED',
          },
        });

        // Ensure the linked plan is marked active
        await this.prisma.sponsorshipPlan.update({
          where: { id: metadata.planId },
          data: { status: 'ACTIVE' },
        });

        const plan = await this.prisma.sponsorshipPlan.findUnique({
          where: { id: metadata.planId },
          select: { childId: true },
        });

        if (plan) {
          await this.guardianService.autoAssignGuardianForFundedChild(
            plan.childId,
          );
        }

        this.logger.log(
          `Payment confirmed and plan ${metadata.planId} activated for sponsor ${metadata.sponsorId}`,
        );
      }
    }
  }
}
