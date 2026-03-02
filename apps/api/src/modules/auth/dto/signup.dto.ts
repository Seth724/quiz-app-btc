import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength, Matches, IsOptional, IsIn } from 'class-validator';

export class SignupDto {
  @ApiProperty({ description: 'Display name', example: 'John Doe' })
  @IsString()
  name!: string;

  @ApiProperty({ description: 'Email address', example: 'john@example.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({
    description: 'Password (min 6 chars, must contain letters and numbers)',
    example: 'Pass123',
  })
  @IsString()
  @MinLength(6)
  @Matches(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*?&]{6,}$/, {
    message: 'Password must be at least 6 characters long and contain both letters and numbers',
  })
  password!: string;

  @ApiProperty({ description: 'User role', enum: ['TEACHER', 'STUDENT'], default: 'STUDENT' })
  @IsOptional()
  @IsIn(['TEACHER', 'STUDENT'])
  role?: 'TEACHER' | 'STUDENT';
}
