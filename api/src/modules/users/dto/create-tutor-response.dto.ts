import { ApiProperty } from '@nestjs/swagger';

export class CreateTutorResponseDto {
  @ApiProperty({
    description: 'Success message',
    example: 'Tutor created successfully. Password reset email has been sent.',
  })
  message: string;

  constructor(message: string) {
    this.message = message;
  }
}
