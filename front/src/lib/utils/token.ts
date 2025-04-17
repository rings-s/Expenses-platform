import { authStore } from '$lib/stores/auth';
import type { AuthTokens } from '$lib/types/auth.types';

/**
 * Token utilities for JWT authentication
 *
 * This module contains functions for:
 * - Parsing JWT tokens
 * - Checking token validity
 * - Getting authentication headers
 * - Refreshing tokens
 */

/**
 * Parse a JWT token to extract its payload
 * @param token JWT token to parse
 * @returns Decoded token payload or null if invalid
 */
export function parseToken(token: string): any {
	if (!token) return null;

	try {
		// Split the token and get the payload (middle part)
		const base64Url = token.split('.')[1];
		const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
		const jsonPayload = decodeURIComponent(
			atob(base64)
				.split('')
				.map(function (c) {
					return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
				})
				.join('')
		);

		return JSON.parse(jsonPayload);
	} catch (error) {
		console.error('Error parsing token:', error);
		return null;
	}
}

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
		const isValid = payload.exp * 1000 > Date.now();

		if (!isValid) {
			console.log('Token expired at:', new Date(payload.exp * 1000));
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
		return null;
	}
}

/**
 * Get the authorization header with the current access token
 * @returns Authorization header object
 */
export function getAuthHeader(): Record<string, string> {
	let headerValue = '';

	// Get synchronous value from the store
	const unsubscribe = authStore.subscribe((state) => {
		if (state.isAuthenticated && state.tokens?.access) {
			headerValue = `Bearer ${state.tokens.access}`;
		}
	});
	unsubscribe();

	return headerValue ? { Authorization: headerValue } : {};
}

/**
 * Refresh the access token using a refresh token
 * @param refreshToken Refresh token to use
 * @returns Promise resolving to a boolean indicating success
 */
export async function refreshAccessToken(refreshToken: string): Promise<boolean> {
	console.log('Refreshing access token...');
	return authStore.refreshToken(refreshToken);
}

/**
 * Check if we should attempt to refresh a token
 * (e.g., if it's about to expire)
 * @param token Access token to check
 * @param thresholdMinutes Minutes before expiration to trigger refresh
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

		const shouldRefresh = expirationTime < currentTime + thresholdMs;

		if (shouldRefresh) {
			console.log(
				'Token expiring soon, should refresh. Expires in:',
				Math.round((expirationTime - currentTime) / 1000 / 60),
				'minutes'
			);
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
		return null;
	}
}
