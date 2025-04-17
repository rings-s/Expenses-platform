/**
 * API Service
 *
 * A robust, type-safe API client for communicating with backend services.
 * Features include:
 * - Automatic token handling and refresh
 * - Error normalization
 * - Type safety with generics
 * - Request retries on token expiration
 */

import { browser } from '$app/environment';
import { authStore, getAuthState } from '$lib/stores/auth';
import { goto } from '$app/navigation';
import { shouldRefreshToken, refreshAccessToken } from '$lib/utils/token';
import type { ApiResponse, ApiError, ApiOptions } from '$lib/types/api.types';

// Base API URL from environment variables
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// Rate limiting delay (to prevent hammering the server)
const RETRY_DELAY_MS = 350;

/**
 * Create a short delay using Promise
 * @param ms Milliseconds to delay
 */
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Generic API request function with automatic token handling
 * @param endpoint API endpoint
 * @param options Fetch options and API-specific options
 * @returns Promise resolving to the API response
 */
export async function apiRequest<T>(
	endpoint: string,
	options: RequestInit & ApiOptions = {}
): Promise<ApiResponse<T>> {
	// Extract API-specific options
	const {
		skipAuth = false,
		retryOnUnauthorized = true,
		suppressErrors = false,
		...fetchOptions
	} = options;

	// Ensure the endpoint has the correct format
	const url = endpoint.startsWith('http') ? endpoint : `${API_URL}${endpoint}`;

	if (!suppressErrors) {
		console.log(`Making API request to: ${url}`);
	}

	try {
		// Get current auth state
		const authState = getAuthState();
		const tokens = authState.tokens;
		const isAuthenticated = authState.isAuthenticated;

		// Prepare the request headers
		const headers: HeadersInit = {
			'Content-Type': 'application/json',
			...fetchOptions.headers
		};

		// Add auth header if authenticated and not explicitly skipped
		if (!skipAuth && isAuthenticated && tokens?.access) {
			// Check if token is about to expire and refresh if needed
			if (shouldRefreshToken(tokens.access)) {
				if (tokens.refresh) {
					const refreshed = await refreshAccessToken(tokens.refresh);
					// If refresh failed, we'll continue with the current token
					// (the 401 handler below will handle an expired token if needed)
				}

				// Get updated auth state after potential refresh
				const updatedState = getAuthState();

				if (updatedState.tokens?.access) {
					headers['Authorization'] = `Bearer ${updatedState.tokens.access}`;
				}
			} else {
				// Token is still valid, add it to headers
				headers['Authorization'] = `Bearer ${tokens.access}`;
			}
		}

		// Make the initial request
		let response = await fetch(url, { ...fetchOptions, headers });

		// Handle 401 Unauthorized - Try to refresh token and retry
		if (response.status === 401 && retryOnUnauthorized && isAuthenticated && tokens?.refresh) {
			if (!suppressErrors) {
				console.log('Token expired, attempting to refresh...');
			}

			// Add a slight delay to prevent rate limiting
			await delay(RETRY_DELAY_MS);

			// Try to refresh the token
			const refreshed = await refreshAccessToken(tokens.refresh);

			if (refreshed) {
				// Get the new token
				const updatedState = getAuthState();

				if (updatedState.tokens?.access) {
					// Update the auth header with new token
					headers['Authorization'] = `Bearer ${updatedState.tokens.access}`;

					if (!suppressErrors) {
						console.log('Token refreshed, retrying request...');
					}

					// Retry the request with new token
					response = await fetch(url, { ...fetchOptions, headers });
				}
			} else {
				// If refresh failed, force logout
				if (!suppressErrors) {
					console.log('Token refresh failed, logging out...');
				}

				authStore.logout();

				// Redirect to login
				if (browser) {
					goto('/auth/login?session_expired=true');
				}

				return {
					error: {
						status: 401,
						data: null,
						message: 'Session expired. Please log in again.'
					}
				};
			}
		}

		// Parse response data
		let data: any = null;
		const contentType = response.headers.get('content-type');
		if (contentType && contentType.includes('application/json')) {
			data = await response.json();
		} else {
			data = await response.text();
		}

		// Handle unsuccessful responses
		if (!response.ok) {
			if (!suppressErrors) {
				console.error(`API Error (${response.status}):`, data);
			}

			// Handle field validation errors
			if (response.status === 400 && typeof data === 'object') {
				// Create a more user-friendly error message for validation errors
				const fieldErrors = [];
				for (const [field, errors] of Object.entries(data)) {
					if (Array.isArray(errors)) {
						fieldErrors.push(`${field}: ${errors.join(', ')}`);
					} else if (typeof errors === 'string') {
						fieldErrors.push(`${field}: ${errors}`);
					}
				}

				const errorMessage =
					fieldErrors.length > 0 ? fieldErrors.join('\n') : data.detail || 'Validation error';

				return {
					error: {
						status: response.status,
						data,
						message: errorMessage
					}
				};
			}

			return {
				error: {
					status: response.status,
					data,
					message: data.detail || data.message || 'An error occurred'
				}
			};
		}

		// Return successful response
		return { data: data as T };
	} catch (error) {
		// Handle network errors or other exceptions
		const message = error instanceof Error ? error.message : 'Network error';

		if (!suppressErrors) {
			console.error('API Request failed:', message);
		}

		return {
			error: {
				status: 0,
				data: null,
				message
			}
		};
	}
}

