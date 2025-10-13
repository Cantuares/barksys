import { ApiProperty } from '@nestjs/swagger';

export class PasswordForgotResponseDto {
  @ApiProperty({
    example: 'If the email exists, a password reset link has been sent',
    description: 'Success message',
  })
  message: string;

  constructor(message: string) {
    this.message = message;
  }
}
