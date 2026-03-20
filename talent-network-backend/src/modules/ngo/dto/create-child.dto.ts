import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class CreateChildDto {
  @ApiProperty({ description: 'The name of the child', example: 'Alex Smith' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Date of birth',
    example: '2015-05-14T00:00:00.000Z',
  })
  @IsDateString()
  @IsNotEmpty()
  dob: string;

  @ApiProperty({
    description: 'Talent discipline (e.g. Mathematics, Soccer)',
    example: 'Mathematics',
  })
  @IsString()
  @IsNotEmpty()
  talentCategory: string;

  @ApiProperty({ description: 'City of the child', example: 'Mumbai' })
  @IsString()
  @IsNotEmpty()
  city: string;

  @ApiProperty({ description: 'Specific location or neighborhood', example: 'Dharavi' })
  @IsString()
  @IsNotEmpty()
  location: string;

  @ApiProperty({
    description: 'Optional plea video URL',
    example: 'https://youtube.com/watch?v=123',
    required: false,
  })
  @IsString()
  @IsOptional()
  pleaVideoUrl?: string;

  @ApiProperty({
    description: 'Other media URLs showcasing talent',
    example: ['https://example.com/image.jpg'],
    required: false,
    isArray: true,
  })
  @IsString({ each: true })
  @IsOptional()
  mediaUrls?: string[];
}
