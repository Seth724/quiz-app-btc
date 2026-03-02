import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class ConnectWalletDto {
  @ApiProperty({ description: 'Blockchain public key from the wallet' })
  @IsString()
  publicKey!: string;

  @ApiPropertyOptional({
    description: 'BIP-39 mnemonic for auto-approve (teachers only, stored base64-encoded)',
  })
  @IsOptional()
  @IsString()
  mnemonic?: string;
}
