/**
 * Expense Store
 *
 * Central store for managing expense data and state:
 * - Expense listing with filtering and pagination
 * - Active expense selection
 * - Expense CRUD operations state
 * - Filter state
 */

import { writable, derived, get } from 'svelte/store';
import type {
	Expense,
	ExpenseFilter,
	ExpenseFormData,
	Currency,
	TimePeriod
} from '$lib/types/expenses';
import type { PaginatedResponse } from '$lib/types/api.types';

// Types for the expense store
interface ExpenseState {
	// Data
	expenses: Expense[];
	recentExpenses: Expense[];
	selectedExpense: Expense | null;
	expenseCount: number;
	totalPages: number;

	// Pagination
	currentPage: number;
	pageSize: number;

	// Filtering
	filter: ExpenseFilter;
	timePeriod: TimePeriod;

	// Sorting
	sortField: string;
	sortDirection: 'asc' | 'desc';

	// Currency
	defaultCurrency: Currency;

	// State flags
	isLoading: boolean;
	isCreating: boolean;
	isUpdating: boolean;
	isDeleting: boolean;
	error: string | null;
}

// Create the expense store
const createExpenseStore = () => {
	// Initial filter state
	const initialFilter: ExpenseFilter = {
		start_date: undefined,
		end_date: undefined,
		category_id: undefined,
		min_amount: undefined,
		max_amount: undefined,
		payment_method: undefined,
		currency: undefined,
		search: undefined,
		is_recurring: undefined
	};

	// Initial state
	const initialState: ExpenseState = {
		expenses: [],
		recentExpenses: [],
		selectedExpense: null,
		expenseCount: 0,
		totalPages: 0,
		currentPage: 1,
		pageSize: 10,
		filter: initialFilter,
		timePeriod: 'this_month',
		sortField: 'date',
		sortDirection: 'desc',
		defaultCurrency: 'USD',
		isLoading: false,
		isCreating: false,
		isUpdating: false,
		isDeleting: false,
		error: null
	};

	// Create the writable store
	const { subscribe, update, set } = writable<ExpenseState>(initialState);

	return {
		subscribe,

		/**
		 * Reset the store to initial state
		 */
		reset: () => {
			set(initialState);
		},

		/**
		 * Set expenses data (typically from API response)
		 */
		setExpenses: (response: PaginatedResponse<Expense>) => {
			update((state) => ({
				...state,
				expenses: response.results,
				expenseCount: response.count,
				totalPages: Math.ceil(response.count / state.pageSize),
				currentPage: response.current_page || state.currentPage,
				isLoading: false,
				error: null
			}));
		},

		/**
		 * Set recent expenses (for dashboard)
		 */
		setRecentExpenses: (expenses: Expense[]) => {
			update((state) => ({
				...state,
				recentExpenses: expenses
			}));
		},

		/**
		 * Set selected expense
		 */
		selectExpense: (expense: Expense | null) => {
			update((state) => ({
				...state,
				selectedExpense: expense
			}));
		},

		/**
		 * Select expense by ID
		 */
		selectExpenseById: (id: string) => {
			update((state) => {
				// Find expense in the current list
				const expense = state.expenses.find((e) => e.id === id) || null;

				return {
					...state,
					selectedExpense: expense
				};
			});
		},

		/**
		 * Add a new expense to the store (after creation)
		 */
		addExpense: (expense: Expense) => {
			update((state) => {
				// Add to list if on the first page (maintain sorting)
				let updatedExpenses = state.expenses;

				if (state.currentPage === 1) {
					updatedExpenses = [expense, ...state.expenses];

					// Sort by current sort field
					updatedExpenses.sort((a, b) => {
						if (state.sortField === 'date') {
							return state.sortDirection === 'desc'
								? new Date(b.date).getTime() - new Date(a.date).getTime()
								: new Date(a.date).getTime() - new Date(b.date).getTime();
						}

						// Default string comparison
						const valA = String(a[state.sortField as keyof Expense]);
						const valB = String(b[state.sortField as keyof Expense]);

						return state.sortDirection === 'desc'
							? valB.localeCompare(valA)
							: valA.localeCompare(valB);
					});

					// Keep the same page size
					updatedExpenses = updatedExpenses.slice(0, state.pageSize);
				}

				// Also add to recent expenses
				const updatedRecentExpenses = [expense, ...state.recentExpenses].slice(0, 5);

				return {
					...state,
					expenses: updatedExpenses,
					recentExpenses: updatedRecentExpenses,
					expenseCount: state.expenseCount + 1,
					totalPages: Math.ceil((state.expenseCount + 1) / state.pageSize),
					isCreating: false
				};
			});
		},

		/**
		 * Update an existing expense in the store
		 */
		updateExpense: (updatedExpense: Expense) => {
			update((state) => {
				// Update in main list
				const updatedExpenses = state.expenses.map((expense) =>
					expense.id === updatedExpense.id ? updatedExpense : expense
				);

				// Update in recent list if present
				const updatedRecentExpenses = state.recentExpenses.map((expense) =>
					expense.id === updatedExpense.id ? updatedExpense : expense
				);

				// Update selected expense if it's the same one
				const updatedSelectedExpense =
					state.selectedExpense?.id === updatedExpense.id ? updatedExpense : state.selectedExpense;

				return {
					...state,
					expenses: updatedExpenses,
					recentExpenses: updatedRecentExpenses,
					selectedExpense: updatedSelectedExpense,
					isUpdating: false
				};
			});
		},

		/**
		 * Remove an expense from the store
		 */
		removeExpense: (id: string) => {
			update((state) => {
				// Remove from main list
				const updatedExpenses = state.expenses.filter((expense) => expense.id !== id);

				// Remove from recent list
				const updatedRecentExpenses = state.recentExpenses.filter((expense) => expense.id !== id);

				// Clear selected expense if it's the same one
				const updatedSelectedExpense =
					state.selectedExpense?.id === id ? null : state.selectedExpense;

				return {
					...state,
					expenses: updatedExpenses,
					recentExpenses: updatedRecentExpenses,
					selectedExpense: updatedSelectedExpense,
					expenseCount: state.expenseCount - 1,
					totalPages: Math.max(1, Math.ceil((state.expenseCount - 1) / state.pageSize)),
					isDeleting: false
				};
			});
		},

		/**
		 * Set filter parameters
		 */
		setFilter: (filter: Partial<ExpenseFilter>) => {
			update((state) => ({
				...state,
				filter: {
					...state.filter,
					...filter
				},
				currentPage: 1 // Reset to first page when filter changes
			}));
		},

		/**
		 * Reset filter to default
		 */
		resetFilter: () => {
			update((state) => ({
				...state,
				filter: initialFilter,
				timePeriod: 'this_month',
				currentPage: 1
			}));
		},

		/**
		 * Set time period and adjust date filters
		 */
		setTimePeriod: (period: TimePeriod, startDate?: string, endDate?: string) => {
			update((state) => {
				// If custom period, use the provided dates
				const dateFilter =
					period === 'custom' && startDate && endDate
						? { start_date: startDate, end_date: endDate }
						: { start_date: undefined, end_date: undefined }; // Dates will be resolved by the API

				return {
					...state,
					timePeriod: period,
					filter: {
						...state.filter,
						...dateFilter
					},
					currentPage: 1
				};
			});
		},

		/**
		 * Set current page for pagination
		 */
		setPage: (page: number) => {
			update((state) => ({
				...state,
				currentPage: page
			}));
		},

		/**
		 * Set page size
		 */
		setPageSize: (size: number) => {
			update((state) => ({
				...state,
				pageSize: size,
				totalPages: Math.ceil(state.expenseCount / size),
				currentPage: 1 // Reset to first page when changing page size
			}));
		},

		/**
		 * Set sorting
		 */
		setSorting: (field: string, direction: 'asc' | 'desc') => {
			update((state) => ({
				...state,
				sortField: field,
				sortDirection: direction
			}));
		},

		/**
		 * Set default currency
		 */
		setDefaultCurrency: (currency: Currency) => {
			update((state) => ({
				...state,
				defaultCurrency: currency
			}));
		},

		/**
		 * Set loading state
		 */
		setLoading: (loading: boolean) => {
			update((state) => ({
				...state,
				isLoading: loading
			}));
		},

		/**
		 * Set creating state
		 */
		setCreating: (creating: boolean) => {
			update((state) => ({
				...state,
				isCreating: creating
			}));
		},

		/**
		 * Set updating state
		 */
		setUpdating: (updating: boolean) => {
			update((state) => ({
				...state,
				isUpdating: updating
			}));
		},

		/**
		 * Set deleting state
		 */
		setDeleting: (deleting: boolean) => {
			update((state) => ({
				...state,
				isDeleting: deleting
			}));
		},

		/**
		 * Set error message
		 */
		setError: (error: string | null) => {
			update((state) => ({
				...state,
				error,
				isLoading: false,
				isCreating: false,
				isUpdating: false,
				isDeleting: false
			}));
		}
	};
};

// Create and export the store
export const expenseStore = createExpenseStore();

// Derived stores for convenient access
export const expenses = derived(expenseStore, ($store) => $store.expenses);
export const recentExpenses = derived(expenseStore, ($store) => $store.recentExpenses);
export const selectedExpense = derived(expenseStore, ($store) => $store.selectedExpense);
export const expenseFilter = derived(expenseStore, ($store) => $store.filter);
export const expenseIsLoading = derived(expenseStore, ($store) => $store.isLoading);
export const expenseError = derived(expenseStore, ($store) => $store.error);
export const currentPage = derived(expenseStore, ($store) => $store.currentPage);
export const totalPages = derived(expenseStore, ($store) => $store.totalPages);
export const defaultCurrency = derived(expenseStore, ($store) => $store.defaultCurrency);
