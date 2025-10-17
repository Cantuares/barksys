export interface Package {
  id: string;
  name: string;
  description: string;
  price: number;
  totalSessions: number;
  validityDays: number;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

export interface PackagePurchase {
  id: string;
  tutorId: string;
  packageId: string;
  packageName?: string;
  purchaseDate: string;
  usedSessions: number;
  totalSessions?: number;
  status: 'active' | 'expired' | 'used';
  createdAt: string;
  updatedAt: string;
}

export interface CreatePackagePurchaseData {
  tutorId: string;
  packageId: string;
}

export interface PackageResponse {
  docs: Package[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PackagePurchaseResponse {
  docs: PackagePurchase[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
