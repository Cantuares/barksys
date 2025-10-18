import React, { useEffect } from 'react';
import { X, AlertTriangle, Info, AlertCircle } from 'lucide-react';
import { Button } from './Button';

interface ConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
  isLoading?: boolean;
}

export const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  variant = 'info',
  isLoading = false,
}) => {
  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const variantStyles = {
    danger: {
      icon: AlertCircle,
      iconBg: 'bg-red-100',
      iconColor: 'text-red-600',
      buttonVariant: 'primary' as const,
      buttonClass: '!bg-red-600 hover:!bg-red-700 !focus:ring-red-500',
    },
    warning: {
      icon: AlertTriangle,
      iconBg: 'bg-yellow-100',
      iconColor: 'text-yellow-600',
      buttonVariant: 'primary' as const,
      buttonClass: '!bg-yellow-600 hover:!bg-yellow-700 !focus:ring-yellow-500',
    },
    info: {
      icon: Info,
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600',
      buttonVariant: 'primary' as const,
      buttonClass: '',
    },
  };

  const style = variantStyles[variant];
  const Icon = style.icon;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div
          className="relative bg-white rounded-2xl shadow-xl max-w-md w-full p-6 transform transition-all"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            disabled={isLoading}
          >
            <X className="w-5 h-5" />
          </button>

          {/* Icon */}
          <div className={`${style.iconBg} rounded-full w-12 h-12 flex items-center justify-center mb-4`}>
            <Icon className={`w-6 h-6 ${style.iconColor}`} />
          </div>

          {/* Content */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {title}
            </h3>
            <p className="text-gray-600">
              {message}
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1"
            >
              {cancelText}
            </Button>
            <Button
              variant={style.buttonVariant}
              onClick={onConfirm}
              loading={isLoading}
              className={`flex-1 ${style.buttonClass}`}
            >
              {confirmText}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
