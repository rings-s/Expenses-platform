// Add this browser detection utility
const browser = typeof window !== 'undefined';
import api from './api';

export default {
	/**
	 * Register a new user
	 */
	async register(userData) {
		try {
			const response = await api.post('/accounts/register/', userData);
			if (response.tokens) {
				localStorage.setItem('token', response.tokens.access);
				localStorage.setItem('refreshToken', response.tokens.refresh);
			}
			return response;
		} catch (error) {
			console.error('Registration error:', error);
			throw error;
		}
	},

	/**
	 * Login a user
	 */
	async login(credentials) {
		try {
			const response = await api.post('/accounts/login/', credentials);
			if (response.tokens) {
				localStorage.setItem('token', response.tokens.access);
				localStorage.setItem('refreshToken', response.tokens.refresh);
			}
			return response;
		} catch (error) {
			console.error('Login error:', error);
			throw error;
		}
	},

	/**
	 * Logout a user
	 */
	async logout() {
		try {
			const refreshToken = localStorage.getItem('refreshToken');
			if (refreshToken) {
				await api.post('/accounts/logout/', { refresh: refreshToken });
			}
		} catch (error) {
			console.error('Logout error:', error);
		} finally {
			localStorage.removeItem('token');
			localStorage.removeItem('refreshToken');
		}
	},

	/**
	 * Check if user is authenticated
	 */
	isAuthenticated() {
		return !!localStorage.getItem('token');
	},

	/**
	 * Refresh the access token
	 */
	async refreshToken() {
		const refreshToken = localStorage.getItem('refreshToken');
		if (!refreshToken) return false;

		try {
			const response = await api.post('/accounts/token/refresh/', {
				refresh: refreshToken
			});

			if (response.access) {
				localStorage.setItem('token', response.access);
				return true;
			}
			return false;
		} catch (error) {
			console.error('Token refresh error:', error);
			this.logout();
			return false;
		}
	},

	/**
	 * Request password reset
	 */
	async requestPasswordReset(email) {
		return api.post('/accounts/request-password-reset/', { email });
	},

	/**
	 * Reset password with token
	 */
	async resetPassword(token, newPassword) {
		return api.post('/accounts/reset-password/', {
			token,
			new_password: newPassword
		});
	},

	/**
	 * Verify email with token
	 */
	async verifyEmail(token) {
		return api.post('/accounts/verify-email/', { token });
	},

	/**
	 * Request new email verification
	 */
	async requestEmailVerification(email) {
		return api.post('/accounts/request-verification/', { email });
	}
};
