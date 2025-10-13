import { ApiProperty } from '@nestjs/swagger';

export class ChangePasswordResponseDto {
  @ApiProperty({
    example: 'Password changed successfully',
    description: 'Success message',
  })
  message: string;

  constructor(message: string) {
    this.message = message;
  }
}
