import { Module } from '@nestjs/common';
import { SponsorshipService } from './sponsorship.service';
import { SponsorshipController } from './sponsorship.controller';
import { PrismaService } from '../../config/prisma.service';
import { GamificationModule } from '../gamification/gamification.module';
import { PaymentEngineModule } from '../payment-engine/payment-engine.module';

@Module({
  imports: [GamificationModule, PaymentEngineModule],
  providers: [SponsorshipService, PrismaService],
  controllers: [SponsorshipController],
})
export class SponsorshipModule {}
