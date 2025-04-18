import api from './api';

export default {
	/**
	 * Get all categories
	 */
	async getCategories() {
		return api.get('/expenses/categories/');
	},

	/**
	 * Get category by ID
	 */
	async getCategory(categoryId) {
		return api.get(`/expenses/categories/${categoryId}/`);
	},

	/**
	 * Create a new category
	 */
	async createCategory(categoryData) {
		return api.post('/expenses/categories/', categoryData);
	},

	/**
	 * Update a category
	 */
	async updateCategory(categoryId, categoryData) {
		return api.put(`/expenses/categories/${categoryId}/`, categoryData);
	},

	/**
	 * Delete a category
	 */
	async deleteCategory(categoryId) {
		return api.delete(`/expenses/categories/${categoryId}/`);
	}
};
