import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsIn } from 'class-validator';

export class UpdateAccessRequestDto {
  @ApiPropertyOptional({ description: 'New status', enum: ['pending', 'approved', 'completed', 'rejected'] })
  @IsOptional()
  @IsIn(['pending', 'approved', 'completed', 'rejected'])
  status?: string;

  @ApiPropertyOptional({ description: 'Serialized offer tx from teacher' })
  @IsOptional()
  @IsString()
  offerTxHex?: string;

  @ApiPropertyOptional({ description: 'Access token ID' })
  @IsOptional()
  @IsString()
  accessTokenId?: string;

  @ApiPropertyOptional({ description: 'Completed transaction ID' })
  @IsOptional()
  @IsString()
  completedTxId?: string;
}
