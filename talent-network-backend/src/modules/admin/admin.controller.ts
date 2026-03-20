import {
  Controller,
  Get,
  Patch,
  UseGuards,
  Query,
  Param,
  Body,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard';
import { RolesGuard } from '../../core/guards/roles.guard';
import { Roles } from '../../core/decorators/roles.decorator';
import { Role } from '@prisma/client';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiQuery,
} from '@nestjs/swagger';

@ApiTags('Admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('stats')
  @ApiOperation({ summary: 'Get high-level system metrics (Admin Only)' })
  getSystemMetrics() {
    return this.adminService.getSystemMetrics();
  }

  @Get('users')
  @ApiOperation({ summary: 'Fetch a paginated list of all users' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'role', required: false, enum: Role })
  getUsers(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
    @Query('role') role?: string,
  ) {
    return this.adminService.getUsers(page, limit, role);
  }

  @Patch('users/:id/status')
  @ApiOperation({
    summary: 'Execute an admin action on a user (e.g. VERIFY_NGO)',
  })
  updateUserStatus(
    @Param('id') id: string,
    @Body('action') action: 'VERIFY_NGO' | 'BAN_USER',
  ) {
    return this.adminService.updateUserStatus(id, action);
  }
}
