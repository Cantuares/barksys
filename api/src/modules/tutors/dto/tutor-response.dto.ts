import { User } from '../../users/entities/user.entity';

export class TutorResponseDto {
  id: string;
  email: string;
  fullName: string;
  role: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;

  static fromEntity(user: User): TutorResponseDto {
    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
