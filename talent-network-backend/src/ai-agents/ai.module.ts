import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { AdminService } from '../modules/admin/admin.service';
import { ChildrenService } from '../modules/children/children.service';
import { GamificationService } from '../modules/gamification/gamification.service';
import { PaymentEngineService } from '../modules/payment-engine/payment-engine.service';
import { SponsorshipService } from '../modules/sponsorship/sponsorship.service';
import { VolunteerService } from '../modules/volunteer/volunteer.service';
import { AiEngineService } from '../modules/ai-engine/ai-engine.service';
import { PrismaService } from '../config/prisma.service';
import { JwtAuthGuard } from '../core/guards/jwt-auth.guard';
import { RolesGuard } from '../core/guards/roles.guard';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { AnalysisAgent } from './agents/analysis.agent';
import { DataAgent } from './agents/data.agent';
import { EvaluatorAgent } from './agents/evaluator.agent';
import { NarrativeAgent } from './agents/narrative.agent';
import { PlannerAgent } from './agents/planner.agent';
import { AdminReportScheduler } from './scheduler/admin-report.scheduler';
import { AdminTool } from './tools/admin.tool';
import { ChildrenTool } from './tools/children.tool';
import { GamificationTool } from './tools/gamification.tool';
import { PaymentsTool } from './tools/payments.tool';
import { ReportsTool } from './tools/reports.tool';
import { SponsorshipTool } from './tools/sponsorship.tool';
import { ImpactGraphWorkflow } from './workflows/impact.graph';
import { GuardianModule } from '../modules/guardian/guardian.module';

@Module({
  imports: [ScheduleModule.forRoot(), GuardianModule],
  controllers: [AiController],
  providers: [
    PrismaService,
    AiEngineService,
    ChildrenService,
    GamificationService,
    PaymentEngineService,
    SponsorshipService,
    VolunteerService,
    AdminService,
    JwtAuthGuard,
    RolesGuard,
    AiService,
    PlannerAgent,
    DataAgent,
    AnalysisAgent,
    NarrativeAgent,
    EvaluatorAgent,
    ChildrenTool,
    SponsorshipTool,
    ReportsTool,
    PaymentsTool,
    AdminTool,
    GamificationTool,
    ImpactGraphWorkflow,
    AdminReportScheduler,
  ],
  exports: [AiService],
})
export class AiAgentsModule {}
