import { browser } from '$app/environment';
import { authStore } from '$lib/stores/auth';
import { goto } from '$app/navigation';
import { shouldRefreshToken, refreshAccessToken } from '$lib/utils/token';
import type { ApiResponse, ApiError } from '$lib/types/api.types';

// Base API URL - can be environment-specific
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

/**
 * Generic API request function with automatic token handling
 * @param endpoint API endpoint
 * @param options Fetch options
 * @returns Promise resolving to the API response
 */
export async function apiRequest<T>(
	endpoint: string,
	options: RequestInit = {}
): Promise<ApiResponse<T>> {
	// Ensure the endpoint has the correct format
	const url = endpoint.startsWith('http') ? endpoint : `${API_URL}${endpoint}`;

	console.log(`Making API request to: ${url}`);

	try {
		// Get current auth state
		let tokens = null;
		let isAuthenticated = false;

		const unsubscribe = authStore.subscribe((state) => {
			tokens = state.tokens;
			isAuthenticated = state.isAuthenticated;
		});
		unsubscribe();

		// Prepare the request headers
		const headers: HeadersInit = {
			'Content-Type': 'application/json',
			...options.headers
		};

		// Add auth header if authenticated
		if (isAuthenticated && tokens?.access) {
			// Check if token is about to expire and refresh if needed
			if (shouldRefreshToken(tokens.access)) {
				if (tokens.refresh) {
					const refreshed = await refreshAccessToken(tokens.refresh);
					// Get updated token after refresh
					if (refreshed) {
						const unsubscribe = authStore.subscribe((state) => {
							tokens = state.tokens;
						});
						unsubscribe();
					}
				}
			}

			// Add the authorization header with the (possibly refreshed) token
			if (tokens?.access) {
				headers['Authorization'] = `Bearer ${tokens.access}`;
			}
		}

		// Make the initial request
		let response = await fetch(url, { ...options, headers });

		// Handle 401 Unauthorized - Try to refresh token and retry
		if (response.status === 401 && isAuthenticated && tokens?.refresh) {
			console.log('Token expired, attempting to refresh...');

			// Try to refresh the token
			const refreshed = await refreshAccessToken(tokens.refresh);

			if (refreshed) {
				// Get the new token
				const unsubscribe = authStore.subscribe((state) => {
					tokens = state.tokens;
				});
				unsubscribe();

				// Update the auth header with new token
				headers['Authorization'] = `Bearer ${tokens!.access}`;

				console.log('Token refreshed, retrying request...');

				// Retry the request with new token
				response = await fetch(url, { ...options, headers });
			} else {
				// If refresh failed, force logout
				console.log('Token refresh failed, logging out...');
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
			console.error(`API Error (${response.status}):`, data);

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
					message: data.detail || 'An error occurred'
				}
			};
		}

		// Return successful response
		return { data: data as T };
	} catch (error) {
		// Handle network errors or other exceptions
		const message = error instanceof Error ? error.message : 'Network error';
		console.error('API Request failed:', message);
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
	get: <T>(endpoint: string, options?: RequestInit) =>
		apiRequest<T>(endpoint, { method: 'GET', ...options }),

	/**
	 * POST request
	 * @param endpoint API endpoint
	 * @param data Request body data
	 * @param options Fetch options
	 * @returns Promise resolving to the API response
	 */
	post: <T>(endpoint: string, data?: any, options?: RequestInit) =>
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
	put: <T>(endpoint: string, data?: any, options?: RequestInit) =>
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
	patch: <T>(endpoint: string, data?: any, options?: RequestInit) =>
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
	delete: <T>(endpoint: string, options?: RequestInit) =>
		apiRequest<T>(endpoint, { method: 'DELETE', ...options })
};
