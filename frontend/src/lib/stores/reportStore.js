import { writable } from 'svelte/store';
import reportService from '../services/reportService';

function createReportStore() {
	const { subscribe, set, update } = writable({
		reports: [],
		summary: null,
		categoryData: [],
		timeSeriesData: [],
		heatmapData: null,
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
		 * Load expense summary
		 */
		loadExpenseSummary: async (params = {}) => {
			try {
				update((state) => ({ ...state, loading: true }));

				const response = await reportService.getExpenseSummary(params);

				update((state) => ({
					...state,
					summary: response.summary,
					loading: false,
					error: null
				}));

				return response;
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
		 * Load expenses by category
		 */
		loadExpensesByCategory: async (params = {}) => {
			try {
				update((state) => ({ ...state, loading: true }));

				const response = await reportService.getExpensesByCategory(params);

				update((state) => ({
					...state,
					categoryData: response.data,
					loading: false,
					error: null
				}));

				return response;
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
		 * Load expenses time series
		 */
		loadExpensesTimeSeries: async (params = {}) => {
			try {
				update((state) => ({ ...state, loading: true }));

				const response = await reportService.getExpensesTimeSeries(params);

				update((state) => ({
					...state,
					timeSeriesData: response.data,
					loading: false,
					error: null
				}));

				return response;
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
		 * Load expense heatmap
		 */
		loadExpenseHeatmap: async (params = {}) => {
			try {
				update((state) => ({ ...state, loading: true }));

				const response = await reportService.getExpenseHeatmap(params);

				update((state) => ({
					...state,
					heatmapData: response.chart,
					loading: false,
					error: null
				}));

				return response;
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
		 * Update a report
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
		 * Export chart as image
		 */
		exportChart: async (chartData) => {
			try {
				update((state) => ({ ...state, loading: true }));

				const response = await reportService.exportChart(chartData);

				update((state) => ({
					...state,
					loading: false,
					error: null
				}));

				return response;
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
		 * Clear any report errors
		 */
		clearError: () => {
			update((state) => ({ ...state, error: null }));
		}
	};
}

export const reportStore = createReportStore();
