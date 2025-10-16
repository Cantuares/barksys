import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'react-router';
import { User, Mail, Lock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../lib/hooks/useAuth';
import { AuthLayout } from '../components/layout/AuthLayout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { FormField } from '../components/ui/FormField';
import { ErrorMessage } from '../components/ui/ErrorMessage';

export default function RegisterPage() {
  const { register: registerUser, isLoading, error, clearError } = useAuth();
  const { t } = useTranslation();
  
  const registerSchema = React.useMemo(() => z.object({
    fullName: z.string().min(1, t('register.fullNameRequired')),
    email: z.string().email(t('register.emailInvalid')).min(1, t('register.emailRequired')),
    password: z.string()
      .min(8, t('register.passwordMinLength'))
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 
        t('register.passwordComplexity')),
    confirmPassword: z.string().min(1, t('register.confirmPasswordRequired')),
  }).refine((data) => data.password === data.confirmPassword, {
    message: t('register.passwordsDoNotMatch'),
    path: ["confirmPassword"],
  }), [t]);
  
  type RegisterFormData = z.infer<typeof registerSchema>;
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    trigger,
    clearErrors,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: 'onBlur', // Only validate on blur, not on change
    reValidateMode: 'onBlur', // Only revalidate on blur
  });

  // Clear any existing errors when component mounts
  React.useEffect(() => {
    clearErrors();
  }, [clearErrors]);

  const onSubmit = async (data: RegisterFormData) => {
    try {
      await registerUser({
        fullName: data.fullName,
        email: data.email,
        password: data.password,
      });
    } catch (err) {
      // Error is handled by the auth store
    }
  };

  return (
    <AuthLayout title={t('nav.dashboard')} subtitle={t('register.subtitle')}>
      <Card>
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">{t('register.title')}</h2>
          <p className="text-gray-500 mt-2">{t('register.subtitle')}</p>
        </div>

        {error && <ErrorMessage message={error} />}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <FormField label={t('register.fullName')} htmlFor="fullName" error={errors.fullName?.message}>
            <Input
              type="text"
              id="fullName"
              placeholder={t('register.fullNamePlaceholder')}
              icon={<User className="h-4 w-4" />}
              {...register('fullName')}
            />
          </FormField>

          <FormField label={t('register.email')} htmlFor="email" error={errors.email?.message}>
            <Input
              type="email"
              id="email"
              placeholder={t('register.emailPlaceholder')}
              icon={<Mail className="h-4 w-4" />}
              {...register('email')}
            />
          </FormField>

          <FormField label={t('register.password')} htmlFor="password" error={errors.password?.message}>
            <Input
              type="password"
              id="password"
              placeholder={t('register.passwordPlaceholder')}
              icon={<Lock className="h-4 w-4" />}
              {...register('password')}
            />
          </FormField>

          <FormField label={t('register.confirmPassword')} htmlFor="confirmPassword" error={errors.confirmPassword?.message}>
            <Input
              type="password"
              id="confirmPassword"
              placeholder={t('register.confirmPasswordPlaceholder')}
              icon={<Lock className="h-4 w-4" />}
              {...register('confirmPassword')}
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
              {t('register.createAccount')}
            </Button>
          </div>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            {t('register.alreadyHaveAccount')} 
            <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500 ml-1">
              {t('register.loginToAccount')}
            </Link>
          </p>
        </div>
      </Card>
    </AuthLayout>
  );
}