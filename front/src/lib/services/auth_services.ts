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
	async login(credentials: LoginCredentials): Promise<boolean> {
		authStore.clearError();

		const response = await api.post<AuthResponse>('/accounts/login/', credentials);

		if (response.error) {
			authStore.setError(response.error.message);
			return false;
		}

		if (response.data) {
			authStore.setAuth(response.data.user, response.data.tokens);
			return true;
		}

		return false;
	},

	/**
	 * Register a new user
	 */
	async register(userData: RegisterData): Promise<boolean> {
		authStore.clearError();
		const regData = { ...userData };

		const response = await api.post<AuthResponse>('/accounts/register/', regData);

		if (response.error) {
			authStore.setError(response.error.message);
			return false;
		}

		if (response.data) {
			authStore.setAuth(response.data.user, response.data.tokens);

			// If email verification is required, show a message
			if (response.data.requires_verification) {
				// Redirect to verification page
				goto('/auth/verify-email');
			}

			return true;
		}

		return false;
	},

	/**
	 * Log out the current user
	 */
	async logout(redirectTo: string = '/auth/login'): Promise<void> {
		let tokens = null;

		const unsubscribe = authStore.subscribe((state) => {
			tokens = state.tokens;
		});
		unsubscribe();

		if (tokens?.refresh) {
			try {
				await api.post('/accounts/logout/', { refresh: tokens.refresh });
			} catch (error) {
				console.error('Error during logout:', error);
			}
		}

		authStore.logout();

		if (redirectTo) {
			goto(redirectTo);
		}
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
	 * Request password reset
	 */
	async requestPasswordReset(email: string): Promise<boolean> {
		const response = await api.post<{ detail: string }>('/accounts/request-password-reset/', {
			email
		});

		if (response.error) {
			authStore.setError(response.error.message);
			return false;
		}

		return true;
	},

	/**
	 * Reset password with code
	 */
	async resetPassword(data: ResetPasswordData): Promise<boolean> {
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
			authStore.setError(response.error.message);
			return false;
		}

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
				authStore._update((state) => {
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
