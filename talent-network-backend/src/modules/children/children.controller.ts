import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ChildrenService } from './children.service';
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard';
import { RolesGuard } from '../../core/guards/roles.guard';
import { Roles } from '../../core/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('Children')
@ApiBearerAuth()
@Controller('children')
export class ChildrenController {
  constructor(private readonly childrenService: ChildrenService) { }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.NGO, Role.ADMIN)
  @Post()
  create(@Body() createChildDto: any) {
    return this.childrenService.create(createChildDto);
  }

  @Get()
  findAll() {
    return this.childrenService.findAll();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SPONSOR, Role.NGO, Role.VOLUNTEER, Role.GUARDIAN)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.childrenService.findOne(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.NGO, Role.ADMIN, Role.GUARDIAN)
  @Post(':id/reports')
  addReport(
    @Param('id') id: string,
    @Request() req: any,
    @Body() createReportDto: any, // Using 'any' locally to avoid unexported strict typescript errors if not fully configured, normally CreateReportDto
  ) {
    return this.childrenService.addReport(id, req.user.id, createReportDto);
  }
}
