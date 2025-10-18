import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { Header } from '../components/layout/Header';
import { BottomNavigation } from '../components/layout/BottomNavigation';
import { ProgressBar } from '../components/ui/ProgressBar';
import { useAuth } from '../lib/hooks/useAuth';
import { useRequireAuth } from '../lib/hooks/useRequireAuth';
import { usePackages, getPackageIcon, getPackageColor } from '../lib/hooks/usePackages';
import { UserRole } from '../types/auth.types';
import { formatCurrency } from '../lib/utils/date';

export default function TutorPackagesPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { isLoading: authLoading } = useRequireAuth([UserRole.TUTOR, UserRole.ADMIN]);
  const { packages, myPurchases, isLoading, error, purchasePackage, hasActivePurchase, clearError } = usePackages();
  const navigate = useNavigate();
  
  const [showPurchaseConfirm, setShowPurchaseConfirm] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<any>(null);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
        </div>
      </div>
    );
  }

  const goBack = () => {
    navigate('/tutor/dashboard');
  };

  const onPackageClick = (pkg: any) => {
    navigate(`/tutor/packages/${pkg.id}`);
  };

  const onPurchaseClick = (pkg: any, event: React.MouseEvent) => {
    event.stopPropagation();
    setSelectedPackage(pkg);
    setShowPurchaseConfirm(true);
  };

  const onConfirmPurchase = async () => {
    if (selectedPackage) {
      try {
        await purchasePackage(selectedPackage.id);
        setShowPurchaseConfirm(false);
        setSelectedPackage(null);
      } catch (error) {
        console.error('Purchase failed:', error);
      }
    }
  };

  const onCancelPurchase = () => {
    setShowPurchaseConfirm(false);
    setSelectedPackage(null);
  };

  const onScheduleSession = (pkg: any, event: React.MouseEvent) => {
    event.stopPropagation();
    navigate('/tutor/sessions');
  };

  const refresh = () => {
    clearError();
    window.location.reload();
  };

  const activePurchases = myPurchases.filter(purchase => purchase.status === 'active');

  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      {/* Header */}
      <Header 
        title={t('packages.title')}
        subtitle={t('packages.subtitle')}
        showBackButton
        onBackClick={goBack}
      />

      {/* Loading State */}
      {isLoading && packages.length === 0 ? (
        <main className="p-4 space-y-6 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-500 mx-auto"></div>
            <p className="text-gray-600 mt-4">{t('packages.loadingPackages')}</p>
          </div>
        </main>
      ) : error ? (
        /* Error State */
        <main className="p-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
            <i className="fas fa-exclamation-triangle text-red-600 text-2xl mb-2"></i>
            <p className="text-red-800 font-medium mb-2">{t('packages.errorLoadingPackages')}</p>
            <p className="text-red-600 text-sm mb-4">{error}</p>
            <button 
              className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-600 transition-colors"
              onClick={refresh}
            >
              {t('common.tryAgain')}
            </button>
          </div>
        </main>
      ) : (
        /* Main Content */
        <main className="p-4 space-y-6">
          {/* My Active Packages */}
          {activePurchases.length > 0 && (
            <div className="bg-white rounded-xl shadow p-4">
              <h2 className="font-bold text-lg text-gray-900 mb-3">{t('packages.myActivePackages')}</h2>
              <div className="space-y-3">
                {activePurchases.map((purchase) => (
                  <div key={purchase.id} className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium text-gray-900">
                          {purchase.packageName || `Package #${purchase.packageId}`}
                        </h4>
                        <div className="text-sm text-gray-600 mt-1">
                          {purchase.usedSessions}/{purchase.totalSessions || 0} {t('packages.sessionsUsed')}
                        </div>
                      </div>
                      <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                        {t('packages.active')}
                      </span>
                    </div>
                    <ProgressBar 
                      value={purchase.usedSessions} 
                      max={purchase.totalSessions || 1}
                      className="mt-2"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Available Packages */}
          {packages.length === 0 ? (
            <div className="text-center py-12">
              <div className="bg-white rounded-xl shadow p-8">
                <i className="fas fa-box-open text-gray-400 text-4xl mb-4"></i>
                <h3 className="font-bold text-lg text-gray-600 mb-2">{t('packages.noPackagesAvailable')}</h3>
                <p className="text-gray-500 text-sm mb-4">
                  {t('packages.noPackagesDescription')}
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <h2 className="font-bold text-lg text-gray-800">{t('packages.availablePackages')}</h2>
              {packages.map((pkg) => (
                <div key={pkg.id} className="bg-white rounded-xl shadow overflow-hidden">
                  <div className="p-4 border-b border-gray-100">
                    <div className="flex items-center">
                      <div className={`border-2 border-dashed rounded-xl w-16 h-16 flex items-center justify-center ${getPackageColor(pkg.name)}`}>
                        <i className={`fas ${getPackageIcon(pkg.name)} text-xl`}></i>
                      </div>
                      <div className="ml-4 flex-1">
                        <h3 className="font-bold text-lg">{pkg.name}</h3>
                        <p className="text-gray-500">{pkg.totalSessions} sessões • {pkg.validityDays} dias</p>
                        <div className="flex items-center mt-1">
                          {hasActivePurchase(pkg.id) ? (
                            <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                              {t('packages.purchased')}
                            </span>
                          ) : (
                            <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                              {t('packages.available')}
                            </span>
                          )}
                          <span className="ml-2 text-xs text-gray-500">{formatCurrency(pkg.price)}</span>
                        </div>
                      </div>
                      <div className="relative">
                        <button 
                          className="p-2 text-gray-400 hover:text-gray-600"
                          onClick={() => onPackageClick(pkg)}
                        >
                          <i className="fas fa-eye"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="bg-primary-50 rounded-lg p-3">
                        <div className="text-primary-500 text-sm">Preço</div>
                        <div className="font-bold">{formatCurrency(pkg.price)}</div>
                      </div>
                      <div className="bg-green-50 rounded-lg p-3">
                        <div className="text-green-500 text-sm">Sessões</div>
                        <div className="font-bold">{pkg.totalSessions}</div>
                      </div>
                    </div>
                    
                    {pkg.description && (
                      <div className="mb-4">
                        <h4 className="font-medium text-gray-700 mb-2">{t('packages.description')}</h4>
                        <p className="text-sm text-gray-600">{pkg.description}</p>
                      </div>
                    )}
                    
                    <div className="flex space-x-2">
                      <button 
                        className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 rounded-lg text-sm transition"
                        onClick={() => onPackageClick(pkg)}
                      >
                        {t('packages.viewDetails')}
                      </button>
                      {hasActivePurchase(pkg.id) ? (
                        <button 
                          className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg text-sm transition font-medium"
                          onClick={(e) => onScheduleSession(pkg, e)}
                        >
                          <i className="fas fa-calendar-plus mr-1"></i>{t('packages.scheduleSession')}
                        </button>
                      ) : (
                        <button 
                          className="flex-1 bg-primary-500 hover:bg-primary-600 text-white py-2 rounded-lg text-sm transition font-medium"
                          onClick={(e) => onPurchaseClick(pkg, e)}
                        >
                          <i className="fas fa-shopping-cart mr-1"></i>{t('packages.buy')}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      )}

      {/* Purchase Confirmation Modal */}
      {showPurchaseConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full">
            <div className="text-center">
              <div className="bg-primary-100 rounded-full p-3 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <i className="fas fa-shopping-cart text-primary-600 text-xl"></i>
              </div>
              <h3 className="font-bold text-lg text-gray-900 mb-2">{t('packages.confirmPurchase')}</h3>
              <p className="text-gray-600 mb-4">
                {t('packages.confirmPurchaseMessage')} <strong>{selectedPackage?.name}</strong> por <strong>{formatCurrency(selectedPackage?.price)}</strong>?
              </p>
              <p className="text-sm text-gray-500 mb-6">
                {t('packages.paymentProcessed')}
              </p>
              <div className="flex space-x-3">
                <button 
                  className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                  onClick={onCancelPurchase}
                >
                  {t('packages.cancel')}
                </button>
                <button 
                  className="flex-1 px-4 py-2 bg-primary-500 text-white rounded-lg font-medium hover:bg-primary-600 transition-colors"
                  disabled={isLoading}
                  onClick={onConfirmPurchase}
                >
                  {isLoading ? (
                    <i className="fas fa-spinner fa-spin mr-2"></i>
                  ) : null}
                  {t('packages.confirm')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <BottomNavigation 
        role="tutor"
        activeRoute="packages"
      />
    </div>
  );
}
