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
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { FormField } from '../components/ui/FormField';
import { ErrorMessage } from '../components/ui/ErrorMessage';

export default function LoginPage() {
  const { login, isLoading, error } = useAuth();
  const { t } = useTranslation();

  // Redirect authenticated users to their dashboard
  useRequireGuest();

  const loginSchema = React.useMemo(() => z.object({
    email: z.string().email(t('login.emailInvalid')).min(1, t('login.emailRequired')),
    password: z.string().min(1, t('login.passwordRequired')),
  }), [t]);

  type LoginFormData = z.infer<typeof loginSchema>;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: 'onBlur',
    reValidateMode: 'onBlur',
  });

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
    <AuthLayout title="BarkSys">
      {/* Header Section */}
      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
          {t('login.title')}
        </h1>
        <p className="text-base text-gray-500">
          {t('login.subtitle')}
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 animate-slide-down">
          <ErrorMessage message={error} />
        </div>
      )}

      {/* Login Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <FormField
          label={t('login.email')}
          htmlFor="email"
          error={errors.email?.message}
        >
          <Input
            type="email"
            id="email"
            placeholder={t('login.emailPlaceholder')}
            icon={<Mail className="h-5 w-5" />}
            error={!!errors.email}
            {...register('email')}
          />
        </FormField>

        <FormField
          label={t('login.password')}
          htmlFor="password"
          error={errors.password?.message}
        >
          <Input
            type="password"
            id="password"
            placeholder={t('login.passwordPlaceholder')}
            icon={<Lock className="h-5 w-5" />}
            error={!!errors.password}
            {...register('password')}
          />
        </FormField>

        {/* Forgot Password Link */}
        <div className="flex items-center justify-end">
          <Link
            to="/forgot-password"
            className="inline-block text-sm font-medium text-green-600 hover:text-green-700 active:text-green-800 transition-colors py-2 px-1"
          >
            {t('login.forgotPassword')}
          </Link>
        </div>

        {/* Submit Button */}
        <div className="pt-2">
          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            loading={isLoading}
            disabled={isLoading}
          >
            {t('login.loginButton')}
          </Button>
        </div>
      </form>

      {/* Register Link */}
      <div className="mt-8 text-center">
        <p className="text-base text-gray-600">
          {t('login.alreadyHaveAccount')}
          <Link
            to="/register"
            className="inline-block font-semibold text-green-600 hover:text-green-700 active:text-green-800 transition-colors ml-2 py-2 px-1"
          >
            {t('login.createAccount')}
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}
