/**
 * Authentication Type Definitions
 *
 * This module defines all the TypeScript interfaces related to authentication
 * and user management in the application.
 */

/**
 * User Types
 * Valid user types in the application
 */
export type UserType = 'admin' | 'manager' | 'regular';

/**
 * User Model
 * Core user entity with all properties from the backend
 */
export interface User {
	id: string;
	email: string;
	username: string;
	first_name: string;
	last_name: string;
	user_type: UserType;
	phone_number?: string;
	profile_image?: string;
	date_joined: string;
	last_login?: string;
	email_verified: boolean;
	bio?: string;
	preferences?: Record<string, any>;
}

/**
 * JWT Token Payload
 * Expected structure of a decoded JWT token
 */
export interface TokenPayload {
	user_id: string;
	exp: number;
	iat: number;
	jti: string;
	token_type: string;
	[key: string]: any;
}

/**
 * Authentication Tokens
 * JWT tokens returned from the authentication API
 */
export interface AuthTokens {
	access: string;
	refresh: string;
	expires_in: number;
}

/**
 * Login Credentials
 * Required data for user login
 */
export interface LoginCredentials {
	email: string;
	password: string;
}

/**
 * Registration Data
 * Required data for user registration
 */
export interface RegisterData {
	email: string;
	username: string;
	password: string;
	password_confirm: string;
	first_name?: string;
	last_name?: string;
	phone_number?: string;
	user_type?: UserType;
}

/**
 * Authentication Response
 * Response from authentication API endpoints
 */
export interface AuthResponse {
	user: User;
	tokens: AuthTokens;
	message?: string;
}

/**
 * Authentication State
 * Core state stored in the auth store
 */
export interface AuthState {
	user: User | null;
	tokens: AuthTokens | null;
	isAuthenticated: boolean;
	isLoading: boolean;
	error: string | null;
	message?: string | null;
}

/**
 * Email Verification Data
 * Data required for email verification
 */
export interface EmailVerificationData {
	token: string;
}

/**
 * Password Reset Request Data
 * Data required to request a password reset
 */
export interface RequestPasswordResetData {
	email: string;
}

/**
 * Password Reset Data
 * Data required to reset a password
 */
export interface ResetPasswordData {
	token: string;
	password: string;
	password_confirm: string;
}

/**
 * Profile Update Data
 * Data that can be updated in a user profile
 */
export interface ProfileUpdateData {
	username?: string;
	first_name?: string;
	last_name?: string;
	phone_number?: string;
	bio?: string;
	user_type?: UserType;
}

/**
 * Authentication Event
 * Events that can be emitted by auth-related components
 */
export type AuthEvent =
	| { type: 'login'; user: User }
	| { type: 'register'; user: User }
	| { type: 'logout' }
	| { type: 'profile-update'; user: User }
	| { type: 'verification'; email: string }
	| { type: 'password-reset'; email: string };
