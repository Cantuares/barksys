import { IsEmail, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTutorDto {
  @ApiProperty({
    description: 'Tutor email address',
    example: 'tutor@example.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Tutor full name',
    example: 'John Doe',
  })
  @IsString()
  fullName: string;
}
