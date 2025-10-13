import { ApiProperty } from '@nestjs/swagger';

export class ActivateResponseDto {
  @ApiProperty({
    example: 'Account activated successfully',
    description: 'Success message',
  })
  message: string;

  constructor(message: string) {
    this.message = message;
  }
}
