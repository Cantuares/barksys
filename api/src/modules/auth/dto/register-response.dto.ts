import { ApiProperty } from '@nestjs/swagger';

export class RegisterResponseDto {
  @ApiProperty({
    example: 'User registered successfully. Please verify your email.',
    description: 'Success message',
  })
  message: string;

  constructor(message: string) {
    this.message = message;
  }
}
