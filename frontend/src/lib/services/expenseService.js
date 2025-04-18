import api from './api';

export default {
	/**
	 * Get all expenses with optional filters
	 */
	async getExpenses(filters = {}) {
		return api.get('/expenses/expenses/', filters);
	},

	/**
	 * Get expense by ID
	 */
	async getExpense(expenseId) {
		return api.get(`/expenses/expenses/${expenseId}/`);
	},

	/**
	 * Create a new expense
	 */
	async createExpense(expenseData) {
		return api.post('/expenses/expenses/', expenseData);
	},

	/**
	 * Update an expense
	 */
	async updateExpense(expenseId, expenseData) {
		return api.put(`/expenses/expenses/${expenseId}/`, expenseData);
	},

	/**
	 * Delete an expense
	 */
	async deleteExpense(expenseId) {
		return api.delete(`/expenses/expenses/${expenseId}/`);
	},

	/**
	 * Export expenses as CSV
	 */
	async exportExpenses(filters = {}) {
		const url = new URL(`${api.API_BASE_URL}/expenses/export/csv/`);

		// Add query parameters
		Object.keys(filters).forEach((key) => {
			if (filters[key] !== undefined && filters[key] !== null) {
				url.searchParams.append(key, filters[key]);
			}
		});

		const response = await fetch(url, {
			method: 'GET',
			headers: api.getHeaders()
		});

		if (!response.ok) {
			throw new Error('Failed to export expenses');
		}

		return response.blob();
	}
};
