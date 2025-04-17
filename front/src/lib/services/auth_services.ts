/**
 * Authentication Service
 *
 * Comprehensive service for handling all authentication-related operations.
 * This service acts as a bridge between the UI components and the authentication API.
 */

import { api } from './api';
import { authStore } from '$lib/stores/auth';
import { goto } from '$app/navigation';
import type {
	AuthResponse,
	LoginCredentials,
	RegisterData,
	ResetPasswordData,
	ProfileUpdateData,
	User,
	EmailVerificationData
} from '$lib/types/auth.types';

/**
 * Result of login attempt
 */
interface LoginResult {
	success: boolean;
	needsVerification?: boolean;
	user?: User;
	redirectUrl?: string;
}

/**
 * Result of registration attempt
 */
interface RegisterResult {
	success: boolean;
	requiresVerification?: boolean;
	user?: User;
}

/**
 * Authentication Service
 * Handles all authentication-related operations
 */
export const authService = {
	/**
	 * Log in with email and password
	 * @param credentials User credentials (email, password)
	 * @returns Promise with login result
	 */
	async login(credentials: LoginCredentials): Promise<LoginResult> {
		authStore.clearError();

		const response = await api.post<AuthResponse>('/accounts/login/', credentials);

		if (response.error) {
			// Check if this is an email verification error
			if (
				response.error.status === 400 &&
				response.error.message.toLowerCase().includes('email not verified')
			) {
				return { success: false, needsVerification: true };
			}

			authStore.setError(response.error.message);
			return { success: false };
		}

		if (response.data) {
			authStore.setAuth(response.data.user, response.data.tokens);
			return {
				success: true,
				user: response.data.user,
				redirectUrl: response.data.user.email_verified ? '/dashboard' : '/auth/verify-email'
			};
		}

		return { success: false };
	},

	/**
	 * Register a new user
	 * @param userData Registration data
	 * @returns Promise with registration result
	 */
	async register(userData: RegisterData): Promise<RegisterResult> {
		authStore.clearError();
		const regData = { ...userData };

		const response = await api.post<AuthResponse>('/accounts/register/', regData);

		if (response.error) {
			authStore.setError(response.error.message);
			return { success: false };
		}

		if (response.data) {
			authStore.setAuth(response.data.user, response.data.tokens);

			// Check if email verification is required
			const requiresVerification =
				response.data.message?.includes('verification') || !response.data.user.email_verified;

			return {
				success: true,
				requiresVerification,
				user: response.data.user
			};
		}

		return { success: false };
	},

	/**
	 * Log out the current user
	 * @param redirectTo URL to redirect to after logout (default: /auth/login)
	 * @returns Promise resolving to logout success
	 */
	async logout(redirectTo: string = '/auth/login'): Promise<boolean> {
		// Get current auth state
		const { tokens } = authStore._update((state) => state);

		// Log what we're about to do
		console.info('Logging out user...');

		if (tokens?.refresh) {
			try {
				// Send logout request to invalidate token on server
				const response = await api.post(
					'/accounts/logout/',
					{ refresh: tokens.refresh },
					{
						// Don't retry on 401 since we're already logging out
						retryOnUnauthorized: false,
						// Suppress error logs for cleaner UX
						suppressErrors: true
					}
				);

				// Log result but continue regardless
				if (response.error) {
					console.error('Server logout request failed:', response.error);
				} else {
					console.info('Server logout successful');
				}
			} catch (error) {
				// Continue with local logout even if server request fails
				console.error('Error during server logout:', error);
			}
		}

		// Always clear local state regardless of backend response
		authStore.logout();
		console.info('Local auth state cleared');

		// Handle redirection if requested
		if (redirectTo && typeof goto === 'function') {
			console.info('Redirecting to:', redirectTo);
			goto(redirectTo);
		}

		return true;
	},

	/**
	 * Get the current user's profile
	 * @returns Promise resolving to user object or null
	 */
	async getUserProfile(): Promise<User | null> {
		const response = await api.get<User>('/accounts/profile/');

		if (response.error) {
			if (response.error.status === 401) {
				// If unauthorized, clear auth state
				authStore.logout();
			} else {
				authStore.setError(response.error.message);
			}
			return null;
		}

		if (response.data) {
			// Update user in auth store
			authStore.updateUser(response.data);
			return response.data;
		}

		return null;
	},

	/**
	 * Update the user's profile
	 * @param profileData Data to update
	 * @returns Promise resolving to update success
	 */
	async updateProfile(profileData: ProfileUpdateData): Promise<boolean> {
		// Filter out null/undefined values to prevent overwriting with nulls
		const cleanedData = Object.fromEntries(
			Object.entries(profileData).filter(([_, v]) => v !== null && v !== undefined)
		);

		const response = await api.put<User>('/accounts/profile/', cleanedData);

		if (response.error) {
			authStore.setError(response.error.message);
			return false;
		}

		if (response.data) {
			// Update user in auth store
			authStore.updateUser(response.data);

			// Show success message
			authStore.setMessage('Profile updated successfully');

			// Clear success message after 3 seconds
			setTimeout(() => {
				authStore.clearMessage();
			}, 3000);

			return true;
		}

		return false;
	},

	/**
	 * Verify email with verification code
	 * @param code Verification code
	 * @returns Promise resolving to verification success
	 */
	async verifyEmail(code: string): Promise<boolean> {
		const verificationData: EmailVerificationData = { token: code };

		const response = await api.post<{
			detail: string;
			user?: User;
			tokens?: {
				access: string;
				refresh: string;
				expires_in: number;
			};
		}>('/accounts/verify-email/', verificationData);

		if (response.error) {
			authStore.setError(response.error.message);
			return false;
		}

		// If we get back updated user and tokens, update auth store
		if (response.data?.user && response.data?.tokens) {
			authStore.setAuth(response.data.user, response.data.tokens);
		} else if (response.data?.detail) {
			// If we only get a success message, update the user's email_verified status
			authStore.update((state) => {
				if (state.user) {
					return {
						...state,
						user: {
							...state.user,
							email_verified: true
						}
					};
				}
				return state;
			});

			// Show success message
			authStore.setMessage('Email verified successfully');
		}

		return true;
	},

	/**
	 * Request password reset - sends a verification code via email
	 * @param email User's email address
	 * @returns Promise resolving to request success
	 */
	async requestPasswordReset(email: string): Promise<boolean> {
		console.info('Requesting password reset for:', email);

		const response = await api.post<{ detail: string }>('/accounts/request-password-reset/', {
			email
		});

		if (response.error) {
			console.error('Password reset request failed:', response.error);
			authStore.setError(response.error.message);
			return false;
		}

		console.info('Password reset request successful:', response.data);

		// Show success message
		authStore.setMessage('Password reset instructions sent to your email');

		return true;
	},

	/**
	 * Reset password with code and new password
	 * @param data Reset password data
	 * @returns Promise resolving to reset success
	 */
	async resetPassword(data: ResetPasswordData): Promise<boolean> {
		console.info('Resetting password with verification code');

		const resetData = {
			token: data.token,
			new_password: data.password
		};

		const response = await api.post<{
			detail: string;
			user?: User;
			tokens?: {
				access: string;
				refresh: string;
				expires_in: number;
			};
		}>('/accounts/reset-password/', resetData);

		if (response.error) {
			console.error('Password reset failed:', response.error);
			authStore.setError(response.error.message);
			return false;
		}

		console.info('Password reset successful');

		// If we get back user and tokens, update auth store to log the user in
		if (response.data?.user && response.data?.tokens) {
			authStore.setAuth(response.data.user, response.data.tokens);
		}

		// Show success message
		authStore.setMessage('Password has been reset successfully');

		return true;
	},

	/**
	 * Request email verification code
	 * @param email User's email address
	 * @returns Promise resolving to request success
	 */
	async requestVerificationEmail(email: string): Promise<boolean> {
		const response = await api.post<{ detail: string }>('/accounts/request-verification/', {
			email
		});

		if (response.error) {
			authStore.setError(response.error.message);
			return false;
		}

		// Show success message
		authStore.setMessage('Verification email sent successfully');

		return true;
	},

	/**
	 * Check if user is authenticated
	 * @returns Boolean indicating authentication status
	 */
	isAuthenticated(): boolean {
		const { isAuthenticated } = authStore._update((state) => state);
		return isAuthenticated;
	},

	/**
	 * Get current user
	 * @returns Current user or null if not authenticated
	 */
	getCurrentUser(): User | null {
		const { user } = authStore._update((state) => state);
		return user;
	},

	/**
	 * Check if user has specific role
	 * @param role Role to check
	 * @returns Boolean indicating if user has role
	 */
	hasRole(role: string): boolean {
		const { user } = authStore._update((state) => state);
		return user?.user_type === role;
	}
};
