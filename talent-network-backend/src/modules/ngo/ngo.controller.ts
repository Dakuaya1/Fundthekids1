import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { NgoService } from './ngo.service';
import { CreateChildDto } from './dto/create-child.dto';
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard';
import { RolesGuard } from '../../core/guards/roles.guard';
import { Roles } from '../../core/decorators/roles.decorator';
import { Role } from '@prisma/client';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';

@ApiTags('NGO')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('ngo')
export class NgoController {
  constructor(private readonly ngoService: NgoService) {}

  @Post('children')
  @Roles(Role.NGO)
  @ApiOperation({ summary: 'Register a new child (NGO only)' })
  @ApiResponse({ status: 201, description: 'Child successfully registered.' })
  createChild(@Request() req: any, @Body() createChildDto: CreateChildDto) {
    // req.user has the JWT payload mapped by passport
    return this.ngoService.createChild(req.user.id, createChildDto);
  }

  @Get('children')
  @Roles(Role.NGO)
  @ApiOperation({ summary: 'Get all children managed by this NGO' })
  getChildren(@Request() req: any) {
    return this.ngoService.getChildren(req.user.id);
  }
}
