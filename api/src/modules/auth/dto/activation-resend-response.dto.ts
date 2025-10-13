import { ApiProperty } from '@nestjs/swagger';

export class ActivationResendResponseDto {
  @ApiProperty({
    example: 'If the email exists and is not activated, a new verification email has been sent',
    description: 'Success message',
  })
  message: string;

  constructor(message: string) {
    this.message = message;
  }
}
