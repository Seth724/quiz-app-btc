import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsIn } from 'class-validator';

export class LoginDto {
  @ApiProperty({ description: 'Display name of the user' })
  @IsString()
  name!: string;

  @ApiPropertyOptional({ description: 'Blockchain public key (optional – auto-generated if omitted)' })
  @IsOptional()
  @IsString()
  publicKey?: string;

  @ApiPropertyOptional({ description: 'User role', enum: ['TEACHER', 'STUDENT'], default: 'STUDENT' })
  @IsOptional()
  @IsIn(['TEACHER', 'STUDENT'])
  role?: 'TEACHER' | 'STUDENT';
}
