import { writable } from 'svelte/store';
import reportService from '../services/reportService';

function createReportStore() {
	const { subscribe, set, update } = writable({
		// Core report data collections
		reports: [],
		currentReport: null,

		// Analytics data
		summary: null,
		categoryData: [],
		timeSeriesData: [],
		heatmapData: null,

		// Chart and visualization data
		chart: null,
		reportData: null,

		// State management
		loading: false,
		error: null
	});

	return {
		subscribe,

		/**
		 * Load all saved reports
		 */
		loadReports: async () => {
			try {
				update((state) => ({ ...state, loading: true }));

				const reports = await reportService.getReports();

				update((state) => ({
					...state,
					reports,
					loading: false,
					error: null
				}));

				return reports;
			} catch (error) {
				update((state) => ({
					...state,
					loading: false,
					error: error.message
				}));
				throw error;
			}
		},

		/**
		 * Load a specific report by ID
		 */
		loadReportById: async (reportId) => {
			try {
				update((state) => ({ ...state, loading: true }));

				const { report, data } = await reportService.getReportById(reportId);

				update((state) => ({
					...state,
					currentReport: report,
					reportData: data?.data || null,
					chart: data?.chart || null,
					loading: false,
					error: null
				}));

				return { report, data };
			} catch (error) {
				update((state) => ({
					...state,
					loading: false,
					error: error.message
				}));
				throw error;
			}
		},

		/**
		 * Load Expense Summary
		 */
		loadExpenseSummary: async (params = {}) => {
			try {
				update((state) => ({ ...state, loading: true }));

				const response = await reportService.getExpenseSummary(params);

				update((state) => ({
					...state,
					summary: response.summary,
					chart: response.chart || null,
					loading: false,
					error: null
				}));

				return response;
			} catch (error) {
				update((state) => ({
					...state,
					summary: null,
					loading: false,
					error: error.message
				}));
				throw error;
			}
		},

		/**
		 * Load Expenses by Category
		 */
		loadExpensesByCategory: async (params = {}) => {
			try {
				update((state) => ({ ...state, loading: true }));

				const response = await reportService.getExpensesByCategory(params);

				update((state) => ({
					...state,
					categoryData: response.data || [],
					chart: response.chart || null,
					loading: false,
					error: null
				}));

				return response;
			} catch (error) {
				update((state) => ({
					...state,
					categoryData: [],
					loading: false,
					error: error.message
				}));
				throw error;
			}
		},

		/**
		 * Load Expenses Time Series
		 */
		loadExpensesTimeSeries: async (params = {}) => {
			try {
				update((state) => ({ ...state, loading: true }));

				const response = await reportService.getExpensesTimeSeries(params);

				update((state) => ({
					...state,
					timeSeriesData: response.data || [],
					chart: response.chart || null,
					loading: false,
					error: null
				}));

				return response;
			} catch (error) {
				update((state) => ({
					...state,
					timeSeriesData: [],
					loading: false,
					error: error.message
				}));
				throw error;
			}
		},

		/**
		 * Load Expense Heatmap
		 */
		loadExpenseHeatmap: async (params = {}) => {
			try {
				update((state) => ({ ...state, loading: true }));

				const response = await reportService.getExpenseHeatmap(params);

				update((state) => ({
					...state,
					heatmapData: response.chart || null,
					loading: false,
					error: null
				}));

				return response;
			} catch (error) {
				update((state) => ({
					...state,
					heatmapData: null,
					loading: false,
					error: error.message
				}));
				throw error;
			}
		},

		/**
		 * Create a new report
		 */
		createReport: async (reportData) => {
			try {
				update((state) => ({ ...state, loading: true }));

				const newReport = await reportService.createReport(reportData);

				update((state) => ({
					...state,
					reports: [...state.reports, newReport],
					loading: false,
					error: null
				}));

				return newReport;
			} catch (error) {
				update((state) => ({
					...state,
					loading: false,
					error: error.message
				}));
				throw error;
			}
		},

		/**
		 * Update an existing report
		 */
		updateReport: async (reportId, reportData) => {
			try {
				update((state) => ({ ...state, loading: true }));

				const updatedReport = await reportService.updateReport(reportId, reportData);

				update((state) => ({
					...state,
					reports: state.reports.map((report) => (report.id === reportId ? updatedReport : report)),
					loading: false,
					error: null
				}));

				return updatedReport;
			} catch (error) {
				update((state) => ({
					...state,
					loading: false,
					error: error.message
				}));
				throw error;
			}
		},

		/**
		 * Delete a report
		 */
		deleteReport: async (reportId) => {
			try {
				update((state) => ({ ...state, loading: true }));

				await reportService.deleteReport(reportId);

				update((state) => ({
					...state,
					reports: state.reports.filter((report) => report.id !== reportId),
					loading: false,
					error: null
				}));
			} catch (error) {
				update((state) => ({
					...state,
					loading: false,
					error: error.message
				}));
				throw error;
			}
		},

		/**
		 * Export chart
		 */
		exportChart: async (chartData) => {
			try {
				update((state) => ({ ...state, loading: true }));

				const blob = await reportService.exportChart(chartData);

				update((state) => ({
					...state,
					loading: false,
					error: null
				}));

				return blob;
			} catch (error) {
				update((state) => ({
					...state,
					loading: false,
					error: error.message
				}));
				throw error;
			}
		},

		/**
		 * Clear any errors
		 */
		clearError: () => {
			update((state) => ({ ...state, error: null }));
		},

		/**
		 * Reset store to initial state
		 */
		reset: () => {
			set({
				reports: [],
				currentReport: null,
				summary: null,
				categoryData: [],
				timeSeriesData: [],
				heatmapData: null,
				chart: null,
				reportData: null,
				loading: false,
				error: null
			});
		}
	};
}

export const reportStore = createReportStore();
