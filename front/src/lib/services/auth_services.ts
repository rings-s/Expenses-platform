import { api } from './api';
import { authStore } from '$lib/stores/auth';
import { goto } from '$app/navigation';
import type {
	AuthResponse,
	LoginCredentials,
	RegisterData,
	ResetPasswordData,
	ProfileUpdateData,
	User
} from '$lib/types/auth.types';

/**
 * Authentication Service
 */
export const authService = {
	/**
	 * Log in with email and password
	 */
	async login(
		credentials: LoginCredentials
	): Promise<{ success: boolean; needsVerification?: boolean }> {
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
			return { success: true };
		}

		return { success: false };
	},

	/**
	 * Register a new user
	 */
	async register(
		userData: RegisterData
	): Promise<{ success: boolean; requiresVerification?: boolean }> {
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
				requiresVerification: requiresVerification
			};
		}

		return { success: false };
	},

	/**
	 * Log out the current user
	 */
	async logout(redirectTo: string = '/auth/login'): Promise<boolean> {
		let tokens = null;

		// Get the current tokens from the store
		const unsubscribe = authStore.subscribe((state) => {
			tokens = state.tokens;
		});
		unsubscribe();

		// Log what we're about to do
		console.log('Attempting logout...');

		if (tokens?.refresh) {
			try {
				// Log the payload we're sending
				console.log(
					'Sending logout request with refresh token:',
					tokens.refresh.substring(0, 10) + '...'
				);

				// Make sure we're using the exact expected endpoint
				const logoutEndpoint = '/accounts/logout/';
				console.log('Using logout endpoint:', logoutEndpoint);

				// Make the request with the proper content type
				const response = await api.post(
					logoutEndpoint,
					{
						refresh: tokens.refresh
					},
					{
						headers: {
							'Content-Type': 'application/json'
						}
					}
				);

				// Log the response for debugging
				console.log('Logout response:', response);

				// Check if the request was successful
				if (response.error) {
					console.error('Logout request failed:', response.error);
				} else {
					console.log('Logout request successful');
				}
			} catch (error) {
				console.error('Error during logout:', error);
			}
		} else {
			console.log('No refresh token available for logout');
		}

		// Always clear local state regardless of backend response
		authStore.logout();
		console.log('Local auth state cleared');

		// Handle redirection if requested
		if (redirectTo && typeof window !== 'undefined') {
			console.log('Redirecting to:', redirectTo);
			if (typeof goto === 'function') {
				goto(redirectTo);
			} else {
				// Fallback if goto is unavailable
				window.location.href = redirectTo;
			}
		}

		return true; // Return success even if backend fails, as we've cleared local state
	},

	/**
	 * Get the current user's profile
	 */
	async getUserProfile(): Promise<User | null> {
		const response = await api.get<User>('/accounts/profile/');

		if (response.error) {
			if (response.error.status === 401) {
				authStore.logout();
			} else {
				authStore.setError(response.error.message);
			}
			return null;
		}

		if (response.data) {
			authStore.updateUser(response.data);
			return response.data;
		}

		return null;
	},

	/**
	 * Update the user's profile
	 */
	async updateProfile(profileData: ProfileUpdateData): Promise<boolean> {
		const cleanedData = Object.fromEntries(
			Object.entries(profileData).filter(([_, v]) => v !== null && v !== undefined)
		);

		const response = await api.put<User>('/accounts/profile/', cleanedData);

		if (response.error) {
			authStore.setError(response.error.message);
			return false;
		}

		if (response.data) {
			authStore.updateUser(response.data);
			return true;
		}

		return false;
	},

	/**
	 * Verify email with 6-digit code
	 */
	async verifyEmail(code: string): Promise<boolean> {
		const response = await api.post<{
			detail: string;
			user?: User;
			tokens?: {
				access: string;
				refresh: string;
				expires_in: number;
			};
		}>('/accounts/verify-email/', { token: code });

		if (response.error) {
			authStore.setError(response.error.message);
			return false;
		}

		// If we get back updated user and tokens, update auth store
		if (response.data?.user && response.data?.tokens) {
			authStore.setAuth(response.data.user, response.data.tokens);
		}

		return true;
	},

	/**
	 * Request password reset - sends a 6-digit code via email
	 */
	async requestPasswordReset(email: string): Promise<boolean> {
		console.log('Requesting password reset for:', email);

		const response = await api.post<{ detail: string }>('/accounts/request-password-reset/', {
			email
		});

		if (response.error) {
			console.error('Password reset request failed:', response.error);
			authStore.setError(response.error.message);
			return false;
		}

		console.log('Password reset request successful:', response.data);
		return true;
	},

	/**
	 * Reset password with code and new password
	 */
	async resetPassword(data: ResetPasswordData): Promise<boolean> {
		console.log('Resetting password with token:', data.token);

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

		console.log('Password reset successful:', response.data);

		// If we get back user and tokens, update auth store to log the user in
		if (response.data?.user && response.data?.tokens) {
			authStore.setAuth(response.data.user, response.data.tokens);
		}

		return true;
	},

	/**
	 * Request email verification code
	 */
	async requestVerificationEmail(email: string): Promise<boolean> {
		const response = await api.post<{ detail: string }>('/accounts/request-verification/', {
			email
		});

		if (response.error) {
			authStore.setError(response.error.message);
			return false;
		}

		return true;
	},

	/**
	 * Check if user is authenticated
	 */
	isAuthenticated(): boolean {
		let isAuth = false;
		const unsubscribe = authStore.subscribe((state) => {
			isAuth = state.isAuthenticated;
		});
		unsubscribe();
		return isAuth;
	},

	/**
	 * Refresh authentication token
	 */
	async refreshToken(refreshToken: string): Promise<boolean> {
		try {
			const response = await api.post<{ access: string; refresh?: string }>(
				'/accounts/token/refresh/',
				{
					refresh: refreshToken
				}
			);

			if (response.error) {
				console.error('Token refresh failed:', response.error);
				return false;
			}

			if (response.data) {
				authStore.update((state) => {
					return {
						...state,
						tokens: {
							...state.tokens,
							access: response.data.access,
							...(response.data.refresh && { refresh: response.data.refresh })
						}
					};
				});
				return true;
			}

			return false;
		} catch (error) {
			console.error('Token refresh error:', error);
			return false;
		}
	}
};
