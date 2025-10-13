import { ApiProperty } from '@nestjs/swagger';

class SessionDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  id: string;

  @ApiProperty({ example: 'Mozilla/5.0...' })
  userAgent: string;

  @ApiProperty({ example: '192.168.1.1' })
  clientIp: string;

  @ApiProperty({ example: false })
  isBlocked: boolean;

  @ApiProperty({ example: '2025-10-10T00:00:00.000Z' })
  expiresAt: Date;

  @ApiProperty({ example: '2025-10-03T00:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Refresh token for identifying the current session'
  })
  refreshToken: string;
}

export class SessionResponseDto {
  @ApiProperty({ type: [SessionDto] })
  sessions: SessionDto[];

  constructor(sessions: SessionDto[]) {
    this.sessions = sessions;
  }
}
