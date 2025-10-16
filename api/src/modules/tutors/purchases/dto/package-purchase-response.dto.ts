import { PackagePurchase } from '../entities/package-purchase.entity';

export class PackagePurchaseResponseDto {
  id: string;
  tutorId: string;
  packageId: string;
  packageName?: string;
  purchaseDate: Date;
  usedSessions: number;
  totalSessions?: number;
  status: string;
  createdAt: Date;
  updatedAt: Date;

  static fromEntity(purchase: PackagePurchase): PackagePurchaseResponseDto {
    return {
      id: purchase.id,
      tutorId: typeof purchase.tutor === 'object' ? purchase.tutor.id : purchase.tutor,
      packageId: typeof purchase.package === 'object' ? purchase.package.id : purchase.package,
      packageName: typeof purchase.package === 'object' ? purchase.package.name : undefined,
      purchaseDate: purchase.purchaseDate,
      usedSessions: purchase.usedSessions,
      totalSessions: typeof purchase.package === 'object' ? purchase.package.totalSessions : undefined,
      status: purchase.status,
      createdAt: purchase.createdAt,
      updatedAt: purchase.updatedAt,
    };
  }
}
