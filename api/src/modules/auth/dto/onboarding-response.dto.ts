import { ApiProperty } from '@nestjs/swagger';

export class OnboardingResponseDto {
  @ApiProperty({
    example: 'Account activated and company registered successfully',
    description: 'Success message',
  })
  message: string;

  constructor(message: string) {
    this.message = message;
  }
}
