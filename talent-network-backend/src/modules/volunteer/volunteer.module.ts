import { Module } from '@nestjs/common';
import { VolunteerService } from './volunteer.service';
import { VolunteerController } from './volunteer.controller';
import { PrismaService } from '../../config/prisma.service';
import { GamificationModule } from '../gamification/gamification.module';

@Module({
  imports: [GamificationModule],
  providers: [VolunteerService, PrismaService],
  controllers: [VolunteerController],
})
export class VolunteerModule {}
