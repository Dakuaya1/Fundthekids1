import { Module } from '@nestjs/common';
import { PaymentEngineService } from './payment-engine.service';
import { PaymentEngineController } from './payment-engine.controller';
import { PrismaService } from '../../config/prisma.service';
import { GuardianModule } from '../guardian/guardian.module';

@Module({
  imports: [GuardianModule],
  providers: [PaymentEngineService, PrismaService],
  controllers: [PaymentEngineController],
  exports: [PaymentEngineService],
})
export class PaymentEngineModule {}
