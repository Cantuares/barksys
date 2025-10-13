import { ApiProperty } from '@nestjs/swagger';
import { User } from '../entities/user.entity';

export class UserProfileResponseDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  id: string;

  @ApiProperty({ example: 'user@example.com' })
  email: string;

  @ApiProperty({ example: 'John Doe' })
  fullName: string;

  @ApiProperty({ example: true })
  isActive: boolean;

  @ApiProperty({ example: true })
  isEmailVerified: boolean;

  constructor(user: User) {
    this.id = user.id;
    this.email = user.email;
    this.fullName = user.fullName;
    this.isActive = user.isActive;
    this.isEmailVerified = user.isEmailVerified;
  }
}
