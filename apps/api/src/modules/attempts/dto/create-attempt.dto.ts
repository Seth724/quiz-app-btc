import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNumber, IsBoolean, IsOptional } from 'class-validator';

export class CreateAttemptDto {
  @ApiProperty({ description: 'Quiz ID' })
  @IsString()
  quizId!: string;

  @ApiProperty({ description: 'Student public key' })
  @IsString()
  studentPubKey!: string;

  @ApiProperty({ description: 'Selected answer index' })
  @IsNumber()
  selectedAnswer!: number;

  @ApiProperty({ description: 'Is answer correct' })
  @IsBoolean()
  isCorrect!: boolean;

  @ApiProperty({ description: 'Reward earned in satoshis' })
  @IsNumber()
  rewardEarned!: number;

  @ApiPropertyOptional({ description: 'Blockchain transaction ID' })
  @IsOptional()
  @IsString()
  blockchainTxId?: string;
}
