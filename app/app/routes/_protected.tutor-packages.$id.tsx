import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { useTranslation } from 'react-i18next';
import { Header } from '../components/layout/Header';
import { BottomNavigation } from '../components/layout/BottomNavigation';
import { useAuth } from '../lib/hooks/useAuth';
import { useRequireAuth } from '../lib/hooks/useRequireAuth';
import { usePackage, usePackages, getPackageIcon } from '../lib/hooks/usePackages';
import { UserRole } from '../types/auth.types';
import { formatCurrency } from '../lib/utils/date';

export default function TutorPackageDetailPage() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const packageId = id || '';
  const { user } = useAuth();
  const { isLoading: authLoading } = useRequireAuth([UserRole.TUTOR, UserRole.ADMIN]);
  const { package: packageData, isLoading, error } = usePackage(packageId);
  const { hasActivePurchase, purchasePackage } = usePackages();
  const navigate = useNavigate();
  
  const [showPurchaseConfirm, setShowPurchaseConfirm] = useState(false);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  const goBack = () => {
    navigate('/tutor/packages');
  };

  const onPurchase = () => {
    setShowPurchaseConfirm(true);
  };

  const onConfirmPurchase = async () => {
    if (packageData) {
      try {
        await purchasePackage(packageData.id);
        setShowPurchaseConfirm(false);
        navigate('/tutor/packages', {
          state: { purchased: packageData.id }
        });
      } catch (error) {
        console.error('Purchase failed:', error);
        setShowPurchaseConfirm(false);
      }
    }
  };

  const onCancelPurchase = () => {
    setShowPurchaseConfirm(false);
  };

  const calculatePricePerSession = (): number => {
    if (!packageData || packageData.totalSessions === 0) return 0;
    return packageData.price / packageData.totalSessions;
  };

  const isPurchased = packageData ? hasActivePurchase(packageData.id) : false;

  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      {/* Header */}
      <Header 
        title={packageData?.name || t('packages.packageDetails')}
        subtitle={t('packages.packageInformation')}
        showBackButton
        onBackClick={goBack}
      />

      {/* Loading State */}
      {isLoading && !packageData ? (
        <main className="p-4 space-y-6 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto"></div>
            <p className="text-gray-600 mt-4">{t('packages.loadingDetails')}</p>
          </div>
        </main>
      ) : error ? (
        /* Error State */
        <main className="p-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
            <i className="fas fa-exclamation-triangle text-red-600 text-2xl mb-2"></i>
            <p className="text-red-800 font-medium mb-2">{t('packages.errorLoadingDetails')}</p>
            <p className="text-red-600 text-sm mb-4">{error}</p>
            <button 
              className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-600 transition-colors"
              onClick={goBack}
            >
              {t('common.back')}
            </button>
          </div>
        </main>
      ) : packageData ? (
        /* Main Content */
        <main className="p-4 space-y-6">
          {/* Package Header Card */}
          <div className="bg-white rounded-xl shadow overflow-hidden">
            <div className="p-6">
              <div className="flex items-center mb-6">
                <div className="bg-gray-200 border-2 border-dashed rounded-xl w-20 h-20 flex items-center justify-center mr-4">
                  <i className={`fas ${getPackageIcon(packageData.name)} text-gray-400 text-2xl`}></i>
                </div>
                <div className="flex-1">
                  <h1 className="font-bold text-2xl text-gray-900 mb-2">{packageData.name}</h1>
                  <p className="text-gray-600 mb-3">{packageData.totalSessions} sessões • {packageData.validityDays} dias de validade</p>
                  <div className="flex items-center space-x-3">
                    <span className="inline-block bg-primary-100 text-primary-800 text-sm px-3 py-1 rounded-full font-medium">
                      {formatCurrency(packageData.price)}
                    </span>
                    <span className="text-sm text-gray-500">
                      {formatCurrency(calculatePricePerSession())} por sessão
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Purchase Status / Button */}
              {isPurchased ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <i className="fas fa-check-circle text-green-600 text-xl mr-3"></i>
                    <div>
                      <div className="font-medium text-green-800">{t('packages.youAlreadyHave')}</div>
                      <div className="text-sm text-green-600">{t('packages.checkActivePackages')}</div>
                    </div>
                  </div>
                </div>
              ) : (
                <button 
                  className="w-full bg-primary-500 hover:bg-primary-600 text-white py-3 rounded-lg font-medium transition-colors"
                  disabled={isLoading}
                  onClick={onPurchase}
                >
                  {isLoading ? (
                    <i className="fas fa-spinner fa-spin mr-2"></i>
                  ) : (
                    <i className="fas fa-shopping-cart mr-2"></i>
                  )}
                  {t('packages.buyPackage')}
                </button>
              )}
            </div>
          </div>

          {/* Package Details */}
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="font-bold text-lg text-gray-900 mb-4">{t('packages.packageDetailsTitle')}</h2>
            
            <div className="space-y-4">
              {/* Description */}
              <div>
                <h3 className="font-medium text-gray-900 mb-2">{t('packages.description')}</h3>
                <p className="text-gray-700 leading-relaxed">{packageData.description}</p>
              </div>

              {/* Package Info Grid */}
              <div className="grid grid-cols-2 gap-4 mt-6">
                <div className="bg-primary-50 rounded-lg p-4">
                  <div className="text-primary-600 text-sm font-medium mb-1">{t('packages.totalSessions')}</div>
                  <div className="font-bold text-gray-900 text-xl">{packageData.totalSessions}</div>
                </div>
                
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="text-blue-600 text-sm font-medium mb-1">{t('packages.validity')}</div>
                  <div className="font-bold text-gray-900 text-xl">{packageData.validityDays} {t('packages.days')}</div>
                </div>
                
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="text-green-600 text-sm font-medium mb-1">{t('packages.totalPrice')}</div>
                  <div className="font-bold text-gray-900 text-xl">{formatCurrency(packageData.price)}</div>
                </div>
                
                <div className="bg-purple-50 rounded-lg p-4">
                  <div className="text-purple-600 text-sm font-medium mb-1">{t('packages.pricePerSession')}</div>
                  <div className="font-bold text-gray-900 text-xl">{formatCurrency(calculatePricePerSession())}</div>
                </div>
              </div>
            </div>
          </div>

          {/* What's Included */}
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="font-bold text-lg text-gray-900 mb-4">{t('packages.whatsIncluded')}</h2>
            
            <div className="space-y-3">
              <div className="flex items-center">
                <i className="fas fa-check text-green-600 mr-3"></i>
                <span>{packageData.totalSessions} {t('packages.professionalTraining')}</span>
              </div>
              <div className="flex items-center">
                <i className="fas fa-check text-green-600 mr-3"></i>
                <span>{t('packages.personalizedProgress')}</span>
              </div>
              <div className="flex items-center">
                <i className="fas fa-check text-green-600 mr-3"></i>
                <span>{t('packages.supportFor')} {packageData.validityDays} {t('packages.days')}</span>
              </div>
              <div className="flex items-center">
                <i className="fas fa-check text-green-600 mr-3"></i>
                <span>{t('packages.progressReports')}</span>
              </div>
              {packageData.name.toLowerCase().includes('grupal') && (
                <div className="flex items-center">
                  <i className="fas fa-check text-green-600 mr-3"></i>
                  <span>{t('packages.socialization')}</span>
                </div>
              )}
              {packageData.name.toLowerCase().includes('personalizado') && (
                <div className="flex items-center">
                  <i className="fas fa-check text-green-600 mr-3"></i>
                  <span>{t('packages.individualService')}</span>
                </div>
              )}
            </div>
          </div>

          {/* Terms */}
          <div className="bg-gray-100 rounded-xl p-4">
            <h3 className="font-medium text-gray-900 mb-2">{t('packages.importantTerms')}</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• {t('packages.sessionsWithinPeriod')} {packageData.validityDays} {t('packages.days')}</li>
              <li>• {t('packages.schedulingSubject')}</li>
              <li>• {t('packages.cancellationPolicy')}</li>
              <li>• {t('packages.immediatePayment')}</li>
            </ul>
          </div>
        </main>
      ) : null}

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
                {t('packages.confirmPurchaseMessage')} <strong>{packageData?.name}</strong> por <strong>{formatCurrency(packageData?.price)}</strong>?
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
