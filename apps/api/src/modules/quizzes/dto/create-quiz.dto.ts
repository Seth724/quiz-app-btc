import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsArray, IsNumber, Min, ArrayMinSize, ArrayMaxSize } from 'class-validator';

export class CreateQuizDto {
  @ApiProperty({ description: 'Quiz blockchain transaction ID' })
  @IsString()
  id!: string;

  @ApiProperty({ description: 'Quiz title' })
  @IsString()
  title!: string;

  @ApiProperty({ description: 'Question text' })
  @IsString()
  questionText!: string;

  @ApiProperty({ description: 'Array of answer options', type: [String] })
  @IsArray()
  @ArrayMinSize(2)
  @ArrayMaxSize(10)
  @IsString({ each: true })
  options!: string[];

  @ApiProperty({ description: 'Reward amount in satoshis' })
  @IsNumber()
  @Min(0)
  rewardAmount!: number;

  @ApiProperty({ description: 'Entry fee in satoshis' })
  @IsNumber()
  @Min(0)
  entryFee!: number;

  @ApiProperty({ description: 'Payment transaction ID' })
  @IsString()
  paymentTxId!: string;

  @ApiProperty({ description: 'Teacher public key' })
  @IsString()
  teacherPubKey!: string;
}
