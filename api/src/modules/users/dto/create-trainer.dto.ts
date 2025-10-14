import { IsEmail, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTrainerDto {
  @ApiProperty({
    description: 'Trainer email address',
    example: 'trainer@example.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Trainer full name',
    example: 'Jane Smith',
  })
  @IsString()
  fullName: string;
}
