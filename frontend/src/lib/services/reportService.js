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

			// Determine analytics endpoint based on report type
			let analyticsData;
			let params = {};

			// Parse parameters if they exist
			if (report.parameters) {
				try {
					if (typeof report.parameters === 'string') {
						params = JSON.parse(report.parameters);
					} else {
						params = report.parameters;
					}
				} catch (e) {
					console.warn('Failed to parse report parameters:', e);
					params = {};
				}
			}

			// Add date filters if they exist
			if (report.start_date) params.start_date = report.start_date;
			if (report.end_date) params.end_date = report.end_date;

			// Load appropriate data based on report type
			switch (report.report_type) {
				case 'expense_summary':
				case 'summary':
					analyticsData = await this.getExpenseSummary(params);
					break;
				case 'expenses_by_category':
				case 'by_category':
					analyticsData = await this.getExpensesByCategory({
						...params,
						chart_type: report.chart_type || 'pie'
					});
					break;
				case 'expenses_over_time':
				case 'trends':
					analyticsData = await this.getExpensesTimeSeries({
						...params,
						chart_type: report.chart_type || 'line'
					});
					break;
				case 'expense_heatmap':
				case 'heatmap':
					analyticsData = await this.getExpenseHeatmap({
						year: params.year || new Date().getFullYear()
					});
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
			// Ensure correct data format for API
			const dataToSend = {
				...reportData,
				// Make sure parameters is properly formatted
				parameters: reportData.parameters || {},
				// Ensure categories is an array
				categories: reportData.categories || []
			};

			console.log('Sending report data to API:', dataToSend);

			// Make the API call
			const response = await api.post('/expenses/reports/', dataToSend);
			return response;
		} catch (error) {
			console.error('Error creating report:', error);

			if (error.response) {
				try {
					const errorText = await error.response.text();
					console.error('Server error response:', errorText);

					try {
						const errorData = JSON.parse(errorText);
						throw new Error(errorData.detail || JSON.stringify(errorData));
					} catch (parseError) {
						throw new Error(errorText || 'Failed to create report');
					}
				} catch (e) {
					throw error;
				}
			}
			throw error;
		}
	},

	/**
	 * Update an existing report
	 */
	async updateReport(reportId, reportData) {
		try {
			// Ensure correct data format
			const dataToSend = {
				...reportData,
				parameters: reportData.parameters || {},
				categories: reportData.categories || []
			};

			return await api.put(`/expenses/reports/${reportId}/`, dataToSend);
		} catch (error) {
			console.error(`Error updating report ${reportId}:`, error);
			throw error;
		}
	},

	/**
	 * Delete a report
	 */
	async deleteReport(reportId) {
		try {
			return await api.delete(`/expenses/reports/${reportId}/`);
		} catch (error) {
			console.error(`Error deleting report ${reportId}:`, error);
			throw error;
		}
	},

	/**
	 * Export chart as image
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
				const errorText = await response.text();
				console.error('Server error response:', errorText);

				let errorMessage = 'Failed to export chart';
				try {
					const errorData = JSON.parse(errorText);
					errorMessage = errorData.detail || errorMessage;
				} catch (e) {
					errorMessage = errorText || errorMessage;
				}
				throw new Error(errorMessage);
			}

			return await response.blob();
		} catch (error) {
			console.error('Chart export error:', error);
			throw error;
		}
	},

	/**
	 * Get expense summary data
	 */
	async getExpenseSummary(params = {}) {
		try {
			return await api.get('/expenses/analytics/summary/', params);
		} catch (error) {
			console.error('Error fetching expense summary:', error);
			throw error;
		}
	},

	/**
	 * Get expenses by category data
	 */
	async getExpensesByCategory(params = {}) {
		try {
			return await api.get('/expenses/analytics/by-category/', params);
		} catch (error) {
			console.error('Error fetching expenses by category:', error);
			throw error;
		}
	},

	/**
	 * Get expenses time series data
	 */
	async getExpensesTimeSeries(params = {}) {
		try {
			return await api.get('/expenses/analytics/time-series/', params);
		} catch (error) {
			console.error('Error fetching expenses time series:', error);
			throw error;
		}
	},

	/**
	 * Get expense heatmap data
	 */
	async getExpenseHeatmap(params = { year: new Date().getFullYear() }) {
		try {
			return await api.get('/expenses/analytics/heatmap/', params);
		} catch (error) {
			console.error('Error fetching expense heatmap:', error);
			throw error;
		}
	},

	/**
	 * Get budget comparison data
	 */
	async getBudgetComparison(params = {}) {
		try {
			return await api.get('/expenses/analytics/budget-comparison/', params);
		} catch (error) {
			console.error('Error fetching budget comparison:', error);
			throw error;
		}
	}
};
