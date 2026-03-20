import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';
import { CreatePlanDto } from './dto/create-plan.dto';
import { GamificationService } from '../gamification/gamification.service';
import { PaymentEngineService } from '../payment-engine/payment-engine.service';

@Injectable()
export class SponsorshipService {
  constructor(
    private prisma: PrismaService,
    private gamificationService: GamificationService,
    private paymentEngineService: PaymentEngineService,
  ) {}

  async createPlan(userId: string, createPlanDto: CreatePlanDto) {
    const sponsor = await this.prisma.sponsor.findUnique({
      where: { userId },
    });

    if (!sponsor) {
      throw new NotFoundException('Sponsor profile not found for this user');
    }

    const plan = await this.prisma.sponsorshipPlan.create({
      data: {
        childId: createPlanDto.childId,
        sponsorId: sponsor.id,
        category: createPlanDto.category,
        type: createPlanDto.type,
        amount: createPlanDto.amount,
        status: 'INACTIVE', // Starts inactive until Stripe webhook marks it ACTIVE
      },
    });

    // Award points based on pledge amount (1 point per dollar)
    const points = Math.floor(createPlanDto.amount);
    await this.gamificationService.awardPoints(
      userId,
      points,
      `Created Sponsorship Plan for ${createPlanDto.amount} USD`,
    );

    const child = await this.prisma.child.findUnique({
      where: { id: createPlanDto.childId },
    });
    const childName = child ? child.name : 'a Child';

    // Generate Stripe Checkout URL
    const checkoutUrl = await this.paymentEngineService.createCheckoutSession(
      sponsor.id,
      plan.id,
      createPlanDto.amount,
      createPlanDto.type as any,
      childName,
    );

    return { plan, checkoutUrl };
  }

  async getMyPlans(userId: string) {
    const sponsor = await this.prisma.sponsor.findUnique({
      where: { userId },
    });

    if (!sponsor) {
      return [];
    }

    return this.prisma.sponsorshipPlan.findMany({
      where: { sponsorId: sponsor.id },
      include: { child: true },
    });
  }
}
