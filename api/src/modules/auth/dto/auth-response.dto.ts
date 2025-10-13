import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../users/entities/user.entity';

class UserResponse {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  id: string;

  @ApiProperty({ example: 'user@example.com' })
  email: string;

  @ApiProperty({ example: 'John Doe' })
  fullName: string;
}

export class AuthResponseDto {
  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'JWT access token',
  })
  access_token: string;

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Refresh token (UUID)',
  })
  refresh_token: string;

  @ApiProperty({ type: UserResponse })
  user: {
    id: string;
    email: string;
    fullName: string;
  };

  constructor(access_token: string, refresh_token: string, user: User) {
    this.access_token = access_token;
    this.refresh_token = refresh_token;
    this.user = {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
    };
  }
}
