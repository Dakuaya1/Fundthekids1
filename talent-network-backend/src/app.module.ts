import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './config/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { ChildrenModule } from './modules/children/children.module';
import { SponsorshipModule } from './modules/sponsorship/sponsorship.module';
import { NgoModule } from './modules/ngo/ngo.module';
import { VolunteerModule } from './modules/volunteer/volunteer.module';
import { GamificationModule } from './modules/gamification/gamification.module';
import { AiEngineModule } from './modules/ai-engine/ai-engine.module';
import { PaymentEngineModule } from './modules/payment-engine/payment-engine.module';
import { AdminModule } from './modules/admin/admin.module';
import { AiAgentsModule } from './ai-agents/ai.module';
import { GuardianModule } from './modules/guardian/guardian.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    UsersModule,
    ChildrenModule,
    SponsorshipModule,
    NgoModule,
    VolunteerModule,
    GamificationModule,
    AiEngineModule,
    PaymentEngineModule,
    AdminModule,
    GuardianModule,
    AiAgentsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
