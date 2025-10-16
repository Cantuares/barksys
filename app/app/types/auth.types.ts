export enum UserRole {
  ADMIN = 'admin',
  TRAINER = 'trainer',
  TUTOR = 'tutor',
}

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  company?: Company;
  isActive: boolean;
  isEmailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Company {
  id: string;
  name: string;
  email: string;
  taxId: string;
  taxType: TaxType;
  billingAddress: string;
  city: string;
  country: string;
  postalCode?: string;
  createdAt: Date;
  updatedAt: Date;
}

export enum TaxType {
  NIF = 'nif',
  NIPC = 'nipc',
  VAT = 'vat',
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  fullName: string;
  email: string;
  password: string;
}

export interface OnboardingData {
  name: string;
  email: string;
  taxId: string;
  taxType: 'nif' | 'nipc' | 'vat';
  billingAddress: string;
  city: string;
  country?: string;
  postalCode?: string;
}

export interface AuthResponse {
  access_token: string;
  refreshToken: string;
  user: User;
}

export interface RegisterResponse {
  message: string;
}

export interface OnboardingResponse {
  message: string;
}

export interface PasswordForgotResponse {
  message: string;
}

export interface RefreshTokenResponse {
  access_token: string;
}

export interface LogoutResponse {
  message: string;
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface AuthActions {
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  onboarding: (token: string, data: OnboardingData) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, newPassword: string) => Promise<void>;
  refreshAccessToken: () => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
  initialize: () => Promise<void>;
}
