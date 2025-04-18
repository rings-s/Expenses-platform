import api from './api';

export default {
	/**
	 * Get all budgets
	 */
	async getBudgets() {
		return api.get('/expenses/budgets/');
	},

	/**
	 * Get budget by ID
	 */
	async getBudget(budgetId) {
		return api.get(`/expenses/budgets/${budgetId}/`);
	},

	/**
	 * Create a new budget
	 */
	async createBudget(budgetData) {
		return api.post('/expenses/budgets/', budgetData);
	},

	/**
	 * Update a budget
	 */
	async updateBudget(budgetId, budgetData) {
		return api.put(`/expenses/budgets/${budgetId}/`, budgetData);
	},

	/**
	 * Delete a budget
	 */
	async deleteBudget(budgetId) {
		return api.delete(`/expenses/budgets/${budgetId}/`);
	},

	/**
	 * Get budget comparison data
	 */
	async getBudgetComparison(params = { period: 'current_month', currency: 'USD' }) {
		return api.get('/expenses/analytics/budget-comparison/', params);
	}
};
