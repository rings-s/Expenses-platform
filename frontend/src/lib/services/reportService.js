import api from './api';

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
	 * Get report by ID
	 */
	async getReport(reportId) {
		try {
			return await api.get(`/expenses/reports/${reportId}/`);
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
			// Ensure parameters are stringified if they're an object
			if (reportData.parameters && typeof reportData.parameters !== 'string') {
				reportData.parameters = JSON.stringify(reportData.parameters);
			}

			// Ensure categories is an array
			if (!reportData.categories) {
				reportData.categories = [];
			}

			const response = await api.post('/expenses/reports/', reportData);
			return response;
		} catch (error) {
			console.error('Error creating report:', error);

			// Try to extract meaningful error message
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
	 * Update a report
	 */
	async updateReport(reportId, reportData) {
		try {
			// Ensure parameters are stringified if they're an object
			if (reportData.parameters && typeof reportData.parameters !== 'string') {
				reportData.parameters = JSON.stringify(reportData.parameters);
			}

			// Ensure categories is an array
			if (!reportData.categories) {
				reportData.categories = [];
			}

			return await api.put(`/expenses/reports/${reportId}/`, reportData);
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
	 * Get expense summary
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
	 * Get expenses by category
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
	 * Get expenses time series
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
	 * Get expense heatmap
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
	 * Export chart as image
	 */
	/**
	 * Export chart as image
	 */
	async exportChart(chartData, maxRetries = 2) {
		const fetchWithTimeout = async (url, options, timeout = 10000) => {
			const controller = new AbortController();
			const id = setTimeout(() => controller.abort(), timeout);

			try {
				const response = await fetch(url, {
					...options,
					signal: controller.signal
				});
				clearTimeout(id);
				return response;
			} catch (error) {
				clearTimeout(id);
				if (error.name === 'AbortError') {
					throw new Error('Request timed out');
				}
				throw error;
			}
		};

		const attemptExport = async (retriesLeft) => {
			try {
				// Ensure the chart data starts with the correct prefix
				const validChartData = chartData.startsWith('data:image/png;base64,')
					? chartData
					: `data:image/png;base64,${chartData}`;

				const response = await fetchWithTimeout(`${api.API_BASE_URL}/expenses/export/chart/`, {
					method: 'POST',
					headers: {
						...api.getHeaders(),
						'Content-Type': 'application/json'
					},
					body: JSON.stringify({ chart_data: validChartData })
				});

				if (!response.ok) {
					// Try to parse error response
					const errorData = await response.json().catch(() => ({}));
					throw new Error(errorData.detail || 'Failed to export chart');
				}

				return response.blob();
			} catch (error) {
				if (
					retriesLeft > 0 &&
					(error.message.includes('network') || error.message.includes('timeout'))
				) {
					console.warn(`Retrying chart export, ${retriesLeft} attempts left`);
					return attemptExport(retriesLeft - 1);
				}
				throw error;
			}
		};

		try {
			return await attemptExport(maxRetries);
		} catch (error) {
			console.error('Chart export error:', error);
			throw error;
		}
	}
};