/**
 * HTTP method wrappers
 */
export const api = {
	/**
	 * GET request
	 * @param endpoint API endpoint
	 * @param options Fetch options
	 * @returns Promise resolving to the API response
	 */
	get: <T>(endpoint: string, options?: RequestInit & ApiOptions) =>
		apiRequest<T>(endpoint, { method: 'GET', ...options }),

	/**
	 * POST request
	 * @param endpoint API endpoint
	 * @param data Request body data
	 * @param options Fetch options
	 * @returns Promise resolving to the API response
	 */
	post: <T>(endpoint: string, data?: any, options?: RequestInit & ApiOptions) =>
		apiRequest<T>(endpoint, {
			method: 'POST',
			body: data ? JSON.stringify(data) : undefined,
			...options
		}),

	/**
	 * PUT request
	 * @param endpoint API endpoint
	 * @param data Request body data
	 * @param options Fetch options
	 * @returns Promise resolving to the API response
	 */
	put: <T>(endpoint: string, data?: any, options?: RequestInit & ApiOptions) =>
		apiRequest<T>(endpoint, {
			method: 'PUT',
			body: data ? JSON.stringify(data) : undefined,
			...options
		}),

	/**
	 * PATCH request
	 * @param endpoint API endpoint
	 * @param data Request body data
	 * @param options Fetch options
	 * @returns Promise resolving to the API response
	 */
	patch: <T>(endpoint: string, data?: any, options?: RequestInit & ApiOptions) =>
		apiRequest<T>(endpoint, {
			method: 'PATCH',
			body: data ? JSON.stringify(data) : undefined,
			...options
		}),

	/**
	 * DELETE request
	 * @param endpoint API endpoint
	 * @param options Fetch options
	 * @returns Promise resolving to the API response
	 */
	delete: <T>(endpoint: string, options?: RequestInit & ApiOptions) =>
		apiRequest<T>(endpoint, { method: 'DELETE', ...options }),

	/**
	 * Upload files via multipart/form-data
	 * @param endpoint API endpoint
	 * @param formData FormData object containing files and other data
	 * @param options Fetch options
	 * @returns Promise resolving to the API response
	 */
	upload: <T>(endpoint: string, formData: FormData, options?: RequestInit & ApiOptions) => {
		// Don't set Content-Type header - browser will set it automatically with boundary
		const { headers, ...restOptions } = options || {};

		return apiRequest<T>(endpoint, {
			method: 'POST',
			body: formData,
			headers, // Let browser set Content-Type for multipart/form-data
			...restOptions
		});
	}
};
