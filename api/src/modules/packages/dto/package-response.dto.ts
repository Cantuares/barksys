import { Package } from '../entities/package.entity';

export class PackageResponseDto {
  id: string;
  name: string;
  description: string;
  price: number;
  totalSessions: number;
  validityDays: number;
  status: string;
  createdAt: Date;
  updatedAt: Date;

  static fromEntity(pkg: Package): PackageResponseDto {
    return {
      id: pkg.id,
      name: pkg.name,
      description: pkg.description,
      price: pkg.price,
      totalSessions: pkg.totalSessions,
      validityDays: pkg.validityDays,
      status: pkg.status,
      createdAt: pkg.createdAt,
      updatedAt: pkg.updatedAt,
    };
  }
}
