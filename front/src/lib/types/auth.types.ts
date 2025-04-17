export interface User {
	id: string;
	email: string;
	username: string;
	first_name: string;
	last_name: string;
	user_type: 'admin' | 'manager' | 'regular';
	phone_number?: string;
	profile_image?: string;
	date_joined: string;
	last_login?: string;
	email_verified: boolean;
	bio?: string;
}

export interface AuthTokens {
	access: string;
	refresh: string;
	expires_in: number;
}

export interface LoginCredentials {
	email: string;
	password: string;
}

export interface RegisterData {
	email: string;
	username: string;
	password: string;
	password_confirm: string;
	first_name?: string;
	last_name?: string;
	phone_number?: string;
	user_type?: string;
}

export interface AuthResponse {
	user: User;
	tokens: AuthTokens;
	message?: string;
}

export interface AuthState {
	user: User | null;
	tokens: AuthTokens | null;
	isAuthenticated: boolean;
	isLoading: boolean;
	error: string | null;
	message?: string | null;
}

export interface EmailVerificationData {
	token: string;
}

export interface RequestPasswordResetData {
	email: string;
}

export interface ResetPasswordData {
	token: string;
	password: string;
	password_confirm: string;
}

export interface ProfileUpdateData {
	username?: string;
	first_name?: string;
	last_name?: string;
	phone_number?: string;
	bio?: string;
	user_type?: string;
}
