import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'react-router';
import { User, Mail, Lock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../lib/hooks/useAuth';
import { AuthLayout } from '../components/layout/AuthLayout';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { FormField } from '../components/ui/FormField';
import { ErrorMessage } from '../components/ui/ErrorMessage';

export default function RegisterPage() {
  const { register: registerUser, isLoading, error } = useAuth();
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
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: 'onBlur',
    reValidateMode: 'onBlur',
  });

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
    <AuthLayout title="BarkSys">
      {/* Header Section */}
      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
          {t('register.title')}
        </h1>
        <p className="text-base text-gray-500">
          {t('register.subtitle')}
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 animate-slide-down">
          <ErrorMessage message={error} />
        </div>
      )}

      {/* Register Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <FormField
          label={t('register.fullName')}
          htmlFor="fullName"
          error={errors.fullName?.message}
        >
          <Input
            type="text"
            id="fullName"
            placeholder={t('register.fullNamePlaceholder')}
            icon={<User className="h-5 w-5" />}
            error={!!errors.fullName}
            {...register('fullName')}
          />
        </FormField>

        <FormField
          label={t('register.email')}
          htmlFor="email"
          error={errors.email?.message}
        >
          <Input
            type="email"
            id="email"
            placeholder={t('register.emailPlaceholder')}
            icon={<Mail className="h-5 w-5" />}
            error={!!errors.email}
            {...register('email')}
          />
        </FormField>

        <FormField
          label={t('register.password')}
          htmlFor="password"
          error={errors.password?.message}
        >
          <Input
            type="password"
            id="password"
            placeholder={t('register.passwordPlaceholder')}
            icon={<Lock className="h-5 w-5" />}
            error={!!errors.password}
            {...register('password')}
          />
        </FormField>

        <FormField
          label={t('register.confirmPassword')}
          htmlFor="confirmPassword"
          error={errors.confirmPassword?.message}
        >
          <Input
            type="password"
            id="confirmPassword"
            placeholder={t('register.confirmPasswordPlaceholder')}
            icon={<Lock className="h-5 w-5" />}
            error={!!errors.confirmPassword}
            {...register('confirmPassword')}
          />
        </FormField>

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
            {t('register.createAccount')}
          </Button>
        </div>
      </form>

      {/* Login Link */}
      <div className="mt-8 text-center">
        <p className="text-base text-gray-600">
          {t('register.alreadyHaveAccount')}
          <Link
            to="/login"
            className="inline-block font-semibold text-green-600 hover:text-green-700 active:text-green-800 transition-colors ml-2 py-2 px-1"
          >
            {t('register.loginToAccount')}
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}
