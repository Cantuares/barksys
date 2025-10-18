import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { TutorLayout } from '../components/layout/TutorLayout';
import { FormField } from '../components/ui/FormField';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { ErrorMessage } from '../components/ui/ErrorMessage';
import { useAuth } from '../lib/hooks/useAuth';
import { useRequireAuth } from '../lib/hooks/useRequireAuth';
import { usersApi } from '../lib/api/users.api';
import { UserRole } from '../types/auth.types';
import { Lock, Mail, User, LogOut, Shield, CheckCircle } from 'lucide-react';

export default function ProfilePage() {
  const { t, i18n } = useTranslation();
  const { user, logout } = useAuth();
  const { isLoading: authLoading } = useRequireAuth([UserRole.ADMIN, UserRole.TRAINER, UserRole.TUTOR]);

  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  const passwordSchema = React.useMemo(() => z.object({
    currentPassword: z.string().min(1, t('profile.errors.currentPasswordRequired')),
    newPassword: z.string()
      .min(8, t('profile.errors.passwordTooShort'))
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
        t('profile.errors.passwordWeak')),
    confirmPassword: z.string().min(1, t('profile.errors.confirmPasswordRequired')),
  }).refine((data) => data.newPassword === data.confirmPassword, {
    message: t('profile.errors.passwordsDontMatch'),
    path: ["confirmPassword"],
  }), [t]);

  type PasswordFormData = z.infer<typeof passwordSchema>;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    clearErrors,
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
    mode: 'onBlur',
    reValidateMode: 'onBlur',
  });

  useEffect(() => {
    // Clear success message after 5 seconds
    if (passwordSuccess) {
      const timer = setTimeout(() => setPasswordSuccess(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [passwordSuccess]);

  useEffect(() => {
    // Clear all errors when language changes
    clearErrors();
    setPasswordError('');
    setPasswordSuccess('');
  }, [i18n.language, clearErrors]);

  const onSubmit = async (data: PasswordFormData) => {
    if (!user?.id) {
      setPasswordError(t('profile.errors.userNotFound'));
      return;
    }

    setIsChangingPassword(true);
    setPasswordError('');
    setPasswordSuccess('');

    try {
      await usersApi.changePassword(user.id, {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });

      setPasswordSuccess(t('profile.success.passwordChanged'));
      reset();
    } catch (error: any) {
      setPasswordError(error?.message || t('profile.errors.passwordChangeFailed'));
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleLogout = async () => {
    if (window.confirm(t('profile.confirmLogout'))) {
      await logout();
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
        </div>
      </div>
    );
  }

  const getRoleLabel = (role: UserRole) => {
    const roleLabels = {
      [UserRole.ADMIN]: t('profile.roles.admin'),
      [UserRole.TRAINER]: t('profile.roles.trainer'),
      [UserRole.TUTOR]: t('profile.roles.tutor'),
    };
    return roleLabels[role];
  };

  return (
    <TutorLayout
      title={t('profile.title')}
      subtitle={t('profile.subtitle')}
      showBackButton={false}
    >
      <div className="space-y-6">
        {/* Profile Information Card */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
              <User className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h2 className="text-lg md:text-xl font-bold text-gray-900">{t('profile.sections.personalInfo')}</h2>
              <p className="text-sm text-gray-500">{t('profile.sections.personalInfoDescription')}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
              <User className="h-5 w-5 text-gray-400 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-500">{t('profile.fields.fullName')}</p>
                <p className="text-base font-semibold text-gray-900">{user?.fullName}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
              <Mail className="h-5 w-5 text-gray-400 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-500">{t('profile.fields.email')}</p>
                <p className="text-base font-semibold text-gray-900">{user?.email}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
              <Shield className="h-5 w-5 text-gray-400 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-500">{t('profile.fields.role')}</p>
                <p className="text-base font-semibold text-gray-900">{user?.role && getRoleLabel(user.role)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Change Password Card */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-blue-100">
              <Lock className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg md:text-xl font-bold text-gray-900">{t('profile.sections.changePassword')}</h2>
              <p className="text-sm text-gray-500">{t('profile.sections.changePasswordDescription')}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {passwordError && (
              <ErrorMessage message={passwordError} />
            )}

            {passwordSuccess && (
              <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                <p className="text-sm font-medium text-green-800">{passwordSuccess}</p>
              </div>
            )}

            <FormField
              label={t('profile.fields.currentPassword')}
              htmlFor="currentPassword"
              error={errors.currentPassword?.message}
              required
            >
              <Input
                id="currentPassword"
                type="password"
                placeholder={t('profile.placeholders.currentPassword')}
                error={!!errors.currentPassword}
                icon={<Lock className="h-5 w-5" />}
                {...register('currentPassword')}
              />
            </FormField>

            <FormField
              label={t('profile.fields.newPassword')}
              htmlFor="newPassword"
              error={errors.newPassword?.message}
              required
            >
              <Input
                id="newPassword"
                type="password"
                placeholder={t('profile.placeholders.newPassword')}
                error={!!errors.newPassword}
                icon={<Lock className="h-5 w-5" />}
                {...register('newPassword')}
              />
            </FormField>

            <FormField
              label={t('profile.fields.confirmPassword')}
              htmlFor="confirmPassword"
              error={errors.confirmPassword?.message}
              required
            >
              <Input
                id="confirmPassword"
                type="password"
                placeholder={t('profile.placeholders.confirmPassword')}
                error={!!errors.confirmPassword}
                icon={<Lock className="h-5 w-5" />}
                {...register('confirmPassword')}
              />
            </FormField>

            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                size="md"
                fullWidth
                loading={isChangingPassword}
                disabled={isChangingPassword}
              >
                {t('profile.buttons.changePassword')}
              </Button>
            </div>
          </form>
        </div>

        {/* Logout Card */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
              <LogOut className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <h2 className="text-lg md:text-xl font-bold text-gray-900">{t('profile.sections.logout')}</h2>
              <p className="text-sm text-gray-500">{t('profile.sections.logoutDescription')}</p>
            </div>
          </div>

          <Button
            type="button"
            variant="secondary"
            size="md"
            fullWidth
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 focus:ring-red-500"
          >
            <LogOut className="h-5 w-5 mr-2" />
            {t('profile.buttons.logout')}
          </Button>
        </div>
      </div>
    </TutorLayout>
  );
}
