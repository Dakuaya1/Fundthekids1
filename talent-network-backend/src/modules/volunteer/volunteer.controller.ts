import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { VolunteerService } from './volunteer.service';
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard';
import { RolesGuard } from '../../core/guards/roles.guard';
import { Roles } from '../../core/decorators/roles.decorator';
import { Role, ValidationStatus } from '@prisma/client';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';

@ApiTags('Volunteer')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.VOLUNTEER)
@Controller('volunteer')
export class VolunteerController {
  constructor(private readonly volunteerService: VolunteerService) {}

  @Get('region-children')
  @ApiOperation({
    summary:
      'Get all children and pending reports in the volunteer assigned region',
  })
  getRegionChildren(@Request() req: any) {
    return this.volunteerService.getRegionChildren(req.user.id);
  }

  @Post('verify-report/:id')
  @ApiOperation({ summary: 'Approve or Reject an NGO progress report' })
  @ApiBody({
    schema: {
      properties: {
        status: { type: 'string', enum: ['APPROVED', 'REJECTED'] },
      },
    },
  })
  verifyReport(
    @Request() req: any,
    @Param('id') reportId: string,
    @Body('status') status: ValidationStatus,
  ) {
    return this.volunteerService.verifyReport(req.user.id, reportId, status);
  }
}
