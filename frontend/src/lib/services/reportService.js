import api from './api';

const API_BASE_URL = 'http://localhost:8000/api';

export default {
	/**
	 * Get all saved reports
	 */
	async getReports() {
		try {
			return await api.get('/expenses/reports/');
		} catch (error) {
			console.error('Error fetching reports:', error);
			throw error;
		}
	},

	/**
	 * Get a specific report by ID with detailed data
	 */
	async getReportById(reportId) {
		try {
			// Fetch report details
			const report = await api.get(`/expenses/reports/${reportId}/`);

			// Parse parameters
			const params = report.parameters ? JSON.parse(report.parameters) : {};

			// Determine analytics endpoint based on report type
			let analyticsData;
			switch (report.report_type) {
				case 'expense_summary':
				case 'summary':
					analyticsData = await this.getExpenseSummary(params);
					break;
				case 'expenses_by_category':
				case 'by_category':
					analyticsData = await this.getExpensesByCategory(params);
					break;
				case 'expenses_over_time':
				case 'trends':
					analyticsData = await this.getExpensesTimeSeries(params);
					break;
				case 'expense_heatmap':
				case 'heatmap':
					analyticsData = await this.getExpenseHeatmap(params);
					break;
				default:
					analyticsData = null;
			}

			return {
				report,
				data: analyticsData
			};
		} catch (error) {
			console.error(`Error fetching report ${reportId}:`, error);
			throw error;
		}
	},

	/**
	 * Create a new report
	 */
	async createReport(reportData) {
		try {
			// Ensure parameters are stringified
			if (reportData.parameters && typeof reportData.parameters !== 'string') {
				reportData.parameters = JSON.stringify(reportData.parameters);
			}

			// Ensure categories is an array
			reportData.categories = reportData.categories || [];

			const response = await api.post('/expenses/reports/', reportData);
			return response;
		} catch (error) {
			console.error('Error creating report:', error);

			// Enhanced error handling
			if (error.response) {
				try {
					const errorDetails = await error.response.json();
					throw new Error(errorDetails.detail || JSON.stringify(errorDetails));
				} catch (parseError) {
					throw error;
				}
			}
			throw error;
		}
	},

	/**
	 * Export chart as image with robust error handling
	 */
	async exportChart(chartData) {
		try {
			// Ensure correct base64 prefix
			const validChartData = chartData.startsWith('data:image/png;base64,')
				? chartData
				: `data:image/png;base64,${chartData}`;

			const response = await fetch(`${API_BASE_URL}/expenses/export/chart/`, {
				method: 'POST',
				headers: {
					...api.getHeaders(),
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ chart_data: validChartData })
			});

			if (!response.ok) {
				const errorData = await response.json().catch(() => ({}));
				throw new Error(errorData.detail || 'Failed to export chart');
			}

			return await response.blob();
		} catch (error) {
			console.error('Chart export error:', error);
			throw error;
		}
	},

	// Other methods remain the same as in the original implementation
	async getExpenseSummary(params = {}) {
		try {
			return await api.get('/expenses/analytics/summary/', params);
		} catch (error) {
			console.error('Error fetching expense summary:', error);
			throw error;
		}
	},

	async getExpensesByCategory(params = {}) {
		try {
			return await api.get('/expenses/analytics/by-category/', params);
		} catch (error) {
			console.error('Error fetching expenses by category:', error);
			throw error;
		}
	},

	async getExpensesTimeSeries(params = {}) {
		try {
			return await api.get('/expenses/analytics/time-series/', params);
		} catch (error) {
			console.error('Error fetching expenses time series:', error);
			throw error;
		}
	},

	async getExpenseHeatmap(params = { year: new Date().getFullYear() }) {
		try {
			return await api.get('/expenses/analytics/heatmap/', params);
		} catch (error) {
			console.error('Error fetching expense heatmap:', error);
			throw error;
		}
	},

	// Delete and update methods remain the same
	async deleteReport(reportId) {
		try {
			return await api.delete(`/expenses/reports/${reportId}/`);
		} catch (error) {
			console.error(`Error deleting report ${reportId}:`, error);
			throw error;
		}
	},

	async updateReport(reportId, reportData) {
		try {
			// Ensure parameters are stringified
			if (reportData.parameters && typeof reportData.parameters !== 'string') {
				reportData.parameters = JSON.stringify(reportData.parameters);
			}

			// Ensure categories is an array
			reportData.categories = reportData.categories || [];

			return await api.put(`/expenses/reports/${reportId}/`, reportData);
		} catch (error) {
			console.error(`Error updating report ${reportId}:`, error);
			throw error;
		}
	}
};
