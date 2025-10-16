import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'react-router';
import { Mail, Lock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../lib/hooks/useAuth';
import { useRequireGuest } from '../lib/hooks/useRequireGuest';
import { AuthLayout } from '../components/layout/AuthLayout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { FormField } from '../components/ui/FormField';
import { ErrorMessage } from '../components/ui/ErrorMessage';

export default function LoginPage() {
  const { login, isLoading, error, clearError } = useAuth();
  const { t } = useTranslation();
  
  // Redirect authenticated users to their dashboard
  useRequireGuest();
  
  const loginSchema = React.useMemo(() => z.object({
    email: z.string().email(t('login.emailInvalid')).min(1, t('login.emailRequired')),
    password: z.string().min(1, t('login.passwordRequired')),
    remember: z.boolean().optional(),
  }), [t]);
  
  type LoginFormData = z.infer<typeof loginSchema>;
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    trigger,
    clearErrors,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: 'onBlur', // Only validate on blur, not on change
    reValidateMode: 'onBlur', // Only revalidate on blur
    defaultValues: {
      remember: false,
    },
  });

  // Clear any existing errors when component mounts
  React.useEffect(() => {
    clearErrors();
  }, [clearErrors]);

  const onSubmit = async (data: LoginFormData) => {
    try {
      await login({
        email: data.email,
        password: data.password,
      });
    } catch (err) {
      // Error is handled by the auth store
    }
  };

  return (
    <AuthLayout title={t('nav.dashboard')} subtitle={t('login.subtitle')}>
      <Card>
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">{t('login.title')}</h2>
          <p className="text-gray-500 mt-2">{t('login.subtitle')}</p>
        </div>

        {error && <ErrorMessage message={error} />}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <FormField label={t('login.email')} htmlFor="email" error={errors.email?.message}>
            <Input
              type="email"
              id="email"
              placeholder={t('login.emailPlaceholder')}
              icon={<Mail className="h-4 w-4" />}
              {...register('email')}
            />
          </FormField>

          <FormField label={t('login.password')} htmlFor="password" error={errors.password?.message}>
            <Input
              type="password"
              id="password"
              placeholder={t('login.passwordPlaceholder')}
              icon={<Lock className="h-4 w-4" />}
              {...register('password')}
            />
          </FormField>


          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input 
                id="remember" 
                type="checkbox" 
                {...register('remember')}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label htmlFor="remember" className="ml-2 block text-sm text-gray-700">
                {t('login.remember')}
              </label>
            </div>
            <div className="text-sm">
              <Link to="/forgot-password" className="font-medium text-primary-600 hover:text-primary-500">
                {t('login.forgotPassword')}
              </Link>
            </div>
          </div>

          <div>
            <Button 
              type="submit"
              variant="primary"
              fullWidth
              loading={isLoading}
              disabled={isLoading}
            >
              {t('login.loginButton')}
            </Button>
          </div>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            {t('login.alreadyHaveAccount')} 
            <Link to="/register" className="font-medium text-primary-600 hover:text-primary-500 ml-1">
              {t('login.createAccount')}
            </Link>
          </p>
        </div>
      </Card>
    </AuthLayout>
  );
}