import { ApiProperty } from '@nestjs/swagger';
import { PlanCategory, PlanType } from '@prisma/client';
import { IsEnum, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreatePlanDto {
  @ApiProperty({
    description: 'The ID of the child to sponsor',
    example: 'uuid-1234',
  })
  @IsString()
  @IsNotEmpty()
  childId: string;

  @ApiProperty({ description: 'Category of the plan', enum: PlanCategory })
  @IsEnum(PlanCategory)
  @IsNotEmpty()
  category: PlanCategory;

  @ApiProperty({ description: 'Type of the plan', enum: PlanType })
  @IsEnum(PlanType)
  @IsNotEmpty()
  type: PlanType;

  @ApiProperty({ description: 'Amount pledge', example: 50.0 })
  @IsNumber()
  @IsNotEmpty()
  amount: number;
}
