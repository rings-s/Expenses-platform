export interface ApiError {
	status: number;
	data: any;
	message: string;
}

export interface ApiResponse<T> {
	data?: T;
	error?: ApiError;
}

export interface PaginatedResponse<T> {
	count: number;
	next: string | null;
	previous: string | null;
	results: T[];
}
