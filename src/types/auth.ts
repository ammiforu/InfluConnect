import type { UserRole } from './enums';

// Base user from Supabase Auth
export interface AuthUser {
  id: string;
  email: string;
  email_confirmed_at?: string;
  created_at: string;
  updated_at: string;
}

// Extended user profile
export interface User {
  id: string;
  email: string;
  role: UserRole;
  first_name: string;
  last_name: string;
  profile_picture_url: string | null;
  created_at: string;
  updated_at: string;
}

// Session type
export interface Session {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  expires_at?: number;
  user: AuthUser;
}

// Auth state
export interface AuthState {
  user: AuthUser | null;
  profile: User | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

// Signup form data
export interface SignupFormData {
  email: string;
  password: string;
  confirmPassword: string;
  role: UserRole;
  firstName: string;
  lastName: string;
}

// Login form data
export interface LoginFormData {
  email: string;
  password: string;
  rememberMe?: boolean;
}

// Password reset form data
export interface ResetPasswordFormData {
  email: string;
}

// Update password form data
export interface UpdatePasswordFormData {
  password: string;
  confirmPassword: string;
}
