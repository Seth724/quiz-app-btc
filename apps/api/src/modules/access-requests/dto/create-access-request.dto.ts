import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class CreateAccessRequestDto {
  @ApiProperty({ description: 'Quiz ID (blockchain txId)' })
  @IsString()
  quizId!: string;

  @ApiPropertyOptional({ description: 'Quiz title for display' })
  @IsOptional()
  @IsString()
  quizTitle?: string;

  @ApiProperty({ description: 'Student public key' })
  @IsString()
  studentPublicKey!: string;

  @ApiProperty({ description: 'Teacher public key' })
  @IsString()
  teacherPublicKey!: string;

  @ApiPropertyOptional({ description: 'Entry fee (BigInt as string)' })
  @IsOptional()
  @IsString()
  entryFee?: string;
}
