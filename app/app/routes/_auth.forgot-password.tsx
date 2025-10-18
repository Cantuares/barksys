import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'react-router';
import { Mail, Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../lib/hooks/useAuth';
import { AuthLayout } from '../components/layout/AuthLayout';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { FormField } from '../components/ui/FormField';
import { ErrorMessage } from '../components/ui/ErrorMessage';

export default function ForgotPasswordPage() {
  const { forgotPassword, isLoading, error } = useAuth();
  const { t } = useTranslation();
  const [isSubmitted, setIsSubmitted] = React.useState(false);

  const forgotPasswordSchema = React.useMemo(() => z.object({
    email: z.string().email(t('forgotPassword.emailInvalid')).min(1, t('forgotPassword.emailRequired')),
  }), [t]);

  type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    mode: 'onBlur',
    reValidateMode: 'onBlur',
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    try {
      await forgotPassword(data.email);
      setIsSubmitted(true);
    } catch (err) {
      // Error is handled by the auth store
    }
  };

  if (isSubmitted) {
    return (
      <AuthLayout title="BarkSys">
        {/* Success Icon */}
        <div className="text-center mb-8">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
            <Check className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            {t('forgotPassword.successTitle')}
          </h1>
          <p className="text-base text-gray-500">
            {t('forgotPassword.checkEmail')}
          </p>
        </div>

        {/* Action Button */}
        <div className="pt-2">
          <Link to="/login">
            <Button variant="primary" size="lg" fullWidth>
              {t('forgotPassword.goToLogin')}
            </Button>
          </Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="BarkSys">
      {/* Header Section */}
      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
          {t('forgotPassword.title')}
        </h1>
        <p className="text-base text-gray-500">
          {t('forgotPassword.subtitle')}
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 animate-slide-down">
          <ErrorMessage message={error} />
        </div>
      )}

      {/* Forgot Password Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <FormField
          label={t('forgotPassword.email')}
          htmlFor="email"
          error={errors.email?.message}
          required
        >
          <Input
            type="email"
            id="email"
            placeholder={t('forgotPassword.emailPlaceholder')}
            icon={<Mail className="h-5 w-5" />}
            error={!!errors.email}
            {...register('email')}
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
            {t('forgotPassword.submitButton')}
          </Button>
        </div>
      </form>

      {/* Back to Login Link */}
      <div className="mt-8 text-center">
        <p className="text-base text-gray-600">
          {t('forgotPassword.backToLogin')}
          <Link
            to="/login"
            className="inline-block font-semibold text-green-600 hover:text-green-700 active:text-green-800 transition-colors ml-2 py-2 px-1"
          >
            {t('login.loginButton')}
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}