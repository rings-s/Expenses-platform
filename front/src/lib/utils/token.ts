/**
 * Token Utilities
 *
 * Comprehensive utilities for JWT token management, including:
 * - Token parsing and validation
 * - Token expiration checking
 * - Authentication header creation
 * - Token refresh management
 */

import { authStore, getAuthState } from '$lib/stores/auth';
import type { TokenPayload } from '$lib/types/auth.types';

/**
 * Parse a JWT token to extract its payload
 * @param token JWT token string
 * @returns Decoded token payload or null if invalid
 */
export function parseToken(token: string): TokenPayload | null {
	if (!token) return null;

	try {
		// Split the token and get the payload (middle part)
		const base64Url = token.split('.')[1];
		if (!base64Url) return null;

		const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
		const jsonPayload = decodeURIComponent(
			window
				.atob(base64)
				.split('')
				.map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
				.join('')
		);

		return JSON.parse(jsonPayload);
	} catch (error) {
		console.error('Error parsing token:', error);
		return null;
	}
}

/**
 * Alias for parseToken that provides a more explicit name
 */
export const decodeToken = parseToken;

/**
 * Check if a token is valid (not expired)
 * @param token JWT token to check
 * @returns boolean indicating if token is valid
 */
export function isTokenValid(token: string): boolean {
	if (!token) return false;

	try {
		const payload = parseToken(token);

		if (!payload || !payload.exp) return false;

		// Check if token is expired (exp is in seconds, Date.now() is in milliseconds)
		const currentTime = Math.floor(Date.now() / 1000);
		const isValid = payload.exp > currentTime;

		if (!isValid) {
			const expiredAt = new Date(payload.exp * 1000).toLocaleString();
			console.info(`Token expired at: ${expiredAt}`);
		}

		return isValid;
	} catch (error) {
		console.error('Error validating token:', error);
		return false;
	}
}

/**
 * Get token expiration date
 * @param token JWT token
 * @returns Expiration date or null if token is invalid
 */
export function getTokenExpiration(token: string): Date | null {
	if (!token) return null;

	try {
		const payload = parseToken(token);

		if (!payload || !payload.exp) return null;

		return new Date(payload.exp * 1000);
	} catch (error) {
		console.error('Error getting token expiration:', error);
		return null;
	}
}

/**
 * Calculate time remaining until token expiration
 * @param token JWT token
 * @returns Object with time remaining in various units, or null if token is invalid
 */
