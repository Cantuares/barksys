import { apiClient } from './client';
import type {
  Package,
  PackagePurchase,
  CreatePackagePurchaseData,
} from '../../types/package.types';

export const packagesApi = {
  /**
   * Get all available packages for the company
   */
  async getPackages(limit: number = 50, offset: number = 0): Promise<Package[]> {
    const params = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString(),
    });

    return apiClient.get<Package[]>(`/packages?${params}`);
  },

  /**
   * Get a specific package by ID
   */
  async getPackageById(packageId: string): Promise<Package> {
    return apiClient.get<Package>(`/packages/${packageId}`);
  },

  /**
   * Get package purchases for a specific tutor
   */
  async getTutorPurchases(tutorId: string): Promise<PackagePurchase[]> {
    return apiClient.get<PackagePurchase[]>(`/tutors/${tutorId}/purchases`);
  },

  /**
   * Purchase a package for a tutor
   */
  async purchasePackage(tutorId: string, packageId: string): Promise<PackagePurchase> {
    return apiClient.post<PackagePurchase>(
      `/tutors/${tutorId}/purchases`,
      { tutorId, packageId }
    );
  },
};
