/**
 * Expenses Service
 *
 * Service for managing expense data through the API.
 * Handles all expense-related operations including:
 * - Fetching expenses with filtering and pagination
 * - Creating, updating, and deleting expenses
 * - Fetching expense summaries and analytics
 * - Generating reports and exports
 */

import { api } from './api';
import { expenseStore } from '$lib/stores/expenses';
import { toastStore } from '$lib/stores/toast';
import { cleanObject } from '$lib/utils/helpers';
import type {
	Expense,
	ExpenseFilter,
	ExpenseFormData,
	Currency,
	TimePeriod,
	ExpenseSummary,
	CategoryExpenseData,
	TimeSeriesData,
	BudgetComparisonItem,
	GroupByOption
} from '$lib/types/expenses.types';
import type { PaginatedResponse } from '$lib/types/api.types';

// Get API base URL from environment if available, or use default
const API_BASE_URL = typeof window !== 'undefined' && window.__env__?.API_URL
    ? window.__env__.API_URL
    : '/api';

/**
 * Expenses Service
 * Service for managing expense data through the API
 */
export const expensesService = {
	/**
	 * Fetch expenses with optional filtering and pagination
	 *
	 * @param filter Filter parameters
	 * @param page Page number (1-based)
	 * @param pageSize Items per page
	 * @param sortField Field to sort by
	 * @param sortDirection Sort direction (asc/desc)
	 * @returns Promise resolving to paginated expenses
	 */
	async getExpenses(
		filter: ExpenseFilter = {},
		page: number = 1,
		pageSize: number = 10,
		sortField: string = 'date',
		sortDirection: 'asc' | 'desc' = 'desc'
	): Promise<PaginatedResponse<Expense>> {
		expenseStore.setLoading(true);

		try {
			// Clean the filter (remove undefined/null values)
			const cleanedFilter = cleanObject(filter);

			// Build query parameters
			const params = new URLSearchParams({
				page: page.toString(),
				page_size: pageSize.toString(),
				ordering: sortDirection === 'desc' ? `-${sortField}` : sortField,
				...(cleanedFilter as Record<string, string>)
			});

			const response = await api.get<PaginatedResponse<Expense>>(
				`/expenses/expenses/?${params.toString()}`
			);

			if (response.error) {
				expenseStore.setError(response.error.message);
				throw new Error(response.error.message);
			}

			if (response.data) {
				// Update store with fetched expenses
				expenseStore.setExpenses(response.data);
				return response.data;
			}

			// If no data, return empty paginated response
			return {
				count: 0,
				next: null,
				previous: null,
				results: []
			};
		} catch (error) {
			const message = error instanceof Error ? error.message : 'Failed to fetch expenses';
			expenseStore.setError(message);
			throw error;
		} finally {
			expenseStore.setLoading(false);
		}
	},

	/**
	 * Get a single expense by ID
	 *
	 * @param id Expense ID
	 * @returns Promise resolving to expense
	 */
	async getExpense(id: string): Promise<Expense> {
		try {
			const response = await api.get<Expense>(`/expenses/expenses/${id}/`);

			if (response.error) {
				throw new Error(response.error.message);
			}

			if (!response.data) {
				throw new Error('Expense not found');
			}

			// Update selected expense in store
			expenseStore.selectExpense(response.data);

			return response.data;
		} catch (error) {
			const message = error instanceof Error ? error.message : 'Failed to fetch expense';
			toastStore.error(message);
			throw error;
		}
	},

	/**
	 * Create a new expense
	 *
	 * @param expenseData Expense data
	 * @returns Promise resolving to created expense
	 */
	async createExpense(expenseData: ExpenseFormData): Promise<Expense> {
		expenseStore.setCreating(true);

		try {
			// Handle file upload if receipt image is a File
			let formData: FormData | ExpenseFormData = expenseData;

			if (expenseData.receipt_image instanceof File) {
				formData = new FormData();
				Object.entries(expenseData).forEach(([key, value]) => {
					if (value !== undefined && value !== null) {
						if (key === 'receipt_image' && value instanceof File) {
							formData.append(key, value);
						} else {
							formData.append(key, String(value));
						}
					}
				});

				// Make the API request with FormData
				const response = await api.upload<Expense>('/expenses/expenses/', formData);

				if (response.error) {
					throw new Error(response.error.message);
				}

				if (!response.data) {
					throw new Error('Failed to create expense');
				}

				// Update store with new expense
				expenseStore.addExpense(response.data);
				toastStore.success('Expense created successfully');

				return response.data;
			} else {
				// Make the API request with JSON
				const response = await api.post<Expense>('/expenses/expenses/', expenseData);

				if (response.error) {
					throw new Error(response.error.message);
				}

				if (!response.data) {
					throw new Error('Failed to create expense');
				}

				// Update store with new expense
				expenseStore.addExpense(response.data);
				toastStore.success('Expense created successfully');

				return response.data;
			}
		} catch (error) {
			const message = error instanceof Error ? error.message : 'Failed to create expense';
			expenseStore.setError(message);
			toastStore.error(message);
			throw error;
		} finally {
			expenseStore.setCreating(false);
		}
	},

	/**
	 * Update an existing expense
	 *
	 * @param id Expense ID
	 * @param expenseData Updated expense data
	 * @returns Promise resolving to updated expense
	 */
	async updateExpense(id: string, expenseData: Partial<ExpenseFormData>): Promise<Expense> {
		expenseStore.setUpdating(true);

		try {
			// Handle file upload if receipt image is a File
			let formData: FormData | Partial<ExpenseFormData> = expenseData;

			if (expenseData.receipt_image instanceof File) {
				formData = new FormData();
				Object.entries(expenseData).forEach(([key, value]) => {
					if (value !== undefined && value !== null) {
						if (key === 'receipt_image' && value instanceof File) {
							formData.append(key, value);
						} else {
							formData.append(key, String(value));
						}
					}
				});

				// Make the API request with FormData
				const response = await api.upload<Expense>(`/expenses/expenses/${id}/`, formData);

				if (response.error) {
					throw new Error(response.error.message);
				}

				if (!response.data) {
					throw new Error('Failed to update expense');
				}

				// Update store with new expense
				expenseStore.updateExpense(response.data);
				toastStore.success('Expense updated successfully');

				return response.data;
			} else {
				// Make the API request with JSON
				const response = await api.put<Expense>(`/expenses/expenses/${id}/`, expenseData);

				if (response.error) {
					throw new Error(response.error.message);
				}

				if (!response.data) {
					throw new Error('Failed to update expense');
				}

				// Update store with updated expense
				expenseStore.updateExpense(response.data);
				toastStore.success('Expense updated successfully');

				return response.data;
			}
		} catch (error) {
			const message = error instanceof Error ? error.message : 'Failed to update expense';
			expenseStore.setError(message);
			toastStore.error(message);
			throw error;
		} finally {
			expenseStore.setUpdating(false);
		}
	},

	/**
	 * Delete an expense
	 *
	 * @param id Expense ID
	 * @returns Promise resolving to success
	 */
	async deleteExpense(id: string): Promise<boolean> {
		expenseStore.setDeleting(true);

		try {
			const response = await api.delete(`/expenses/expenses/${id}/`);

			if (response.error) {
				throw new Error(response.error.message);
			}

			// Update store by removing expense
			expenseStore.removeExpense(id);
			toastStore.success('Expense deleted successfully');

			return true;
		} catch (error) {
			const message = error instanceof Error ? error.message : 'Failed to delete expense';
			expenseStore.setError(message);
			toastStore.error(message);
			throw error;
		} finally {
			expenseStore.setDeleting(false);
		}
	},

	/**
	 * Get recent expenses for dashboard
	 *
	 * @param limit Number of recent expenses to fetch
	 * @returns Promise resolving to recent expenses
	 */
	async getRecentExpenses(limit: number = 5): Promise<Expense[]> {
		try {
			const response = await api.get<PaginatedResponse<Expense>>(
				`/expenses/expenses/?page=1&page_size=${limit}&ordering=-date`
			);

			if (response.error) {
				throw new Error(response.error.message);
			}

			if (response.data?.results) {
				// Update recent expenses in store
				expenseStore.setRecentExpenses(response.data.results);
				return response.data.results;
			}

			return [];
		} catch (error) {
			console.error('Failed to fetch recent expenses:', error);
			return [];
		}
	},

	/**
	 * Get expense summary statistics
	 *
	 * @param period Time period for summary
	 * @param categoryId Optional category filter
	 * @param currency Optional currency filter
	 * @returns Promise resolving to expense summary
	 */
	async getExpenseSummary(
		period: TimePeriod = 'this_month',
		categoryId?: string,
		currency: Currency = 'USD'
	): Promise<{ summary: ExpenseSummary; chart: string }> {
		try {
			// Build query parameters
			const params = new URLSearchParams({
				period,
				currency
			});

			if (categoryId) {
				params.append('category', categoryId);
			}

			const response = await api.get<{ summary: ExpenseSummary; chart: string }>(
				`/expenses/analytics/summary/?${params.toString()}`
			);

			if (response.error) {
				throw new Error(response.error.message);
			}

			if (!response.data) {
				throw new Error('Failed to fetch expense summary');
			}

			return response.data;
		} catch (error) {
			const message = error instanceof Error ? error.message : 'Failed to fetch expense summary';
			toastStore.error(message);
			throw error;
		}
	},

	/**
	 * Get expenses grouped by category
	 *
	 * @param period Time period for analysis
	 * @param chartType Chart type (pie/bar)
	 * @param currency Currency filter
	 * @returns Promise resolving to category expenses data
	 */
	async getExpensesByCategory(
		period: TimePeriod = 'this_month',
		chartType: 'pie' | 'bar' = 'pie',
		currency: Currency = 'USD'
	): Promise<{ data: CategoryExpenseData[]; chart: string }> {
		try {
			// Build query parameters
			const params = new URLSearchParams({
				period,
				chart_type: chartType,
				currency
			});

			const response = await api.get<{ data: CategoryExpenseData[]; chart: string }>(
				`/expenses/analytics/by-category/?${params.toString()}`
			);

			if (response.error) {
				throw new Error(response.error.message);
			}

			if (!response.data) {
				throw new Error('Failed to fetch category expenses');
			}

			return response.data;
		} catch (error) {
			const message = error instanceof Error ? error.message : 'Failed to fetch category expenses';
			toastStore.error(message);
			throw error;
		}
	},

	/**
	 * Get expenses over time (time series data)
	 *
	 * @param period Time period for analysis
	 * @param groupBy Time grouping (day/week/month/year/auto)
	 * @param chartType Chart type (line/bar)
	 * @param categoryId Optional category filter
	 * @param currency Currency filter
	 * @returns Promise resolving to time series data
	 */
	async getExpensesTimeSeries(
		period: TimePeriod = 'this_month',
		groupBy: GroupByOption = 'auto',
		chartType: 'line' | 'bar' = 'line',
		categoryId?: string,
		currency: Currency = 'USD'
	): Promise<{ data: TimeSeriesData[]; chart: string }> {
		try {
			// Build query parameters
			const params = new URLSearchParams({
				period,
				group_by: groupBy,
				chart_type: chartType,
				currency
			});

			if (categoryId) {
				params.append('category', categoryId);
			}

			const response = await api.get<{ data: TimeSeriesData[]; chart: string }>(
				`/expenses/analytics/time-series/?${params.toString()}`
			);

			if (response.error) {
				throw new Error(response.error.message);
			}

			if (!response.data) {
				throw new Error('Failed to fetch time series data');
			}

			return response.data;
		} catch (error) {
			const message = error instanceof Error ? error.message : 'Failed to fetch time series data';
			toastStore.error(message);
			throw error;
		}
	},

	/**
	 * Get budget vs actual comparison
	 *
	 * @param period Period for comparison ('current_month', 'current_year', etc.)
	 * @param chartType Chart type (bar/pie)
	 * @param currency Currency filter
	 * @returns Promise resolving to budget comparison data
	 */
	async getBudgetComparison(
		period: 'current_month' | 'current_year' = 'current_month',
		chartType: 'bar' | 'pie' = 'bar',
		currency: Currency = 'USD'
	): Promise<{ data: BudgetComparisonItem[]; chart: string }> {
		try {
			// Build query parameters
			const params = new URLSearchParams({
				period,
				chart_type: chartType,
				currency
			});

			const response = await api.get<{ data: BudgetComparisonItem[]; chart: string }>(
				`/expenses/analytics/budget-comparison/?${params.toString()}`
			);

			if (response.error) {
				throw new Error(response.error.message);
			}

			if (!response.data) {
				throw new Error('Failed to fetch budget comparison data');
			}

			return response.data;
		} catch (error) {
			const message = error instanceof Error ? error.message : 'Failed to fetch budget comparison';
			toastStore.error(message);
			throw error;
		}
	},

	/**
	 * Export expenses to CSV
	 *
	 * @param period Time period for export
	 * @param categoryId Optional category filter
	 * @returns Promise resolving to CSV file URL
	 */
	async exportExpensesCSV(period: TimePeriod = 'this_month', categoryId?: string): Promise<string> {
		try {
			// Build query parameters
			const params = new URLSearchParams({ period });

			if (categoryId) {
				params.append('category', categoryId);
			}

			// This needs to be handled differently from regular JSON requests
			// as it returns a file download
			const token = localStorage.getItem('auth_token');
			if (!token) {
				throw new Error('Authentication required');
			}

			const response = await fetch(
				`${API_BASE_URL}/expenses/export/csv/?${params.toString()}`,
				{
					method: 'GET',
					headers: {
						Authorization: `Bearer ${token}`
					}
				}
			);

			if (!response.ok) {
				throw new Error('Failed to export expenses');
			}

			// Create a URL for the blob
			const blob = await response.blob();
			const url = URL.createObjectURL(blob);

			// Optionally trigger the download
			const link = document.createElement('a');
			link.href = url;
			link.download = `expenses_${period}.csv`;
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);

			toastStore.success('Expenses exported successfully');

			return url;
		} catch (error) {
			const message = error instanceof Error ? error.message : 'Failed to export expenses';
			toastStore.error(message);
			throw error;
		}
	},

	/**
	 * Export a chart as an image
	 *
	 * @param chartData Chart data as base64 string
	 * @returns Promise resolving to image file URL
	 */
	async exportChartImage(chartData: string): Promise<string> {
		try {
			const response = await api.post<{ url: string }>('/expenses/export/chart/', {
				chart_data: chartData
			});

			if (response.error) {
				throw new Error(response.error.message);
			}

			if (!response.data?.url) {
				throw new Error('Failed to export chart');
			}

			toastStore.success('Chart exported successfully');

			return response.data.url;
		} catch (error) {
			const message = error instanceof Error ? error.message : 'Failed to export chart';
			toastStore.error(message);
			throw error;
		}
	}
};