export function getTokenTimeRemaining(token: string): {
	total: number;
	days: number;
	hours: number;
	minutes: number;
	seconds: number;
} | null {
	if (!token) return null;

	try {
		const payload = parseToken(token);

		if (!payload || !payload.exp) return null;

		const expTime = payload.exp * 1000; // Convert to milliseconds
		const currentTime = Date.now();
		const remaining = expTime - currentTime;

		// If already expired
		if (remaining <= 0)
			return {
				total: 0,
				days: 0,
				hours: 0,
				minutes: 0,
				seconds: 0
			};

		// Calculate units
		const days = Math.floor(remaining / (1000 * 60 * 60 * 24));
		const hours = Math.floor((remaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
		const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
		const seconds = Math.floor((remaining % (1000 * 60)) / 1000);

		return {
			total: remaining,
			days,
			hours,
			minutes,
			seconds
		};
	} catch (error) {
		console.error('Error getting token time remaining:', error);
		return null;
	}
}

/**
 * Get the authorization header with the current access token
 * @returns Authorization header object
 */
export function getAuthHeader(): Record<string, string> {
	const state = getAuthState();

	if (state.isAuthenticated && state.tokens?.access) {
		return { Authorization: `Bearer ${state.tokens.access}` };
	}

	return {};
}

/**
 * Refresh the access token using a refresh token
 * @param refreshToken Refresh token to use
 * @returns Promise resolving to a boolean indicating success
 */
export async function refreshAccessToken(refreshToken: string): Promise<boolean> {
	console.info('Refreshing access token...');
	return authStore.refreshToken(refreshToken);
}

/**
 * Safely attempt to refresh the current token
 * @returns Promise resolving to a boolean indicating success
 */
export async function safeRefreshToken(): Promise<boolean> {
	const { tokens } = getAuthState();

	if (!tokens?.refresh) {
		console.warn('No refresh token available');
		return false;
	}

	try {
		console.info('Attempting to refresh access token...');
		const success = await refreshAccessToken(tokens.refresh);

		if (success) {
			console.info('Token refreshed successfully');
			return true;
		} else {
			console.warn('Token refresh failed');
			return false;
		}
	} catch (error) {
		console.error('Error during token refresh:', error);
		return false;
	}
}

/**
 * Check if we should attempt to refresh a token
 * (e.g., if it's about to expire)
 * @param token Access token to check
 * @param thresholdMinutes Minutes before expiration to trigger refresh (default: 5)
 * @returns Boolean indicating if refresh should be attempted
 */
export function shouldRefreshToken(token: string, thresholdMinutes: number = 5): boolean {
	if (!token) return false;

	try {
		const payload = parseToken(token);

		if (!payload || !payload.exp) return false;

		// Check if token will expire in the next X minutes
		const expirationTime = payload.exp * 1000;
		const currentTime = Date.now();
		const thresholdMs = thresholdMinutes * 60 * 1000;
		const timeRemaining = expirationTime - currentTime;

		const shouldRefresh = timeRemaining < thresholdMs && timeRemaining > 0;

		if (shouldRefresh) {
			const minutesRemaining = Math.round(timeRemaining / 1000 / 60);
			console.info(`Token expiring soon (${minutesRemaining} minutes remaining), should refresh.`);
		}

		return shouldRefresh;
	} catch (error) {
		console.error('Error checking if token should refresh:', error);
		return false;
	}
}

/**
 * Extract user ID from access token
 * @param token JWT token
 * @returns User ID or null if token is invalid
 */
export function getUserIdFromToken(token: string): string | null {
	if (!token) return null;

	try {
		const payload = parseToken(token);
		return payload?.user_id || null;
	} catch (error) {
		console.error('Error extracting user ID from token:', error);
		return null;
	}
}

/**
 * Compare two tokens to see if they are the same
 * @param token1 First token
 * @param token2 Second token
 * @returns Boolean indicating if tokens are the same
 */
export function areTokensEqual(token1: string, token2: string): boolean {
	if (!token1 || !token2) return false;

	try {
		const payload1 = parseToken(token1);
		const payload2 = parseToken(token2);

		if (!payload1 || !payload2) return false;

		// Compare essential fields
		return (
			payload1.user_id === payload2.user_id &&
			payload1.exp === payload2.exp &&
			payload1.jti === payload2.jti
		);
	} catch (error) {
		return false;
	}
}

/**
 * Check if the current user's token is about to expire
 * and refresh it if needed
 * @returns Promise resolving to a boolean indicating success
 */
export async function checkAndRefreshToken(): Promise<boolean> {
	const { tokens } = getAuthState();

	if (!tokens?.access) {
		return false;
	}

	if (shouldRefreshToken(tokens.access)) {
		return safeRefreshToken();
	}

	return true;
}

/**
 * Create a function that periodically checks and refreshes tokens
 * @param intervalMinutes How often to check token status in minutes
 * @returns Function to stop the auto-refresh
 */
export function startTokenAutoRefresh(intervalMinutes: number = 4): () => void {
	const interval = setInterval(
		() => {
			const { isAuthenticated, tokens } = getAuthState();

			if (isAuthenticated && tokens?.access) {
				checkAndRefreshToken();
			} else {
				// If not authenticated, stop checking
				stopAutoRefresh();
			}
		},
		intervalMinutes * 60 * 1000
	);

	const stopAutoRefresh = () => {
		clearInterval(interval);
	};

	return stopAutoRefresh;
}
