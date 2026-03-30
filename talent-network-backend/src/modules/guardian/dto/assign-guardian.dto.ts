import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class AssignGuardianDto {
  @ApiProperty({ example: 'child-uuid' })
  @IsString()
  @IsNotEmpty()
  childId: string;

  @ApiProperty({ example: 'guardian-user-uuid' })
  @IsString()
  @IsNotEmpty()
  guardianUserId: string;
}
