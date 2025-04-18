import api from './api';

export default {
	/**
	 * Get all saved reports
	 */
	async getReports() {
		return api.get('/expenses/reports/');
	},

	/**
	 * Get report by ID
	 */
	async getReport(reportId) {
		return api.get(`/expenses/reports/${reportId}/`);
	},

	/**
	 * Create a new report
	 */
	async createReport(reportData) {
		return api.post('/expenses/reports/', reportData);
	},

	/**
	 * Update a report
	 */
	async updateReport(reportId, reportData) {
		return api.put(`/expenses/reports/${reportId}/`, reportData);
	},

	/**
	 * Delete a report
	 */
	async deleteReport(reportId) {
		return api.delete(`/expenses/reports/${reportId}/`);
	},

	/**
	 * Get expense summary
	 */
	async getExpenseSummary(params = {}) {
		return api.get('/expenses/analytics/summary/', params);
	},

	/**
	 * Get expenses by category
	 */
	async getExpensesByCategory(params = {}) {
		return api.get('/expenses/analytics/by-category/', params);
	},

	/**
	 * Get expenses time series
	 */
	async getExpensesTimeSeries(params = {}) {
		return api.get('/expenses/analytics/time-series/', params);
	},

	/**
	 * Get expense heatmap
	 */
	async getExpenseHeatmap(params = { year: new Date().getFullYear() }) {
		return api.get('/expenses/analytics/heatmap/', params);
	},

	/**
	 * Export chart as image
	 */

	async exportChart(chartData) {
		try {
			const response = await fetch(`${api.API_BASE_URL}/expenses/export/chart/`, {
				method: 'POST',
				headers: api.getHeaders(),
				body: JSON.stringify({ chart_data: chartData })
			});

			if (!response.ok) {
				const errorData = await response.json().catch(() => ({}));
				throw new Error(errorData.detail || 'Failed to export chart');
			}

			return response.blob();
		} catch (error) {
			console.error('Chart export error:', error);
			throw error;
		}
	}
};
