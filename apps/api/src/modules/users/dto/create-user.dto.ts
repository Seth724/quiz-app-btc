import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsEnum, IsOptional } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ description: 'User public key' })
  @IsString()
  publicKey: string;

  @ApiPropertyOptional({ description: 'User name' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ description: 'User role', enum: ['TEACHER', 'STUDENT'] })
  @IsEnum(['TEACHER', 'STUDENT'])
  role: 'TEACHER' | 'STUDENT';
}
