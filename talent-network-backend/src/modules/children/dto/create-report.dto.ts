import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class CreateReportDto {
  @ApiProperty({
    description: 'The raw text update provided by the NGO worker',
    example: 'Alex had a great term!',
  })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiProperty({
    description: 'Optional multimedia proof URI',
    required: false,
  })
  @IsString()
  @IsOptional()
  mediaUri?: string;
}
