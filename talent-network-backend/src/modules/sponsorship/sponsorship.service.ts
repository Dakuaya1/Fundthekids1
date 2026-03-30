import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';
import { CreatePlanDto } from './dto/create-plan.dto';
import { CreatePledgeDto } from './dto/create-pledge.dto';
import { GamificationService } from '../gamification/gamification.service';
import { PaymentEngineService } from '../payment-engine/payment-engine.service';
import { PlanCategory, PlanStatus, PlanType } from '@prisma/client';
import { GuardianService } from '../guardian/guardian.service';

@Injectable()
export class SponsorshipService {
  constructor(
    private prisma: PrismaService,
    private gamificationService: GamificationService,
    private paymentEngineService: PaymentEngineService,
    private guardianService: GuardianService,
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

  async createPledge(userId: string, createPledgeDto: CreatePledgeDto) {
    const sponsor = await this.prisma.sponsor.findUnique({
      where: { userId },
    });

    if (!sponsor) {
      throw new NotFoundException('Sponsor profile not found for this user');
    }

    const child = await this.prisma.child.findUnique({
      where: { id: createPledgeDto.childId },
    });

    if (!child) {
      throw new NotFoundException('Child not found');
    }

    const createdPlan = await this.prisma.sponsorshipPlan.create({
      data: {
        childId: createPledgeDto.childId,
        sponsorId: sponsor.id,
        amount: createPledgeDto.amount,
        status: PlanStatus.ACTIVE,
        category: PlanCategory.EDUCATION,
        type: PlanType.MONTHLY,
      },
    });

    await this.gamificationService.awardPoints(
      userId,
      Math.floor(createPledgeDto.amount),
      `Created Demo Pledge for ${createPledgeDto.amount} USD`,
    );

    await this.prisma.payment.create({
      data: {
        sponsorId: sponsor.id,
        planId: createdPlan.id,
        amount: createPledgeDto.amount,
        currency: 'USD',
        status: 'COMPLETED',
      },
    });

    await this.guardianService.autoAssignGuardianForFundedChild(
      createPledgeDto.childId,
    );

    return { message: 'Pledge successful' };
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
