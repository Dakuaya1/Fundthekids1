import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../core/guards/jwt-auth.guard';
import { RolesGuard } from '../core/guards/roles.guard';
import { Roles } from '../core/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { AiService } from './ai.service';
import { AiQueryDto } from './dto/ai-query.dto';

@ApiTags('AI')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('query')
  @ApiOperation({ summary: 'Run the isolated AI agent workflow' })
  query(@Body() body: AiQueryDto, @Request() req: any) {
    return this.aiService.query(body.prompt, req.user.id, req.user.role);
  }

  @Get('admin-report/latest')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Get the latest persisted AI admin report' })
  getLatestAdminReport() {
    return this.aiService.getLatestAdminReport();
  }
}
