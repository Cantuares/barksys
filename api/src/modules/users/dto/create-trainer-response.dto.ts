import { ApiProperty } from '@nestjs/swagger';

export class CreateTrainerResponseDto {
  @ApiProperty({
    description: 'Success message',
    example: 'Trainer created successfully. Password reset email has been sent.',
  })
  message: string;

  constructor(message: string) {
    this.message = message;
  }
}
