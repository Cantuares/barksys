import { ApiProperty } from '@nestjs/swagger';

export class OnboardingResendResponseDto {
  @ApiProperty({
    example: 'If the email exists and is not activated, a new onboarding email has been sent',
    description: 'Success message',
  })
  message: string;

  constructor(message: string) {
    this.message = message;
  }
}
