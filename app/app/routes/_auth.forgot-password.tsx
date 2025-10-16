import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'react-router';
import { Mail, Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../lib/hooks/useAuth';
import { AuthLayout } from '../components/layout/AuthLayout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { FormField } from '../components/ui/FormField';
import { ErrorMessage } from '../components/ui/ErrorMessage';

export default function ForgotPasswordPage() {
  const { forgotPassword, isLoading, error, clearError } = useAuth();
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
    trigger,
    clearErrors,
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    mode: 'onBlur', // Only validate on blur, not on change
    reValidateMode: 'onBlur', // Only revalidate on blur
  });

  // Clear any existing errors when component mounts
  React.useEffect(() => {
    clearErrors();
  }, [clearErrors]);

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
      <AuthLayout title={t('nav.dashboard')} subtitle={t('forgotPassword.title')}>
        <Card>
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
              <Check className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">{t('forgotPassword.successTitle')}</h2>
            <p className="text-gray-600 mb-6">
              {t('forgotPassword.checkEmail')}
            </p>
            <Link to="/login">
              <Button variant="primary" fullWidth>
                {t('forgotPassword.goToLogin')}
              </Button>
            </Link>
          </div>
        </Card>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title={t('nav.dashboard')} subtitle={t('forgotPassword.title')}>
      <Card>
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">{t('forgotPassword.title')}</h2>
          <p className="text-gray-500 mt-2">{t('forgotPassword.subtitle')}</p>
        </div>

        {error && <ErrorMessage message={error} />}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <FormField label={t('forgotPassword.email')} htmlFor="email" error={errors.email?.message}>
            <Input
              type="email"
              id="email"
              placeholder={t('forgotPassword.emailPlaceholder')}
              icon={<Mail className="h-4 w-4" />}
              {...register('email')}
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
              {t('forgotPassword.submitButton')}
            </Button>
          </div>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            {t('forgotPassword.backToLogin')} 
            <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500 ml-1">
              {t('login.loginButton')}
            </Link>
          </p>
        </div>
      </Card>
    </AuthLayout>
  );
}