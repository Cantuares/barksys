import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { packagesApi } from '../api/packages.api';
import { useAuth } from './useAuth';
import type { Package, PackagePurchase, CreatePackagePurchaseData } from '../../types/package.types';

export const usePackages = () => {
  const [packages, setPackages] = useState<Package[]>([]);
  const [myPurchases, setMyPurchases] = useState<PackagePurchase[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isInitialized, isAuthenticated, user } = useAuth();
  const { t } = useTranslation();

  const loadPackages = useCallback(async () => {
    // Only load packages if auth is initialized and user is authenticated
    if (!isInitialized || !isAuthenticated) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const packagesData = await packagesApi.getPackages(50, 0);
      setPackages(packagesData);
    } catch (err) {
      console.error('Failed to load packages:', err);
      setError(t('packages.failedToLoadPackages'));
    } finally {
      setIsLoading(false);
    }
  }, [isInitialized, isAuthenticated, t]);

  const loadMyPurchases = useCallback(async () => {
    // Only load purchases if auth is initialized, user is authenticated, and user exists
    if (!isInitialized || !isAuthenticated || !user?.id) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const purchases = await packagesApi.getTutorPurchases(user.id);
      setMyPurchases(purchases);
    } catch (err) {
      console.error('Failed to load purchases:', err);
      setError(t('packages.failedToLoadPurchases'));
    } finally {
      setIsLoading(false);
    }
  }, [isInitialized, isAuthenticated, user?.id, t]);

  const purchasePackage = useCallback(async (packageId: string): Promise<PackagePurchase> => {
    if (!user?.id) {
      const error = new Error('User not authenticated');
      setError(t('packages.failedToPurchasePackage'));
      throw error;
    }

    setIsLoading(true);
    setError(null);

    try {
      const purchase = await packagesApi.purchasePackage(user.id, packageId);
      setMyPurchases(prev => [purchase, ...prev]);
      return purchase;
    } catch (err) {
      console.error('Failed to purchase package:', err);
      setError(t('packages.failedToPurchasePackage'));
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, t]);

  const hasActivePurchase = useCallback((packageId: string): boolean => {
    return myPurchases.some(purchase => {
      return purchase.packageId === packageId && 
             purchase.status === 'active' && 
             (purchase.totalSessions ? purchase.usedSessions < purchase.totalSessions : true);
    });
  }, [myPurchases]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  useEffect(() => {
    loadPackages();
    loadMyPurchases();
  }, [loadPackages, loadMyPurchases]);

  // Clear error when language changes to update error messages
  useEffect(() => {
    if (error) {
      setError(null);
    }
  }, [t]);

  return {
    packages,
    myPurchases,
    isLoading,
    error,
    loadPackages,
    loadMyPurchases,
    purchasePackage,
    hasActivePurchase,
    clearError,
  };
};

export const usePackage = (packageId: string) => {
  const [packageData, setPackageData] = useState<Package | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isInitialized, isAuthenticated } = useAuth();
  const { t } = useTranslation();

  const loadPackage = useCallback(async () => {
    if (!packageId || !isInitialized || !isAuthenticated) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const pkg = await packagesApi.getPackageById(packageId);
      setPackageData(pkg);
    } catch (err) {
      console.error('Failed to load package:', err);
      setError(t('packages.failedToLoadPackageDetails'));
    } finally {
      setIsLoading(false);
    }
  }, [packageId, isInitialized, isAuthenticated, t]);

  useEffect(() => {
    loadPackage();
  }, [loadPackage]);

  return {
    package: packageData,
    isLoading,
    error,
    loadPackage,
  };
};

// Helper functions for package icons and colors
export const getPackageIcon = (packageName: string): string => {
  const name = packageName.toLowerCase();
  if (name.includes('hotel')) return 'fa-bed';
  if (name.includes('escola')) return 'fa-graduation-cap';
  if (name.includes('creche')) return 'fa-baby';
  if (name.includes('grupal')) return 'fa-users';
  if (name.includes('personalizado')) return 'fa-user';
  return 'fa-box';
};

export const getPackageColor = (packageName: string): string => {
  const name = packageName.toLowerCase();
  if (name.includes('hotel')) return 'bg-purple-100 text-purple-600';
  if (name.includes('escola')) return 'bg-green-100 text-green-600';
  if (name.includes('creche')) return 'bg-green-100 text-green-600';
  if (name.includes('grupal')) return 'bg-orange-100 text-orange-600';
  if (name.includes('personalizado')) return 'bg-red-100 text-red-600';
  return 'bg-gray-100 text-gray-600';
};
