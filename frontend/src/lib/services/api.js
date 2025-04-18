const API_BASE_URL = 'http://localhost:8000/api';
const browser = typeof window !== 'undefined';

/**
 * Base API service for making HTTP requests
 */
export default {
	/**
	 * Get auth headers with JWT token
	 */
	getHeaders() {
		const token = localStorage.getItem('token');
		const headers = {
			'Content-Type': 'application/json'
		};

		if (token) {
			headers['Authorization'] = `Bearer ${token}`;
		}

		return headers;
	},

	/**
	 * Make a GET request
	 */
	async get(endpoint, params = {}) {
		const url = new URL(`${API_BASE_URL}${endpoint}`);

		// Add query parameters
		Object.keys(params).forEach((key) => {
			if (params[key] !== undefined && params[key] !== null) {
				url.searchParams.append(key, params[key]);
			}
		});

		const response = await fetch(url, {
			method: 'GET',
			headers: this.getHeaders()
		});

		if (!response.ok) {
			const error = await response.json().catch(() => ({}));
			throw new Error(error.detail || 'Network response was not ok');
		}

		return response.json();
	},

	/**
	 * Make a POST request
	 */
	async post(endpoint, data = {}) {
		const response = await fetch(`${API_BASE_URL}${endpoint}`, {
			method: 'POST',
			headers: this.getHeaders(),
			body: JSON.stringify(data)
		});

		if (!response.ok) {
			const error = await response.json().catch(() => ({}));
			throw new Error(error.detail || 'Network response was not ok');
		}

		return response.json();
	},

	/**
	 * Make a PUT request
	 */
	async put(endpoint, data = {}) {
		const response = await fetch(`${API_BASE_URL}${endpoint}`, {
			method: 'PUT',
			headers: this.getHeaders(),
			body: JSON.stringify(data)
		});

		if (!response.ok) {
			const error = await response.json().catch(() => ({}));
			throw new Error(error.detail || 'Network response was not ok');
		}

		return response.json();
	},

	/**
	 * Make a DELETE request
	 */
	async delete(endpoint) {
		const response = await fetch(`${API_BASE_URL}${endpoint}`, {
			method: 'DELETE',
			headers: this.getHeaders()
		});

		if (!response.ok) {
			const error = await response.json().catch(() => ({}));
			throw new Error(error.detail || 'Network response was not ok');
		}

		return true;
	}
};
