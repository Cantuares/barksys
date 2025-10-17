import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useParams } from 'react-router';
import { Building, Mail, CreditCard, List, MapPin, MapPin as City, Globe, Mail as MailIcon, Check, AlertTriangle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../lib/hooks/useAuth';
import { AuthLayout } from '../components/layout/AuthLayout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { FormField } from '../components/ui/FormField';
import { ErrorMessage } from '../components/ui/ErrorMessage';

export default function OnboardingPage() {
  const { token } = useParams();
  const { onboarding, isLoading, error, clearError } = useAuth();
  const { t } = useTranslation();
  const [isSubmitted, setIsSubmitted] = React.useState(false);
  
  const onboardingSchema = React.useMemo(() => z.object({
    name: z.string().min(2, t('onboarding.companyNameMinLength')).max(255),
    email: z.string().email(t('onboarding.emailInvalid')),
    taxId: z.string().min(5, t('onboarding.taxIdMinLength')).max(50),
    taxType: z.enum(['nif', 'nipc', 'vat'], { 
      errorMap: () => ({ message: t('onboarding.taxTypeInvalid') }) 
    }),
    billingAddress: z.string().min(5, t('onboarding.billingAddressMinLength')),
    city: z.string().min(2, t('onboarding.cityMinLength')).max(100),
    country: z.string().regex(/^[A-Z]{2}$/, t('onboarding.countryInvalid')).optional(),
    postalCode: z.string().max(20).optional(),
  }), [t]);
  
  type OnboardingFormData = z.infer<typeof onboardingSchema>;
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    trigger,
    clearErrors,
  } = useForm<OnboardingFormData>({
    resolver: zodResolver(onboardingSchema),
    mode: 'onBlur', // Only validate on blur, not on change
    reValidateMode: 'onBlur', // Only revalidate on blur
    defaultValues: {
      country: 'PT',
    },
  });

  // Clear any existing errors when component mounts
  React.useEffect(() => {
    clearErrors();
  }, [clearErrors]);

  const onSubmit = async (data: OnboardingFormData) => {
    if (!token) return;
    
    try {
      await onboarding(token, {
        name: data.name,
        email: data.email,
        taxId: data.taxId,
        taxType: data.taxType,
        billingAddress: data.billingAddress,
        city: data.city,
        country: data.country,
        postalCode: data.postalCode,
      });
      setIsSubmitted(true);
    } catch (err) {
      // Error is handled by the auth store
    }
  };

  if (isSubmitted) {
    return (
      <AuthLayout title={t('nav.dashboard')} subtitle={t('onboarding.successTitle')}>
        <Card>
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
              <Check className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">{t('onboarding.successTitle')}</h2>
            <p className="text-gray-600 mb-6">
              {t('onboarding.successMessage')}
            </p>
            <Link to="/login">
              <Button variant="primary" fullWidth>
                {t('onboarding.successButton')}
              </Button>
            </Link>
          </div>
        </Card>
      </AuthLayout>
    );
  }

  if (!token) {
    return (
      <AuthLayout title={t('nav.dashboard')} subtitle={t('onboarding.errorTitle')}>
        <Card>
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">{t('onboarding.errorTitle')}</h2>
            <p className="text-gray-600 mb-6">
              {t('onboarding.errorMessage')}
            </p>
            <Link to="/register">
              <Button variant="primary" fullWidth>
                {t('onboarding.errorButton')}
              </Button>
            </Link>
          </div>
        </Card>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title={t('nav.dashboard')} subtitle={t('onboarding.subtitle')}>
      <Card>
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">{t('onboarding.formTitle')}</h2>
          <p className="text-gray-500 mt-2">{t('onboarding.formDescription')}</p>
        </div>

        {error && <ErrorMessage message={error} />}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <FormField label={t('onboarding.companyName')} htmlFor="name" error={errors.name?.message} required>
            <Input
              type="text"
              id="name"
              placeholder={t('onboarding.companyNamePlaceholder')}
              icon={<Building className="h-4 w-4" />}
              {...register('name')}
            />
          </FormField>

          <FormField label={t('onboarding.companyEmail')} htmlFor="email" error={errors.email?.message} required>
            <Input
              type="email"
              id="email"
              placeholder={t('onboarding.companyEmailPlaceholder')}
              icon={<Mail className="h-4 w-4" />}
              {...register('email')}
            />
          </FormField>

          <FormField label={t('onboarding.taxId')} htmlFor="taxId" error={errors.taxId?.message} required>
            <Input
              type="text"
              id="taxId"
              placeholder={t('onboarding.taxIdPlaceholder')}
              icon={<CreditCard className="h-4 w-4" />}
              {...register('taxId')}
            />
          </FormField>

          <FormField label={t('onboarding.taxType')} htmlFor="taxType" error={errors.taxType?.message} required>
            <Select
              id="taxType"
              icon={<List className="h-4 w-4" />}
              {...register('taxType')}
            >
              <option value="">{t('onboarding.taxTypePlaceholder')}</option>
              <option value="nif">{t('onboarding.taxTypeNif')}</option>
              <option value="nipc">{t('onboarding.taxTypeNipc')}</option>
              <option value="vat">{t('onboarding.taxTypeVat')}</option>
            </Select>
          </FormField>

          <FormField label={t('onboarding.billingAddress')} htmlFor="billingAddress" error={errors.billingAddress?.message} required>
            <Input
              type="text"
              id="billingAddress"
              placeholder={t('onboarding.billingAddressPlaceholder')}
              icon={<MapPin className="h-4 w-4" />}
              {...register('billingAddress')}
            />
          </FormField>

          <FormField label={t('onboarding.city')} htmlFor="city" error={errors.city?.message} required>
            <Input
              type="text"
              id="city"
              placeholder={t('onboarding.cityPlaceholder')}
              icon={<City className="h-4 w-4" />}
              {...register('city')}
            />
          </FormField>

          <FormField label={t('onboarding.country')} htmlFor="country" error={errors.country?.message}>
            <Select
              id="country"
              icon={<Globe className="h-4 w-4" />}
              {...register('country')}
            >
              <option value="PT">{t('onboarding.countryPT')}</option>
              <option value="ES">{t('onboarding.countryES')}</option>
              <option value="FR">{t('onboarding.countryFR')}</option>
              <option value="DE">{t('onboarding.countryDE')}</option>
              <option value="IT">{t('onboarding.countryIT')}</option>
              <option value="NL">{t('onboarding.countryNL')}</option>
              <option value="BE">{t('onboarding.countryBE')}</option>
              <option value="AT">{t('onboarding.countryAT')}</option>
              <option value="PL">{t('onboarding.countryPL')}</option>
              <option value="CZ">{t('onboarding.countryCZ')}</option>
              <option value="GR">{t('onboarding.countryGR')}</option>
              <option value="SE">{t('onboarding.countrySE')}</option>
              <option value="DK">{t('onboarding.countryDK')}</option>
              <option value="FI">{t('onboarding.countryFI')}</option>
              <option value="NO">{t('onboarding.countryNO')}</option>
              <option value="IE">{t('onboarding.countryIE')}</option>
              <option value="UK">{t('onboarding.countryUK')}</option>
              <option value="CH">{t('onboarding.countryCH')}</option>
              <option value="RO">{t('onboarding.countryRO')}</option>
              <option value="BG">{t('onboarding.countryBG')}</option>
              <option value="HU">{t('onboarding.countryHU')}</option>
              <option value="SK">{t('onboarding.countrySK')}</option>
              <option value="HR">{t('onboarding.countryHR')}</option>
              <option value="SI">{t('onboarding.countrySI')}</option>
              <option value="LT">{t('onboarding.countryLT')}</option>
              <option value="LV">{t('onboarding.countryLV')}</option>
              <option value="EE">{t('onboarding.countryEE')}</option>
              <option value="LU">{t('onboarding.countryLU')}</option>
            </Select>
          </FormField>

          <FormField label={t('onboarding.postalCode')} htmlFor="postalCode" error={errors.postalCode?.message}>
            <Input
              type="text"
              id="postalCode"
              placeholder={t('onboarding.postalCodePlaceholder')}
              icon={<MailIcon className="h-4 w-4" />}
              {...register('postalCode')}
            />
          </FormField>

          <div>
            <Button
              type="submit"
              variant="primary"
              fullWidth
              loading={isLoading}
              disabled={isLoading}
            >
              {t('onboarding.submitButton')}
            </Button>
          </div>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            {t('onboarding.alreadyHaveAccount')}
            <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500 ml-1">
              {t('onboarding.goToLogin')}
            </Link>
          </p>
        </div>
      </Card>
    </AuthLayout>
  );
}