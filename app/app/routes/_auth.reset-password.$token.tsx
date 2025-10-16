import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useParams } from 'react-router';
import { Lock, Check, AlertTriangle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../lib/hooks/useAuth';
import { AuthLayout } from '../components/layout/AuthLayout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { FormField } from '../components/ui/FormField';
import { ErrorMessage } from '../components/ui/ErrorMessage';

export default function ResetPasswordPage() {
  const { token } = useParams();
  const { resetPassword, isLoading, error, clearError } = useAuth();
  const { t } = useTranslation();
  const [isSubmitted, setIsSubmitted] = React.useState(false);
  
  const resetPasswordSchema = React.useMemo(() => z.object({
    newPassword: z.string().min(6, t('resetPassword.passwordMinLength')),
    confirmPassword: z.string().min(1, t('resetPassword.confirmPasswordRequired')),
  }).refine((data) => data.newPassword === data.confirmPassword, {
    message: t('resetPassword.passwordsDoNotMatch'),
    path: ["confirmPassword"],
  }), [t]);
  
  type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    trigger,
    clearErrors,
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    mode: 'onBlur', // Only validate on blur, not on change
    reValidateMode: 'onBlur', // Only revalidate on blur
  });

  // Clear any existing errors when component mounts
  React.useEffect(() => {
    clearErrors();
  }, [clearErrors]);

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!token) return;
    
    try {
      await resetPassword(token, data.newPassword);
      setIsSubmitted(true);
    } catch (err) {
      // Error is handled by the auth store
    }
  };

  if (isSubmitted) {
    return (
      <AuthLayout title={t('nav.dashboard')} subtitle={t('resetPassword.successTitle')}>
        <Card>
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
              <Check className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">{t('resetPassword.successTitle')}</h2>
            <p className="text-gray-600 mb-6">
              {t('resetPassword.redirectMessage')}
            </p>
            <Link to="/login">
              <Button variant="primary" fullWidth>
                {t('resetPassword.goToLogin')}
              </Button>
            </Link>
          </div>
        </Card>
      </AuthLayout>
    );
  }

  if (!token) {
    return (
      <AuthLayout title={t('nav.dashboard')} subtitle={t('resetPassword.errorTitle')}>
        <Card>
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">{t('resetPassword.errorTitle')}</h2>
            <p className="text-gray-600 mb-6">
              {t('resetPassword.invalidToken')}
            </p>
            <Link to="/forgot-password">
              <Button variant="primary" fullWidth>
                {t('resetPassword.requestNewLink')}
              </Button>
            </Link>
          </div>
        </Card>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title={t('nav.dashboard')} subtitle={t('resetPassword.title')}>
      <Card>
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">{t('resetPassword.title')}</h2>
          <p className="text-gray-500 mt-2">{t('resetPassword.subtitle')}</p>
        </div>

        {error && <ErrorMessage message={error} />}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <FormField label={t('resetPassword.newPassword')} htmlFor="newPassword" error={errors.newPassword?.message}>
            <Input
              type="password"
              id="newPassword"
              placeholder={t('resetPassword.newPasswordPlaceholder')}
              icon={<Lock className="h-4 w-4" />}
              {...register('newPassword')}
            />
          </FormField>

          <FormField label={t('resetPassword.confirmPassword')} htmlFor="confirmPassword" error={errors.confirmPassword?.message}>
            <Input
              type="password"
              id="confirmPassword"
              placeholder={t('resetPassword.confirmPasswordPlaceholder')}
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
              {t('resetPassword.submitButton')}
            </Button>
          </div>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            {t('resetPassword.backToLogin')} 
            <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500 ml-1">
              {t('login.loginButton')}
            </Link>
          </p>
        </div>
      </Card>
    </AuthLayout>
  );
}