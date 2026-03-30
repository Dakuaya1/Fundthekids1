import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Request,
  UseGuards,
  Param,
} from '@nestjs/common';
import { GuardianService } from './guardian.service';
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard';
import { RolesGuard } from '../../core/guards/roles.guard';
import { Roles } from '../../core/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AssignGuardianDto } from './dto/assign-guardian.dto';
import { UpdateGuardianServiceDto } from './dto/update-guardian-service.dto';

@ApiTags('Guardian')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('guardian')
export class GuardianController {
  constructor(private readonly guardianService: GuardianService) {}

  @Get('available')
  @Roles(Role.NGO, Role.ADMIN)
  @ApiOperation({ summary: 'Get available guardians for assignment' })
  getAvailableGuardians() {
    return this.guardianService.getAvailableGuardians();
  }

  @Get('dashboard')
  @Roles(Role.GUARDIAN)
  @ApiOperation({ summary: 'Get guardian dashboard data' })
  getGuardianDashboard(@Request() req: any) {
    return this.guardianService.getGuardianDashboard(req.user.id);
  }

  @Post('assign-child')
  @Roles(Role.NGO, Role.ADMIN)
  @ApiOperation({ summary: 'Assign a verified child to a guardian' })
  assignChild(@Request() req: any, @Body() dto: AssignGuardianDto) {
    return this.guardianService.assignGuardianToChild(
      req.user.id,
      req.user.role,
      dto,
    );
  }

  @Patch('services/:childId')
  @Roles(Role.GUARDIAN)
  @ApiOperation({
    summary: 'Update service delivery progress for an assigned child',
  })
  updateServices(
    @Request() req: any,
    @Param('childId') childId: string,
    @Body() dto: UpdateGuardianServiceDto,
  ) {
    return this.guardianService.updateServiceForGuardian(
      req.user.id,
      childId,
      dto,
    );
  }
}
