import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class AiQueryDto {
  @ApiProperty({
    description: 'Natural language prompt for the AI agents',
    example: 'Which children need urgent funding support right now?',
  })
  @IsString()
  @IsNotEmpty()
  prompt: string;
}
