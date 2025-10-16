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
      <AuthLayout title={t('nav.dashboard')} subtitle="Cadastro Completo">
        <Card>
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
              <Check className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Cadastro completo!</h2>
            <p className="text-gray-600 mb-6">
              Sua empresa foi cadastrada com sucesso. Agora você pode fazer login e começar a usar o sistema.
            </p>
            <Link to="/login">
              <Button variant="primary" fullWidth>
                Fazer Login
              </Button>
            </Link>
          </div>
        </Card>
      </AuthLayout>
    );
  }

  if (!token) {
    return (
      <AuthLayout title={t('nav.dashboard')} subtitle="Token Inválido">
        <Card>
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Token inválido</h2>
            <p className="text-gray-600 mb-6">
              O link de cadastro é inválido ou expirou. Entre em contato com o suporte.
            </p>
            <Link to="/register">
              <Button variant="primary" fullWidth>
                Criar Nova Conta
              </Button>
            </Link>
          </div>
        </Card>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title={t('nav.dashboard')} subtitle="Complete seu cadastro">
      <Card>
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Complete seu cadastro</h2>
          <p className="text-gray-500 mt-2">Preencha os dados da sua empresa</p>
        </div>

        {error && <ErrorMessage message={error} />}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <FormField label="Nome da empresa" htmlFor="name" error={errors.name?.message}>
            <Input
              type="text"
              id="name"
              placeholder="Nome da sua empresa"
              icon={<Building className="h-4 w-4" />}
              {...register('name')}
            />
          </FormField>

          <FormField label="E-mail da empresa" htmlFor="email" error={errors.email?.message}>
            <Input
              type="email"
              id="email"
              placeholder="empresa@email.com"
              icon={<Mail className="h-4 w-4" />}
              {...register('email')}
            />
          </FormField>

          <FormField label="Identificação fiscal" htmlFor="taxId" error={errors.taxId?.message}>
            <Input
              type="text"
              id="taxId"
              placeholder="Ex: 123456789"
              icon={<CreditCard className="h-4 w-4" />}
              {...register('taxId')}
            />
          </FormField>

          <FormField label="Tipo de identificação" htmlFor="taxType" error={errors.taxType?.message}>
            <Select
              id="taxType"
              icon={<List className="h-4 w-4" />}
              {...register('taxType')}
            >
              <option value="">Selecione o tipo</option>
              <option value="nif">NIF</option>
              <option value="nipc">NIPC</option>
              <option value="vat">VAT</option>
            </Select>
          </FormField>

          <FormField label="Morada de faturação" htmlFor="billingAddress" error={errors.billingAddress?.message}>
            <Input
              type="text"
              id="billingAddress"
              placeholder="Rua Example, 123"
              icon={<MapPin className="h-4 w-4" />}
              {...register('billingAddress')}
            />
          </FormField>

          <FormField label="Cidade" htmlFor="city" error={errors.city?.message}>
            <Input
              type="text"
              id="city"
              placeholder="Lisboa"
              icon={<City className="h-4 w-4" />}
              {...register('city')}
            />
          </FormField>

          <FormField label="País" htmlFor="country" error={errors.country?.message}>
            <Input
              type="text"
              id="country"
              placeholder="PT"
              icon={<Globe className="h-4 w-4" />}
              {...register('country')}
            />
          </FormField>

          <FormField label="Código postal" htmlFor="postalCode" error={errors.postalCode?.message}>
            <Input
              type="text"
              id="postalCode"
              placeholder="1000-001"
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
              Completar Cadastro
            </Button>
          </div>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Já tem uma conta? 
            <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500 ml-1">
              Faça login
            </Link>
          </p>
        </div>
      </Card>
    </AuthLayout>
  );
}