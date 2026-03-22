import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';

export class CreatePledgeDto {
  @ApiProperty({
    description: 'The ID of the child to support',
    example: 'uuid-1234',
  })
  @IsString()
  @IsNotEmpty()
  childId: string;

  @ApiProperty({ description: 'Demo pledge amount', example: 50 })
  @IsNumber()
  @Min(1)
  amount: number;
}
