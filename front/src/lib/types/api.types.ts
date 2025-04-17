/**
 * API Type Definitions
 *
 * Comprehensive type definitions for API interactions
 */

/**
 * API Error structure
 * Represents normalized error responses from the API
 */
export interface ApiError {
	/** HTTP status code (0 for network errors) */
	status: number;

	/** Raw error data from the response */
	data: any;

	/** User-friendly error message */
	message: string;

	/** Field-specific validation errors */
	fieldErrors?: Record<string, string[]>;
}

/**
 * API Response wrapper
 * Generic type for all API responses
 */
export interface ApiResponse<T> {
	/** Success response data */
	data?: T;

	/** Error response (if request failed) */
	error?: ApiError;
}

/**
 * API Options
 * Extended options for API requests beyond standard fetch RequestInit
 */
export interface ApiOptions {
	/** Skip adding authorization header even if user is authenticated */
	skipAuth?: boolean;

	/** Whether to retry requests that fail with 401 Unauthorized after token refresh */
	retryOnUnauthorized?: boolean;

	/** Suppress console error messages */
	suppressErrors?: boolean;
}

/**
 * Paginated Response
 * Standard structure for paginated API responses
 */
export interface PaginatedResponse<T> {
	/** Total count of items across all pages */
	count: number;

	/** URL for the next page (null if on last page) */
	next: string | null;

	/** URL for the previous page (null if on first page) */
	previous: string | null;

	/** Items on the current page */
	results: T[];

	/** Current page number (1-based) */
	current_page?: number;

	/** Total number of pages */
	total_pages?: number;

	/** Items per page */
	page_size?: number;
}

/**
 * API Collection Response
 * For endpoints that return collections without pagination
 */
export interface CollectionResponse<T> {
	/** Array of items */
	results: T[];

	/** Total count of items */
	count: number;
}

/**
 * Filter Parameters
 * Common filter parameters used across multiple endpoints
 */
export interface FilterParams {
	/** Search query string */
	search?: string;

	/** Field to order by (prefix with - for descending) */
	ordering?: string;

	/** Page number (1-based) */
	page?: number;

	/** Number of items per page */
	page_size?: number;

	/** Start date filter (ISO format) */
	start_date?: string;

	/** End date filter (ISO format) */
	end_date?: string;

	/** Filter by category ID */
	category_id?: string;

	/** Filter by minimum amount */
	min_amount?: number;

	/** Filter by maximum amount */
	max_amount?: number;

	/** Other dynamic filters */
	[key: string]: any;
}

/**
 * Sort Direction
 */
export type SortDirection = 'asc' | 'desc';

/**
 * Sort Option
 * Structure for sort options in UI
 */
export interface SortOption {
	/** Label for display */
	label: string;

	/** Value for API parameter */
	value: string;

	/** Default direction */
	defaultDirection?: SortDirection;
}

/**
 * API Error Code
 * Standard error codes used across the API
 */
export enum ApiErrorCode {
	VALIDATION_ERROR = 'validation_error',
	AUTHENTICATION_ERROR = 'authentication_error',
	PERMISSION_DENIED = 'permission_denied',
	NOT_FOUND = 'not_found',
	METHOD_NOT_ALLOWED = 'method_not_allowed',
	CONFLICT = 'conflict',
	SERVER_ERROR = 'server_error',
	SERVICE_UNAVAILABLE = 'service_unavailable'
}
