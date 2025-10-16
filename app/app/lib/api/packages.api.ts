import { apiClient } from './client';
import type { 
  Package, 
  PackagePurchase, 
  CreatePackagePurchaseData, 
  PackageResponse, 
  PackagePurchaseResponse 
} from '../../types/package.types';

export const packagesApi = {
  /**
   * Get available packages
   */
  getPackages: async (page: number = 1, limit: number = 20): Promise<PackageResponse> => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      sort: '-createdAt',
      'where[status][equals]': 'active',
    });

    const response = await apiClient.get(`/packages?${params}`);
    // API returns array directly, wrap it in expected format
    return {
      docs: Array.isArray(response) ? response : [],
      total: Array.isArray(response) ? response.length : 0,
      page: page,
      limit: limit,
      totalPages: Math.ceil((Array.isArray(response) ? response.length : 0) / limit)
    };
  },

  /**
   * Get a specific package by ID
   */
  getPackageById: async (packageId: string): Promise<Package> => {
    const response = await apiClient.get(`/packages/${packageId}`);
    return response;
  },

  /**
   * Get my package purchases
   */
  getMyPurchases: async (): Promise<PackagePurchase[]> => {
    const params = new URLSearchParams({
      'where[tutor.user][equals]': 'current-user', // This will be replaced with actual user ID
      sort: '-createdAt',
    });

    const response = await apiClient.get(`/package-purchases?${params}`);
    // API returns array directly
    return Array.isArray(response) ? response : [];
  },

  /**
   * Purchase a package
   */
  purchasePackage: async (data: CreatePackagePurchaseData): Promise<PackagePurchase> => {
    const response = await apiClient.post('/package-purchases', data);
    return response;
  },
};
