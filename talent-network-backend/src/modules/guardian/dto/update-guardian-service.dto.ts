import { ApiPropertyOptional } from '@nestjs/swagger';
import { ServiceStatus } from '@prisma/client';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export class UpdateGuardianServiceDto {
  @ApiPropertyOptional({ enum: ServiceStatus })
  @IsEnum(ServiceStatus)
  @IsOptional()
  schoolStatus?: ServiceStatus;

  @ApiPropertyOptional({ enum: ServiceStatus })
  @IsEnum(ServiceStatus)
  @IsOptional()
  lodgingStatus?: ServiceStatus;

  @ApiPropertyOptional({ enum: ServiceStatus })
  @IsEnum(ServiceStatus)
  @IsOptional()
  activityStatus?: ServiceStatus;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  schoolName?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  lodgingDetails?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  activityDetails?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  notes?: string;
}
