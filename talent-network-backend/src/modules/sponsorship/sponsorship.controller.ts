import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { SponsorshipService } from './sponsorship.service';
import { CreatePlanDto } from './dto/create-plan.dto';
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard';
import { RolesGuard } from '../../core/guards/roles.guard';
import { Roles } from '../../core/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Sponsorships')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('sponsorships')
export class SponsorshipController {
  constructor(private readonly sponsorshipService: SponsorshipService) {}

  @Post('plan')
  @Roles(Role.SPONSOR)
  @ApiOperation({ summary: 'Create a new sponsorship plan for a child' })
  createPlan(@Request() req: any, @Body() createPlanDto: CreatePlanDto) {
    return this.sponsorshipService.createPlan(req.user.id, createPlanDto);
  }

  @Get('my-plans')
  @Roles(Role.SPONSOR)
  @ApiOperation({
    summary: 'Get all Active sponsorship plans for this sponsor',
  })
  getMyPlans(@Request() req: any) {
    return this.sponsorshipService.getMyPlans(req.user.id);
  }
}
