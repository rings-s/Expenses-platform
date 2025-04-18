import { writable } from 'svelte/store';
import expenseService from '../services/expenseService';

function createExpenseStore() {
	const { subscribe, set, update } = writable({
		expenses: [],
		loading: false,
		error: null,
		filters: {
			category: null,
			start_date: null,
			end_date: null,
			min_amount: null,
			max_amount: null,
			payment_method: null
		}
	});

	return {
		subscribe,

		/**
		 * Load expenses with optional filters
		 */
		loadExpenses: async (filters = {}) => {
			try {
				update((state) => ({
					...state,
					loading: true,
					filters: { ...state.filters, ...filters }
				}));

				const expenses = await expenseService.getExpenses(filters);

				update((state) => ({
					...state,
					expenses,
					loading: false,
					error: null
				}));

				return expenses;
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
		 * Create a new expense
		 */
		createExpense: async (expenseData) => {
			try {
				update((state) => ({ ...state, loading: true }));

				const newExpense = await expenseService.createExpense(expenseData);

				update((state) => ({
					...state,
					expenses: [newExpense, ...state.expenses],
					loading: false,
					error: null
				}));

				return newExpense;
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
		 * Update an expense
		 */
		updateExpense: async (expenseId, expenseData) => {
			try {
				update((state) => ({ ...state, loading: true }));

				const updatedExpense = await expenseService.updateExpense(expenseId, expenseData);

				update((state) => ({
					...state,
					expenses: state.expenses.map((exp) => (exp.id === expenseId ? updatedExpense : exp)),
					loading: false,
					error: null
				}));

				return updatedExpense;
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
		 * Delete an expense
		 */
		deleteExpense: async (expenseId) => {
			try {
				update((state) => ({ ...state, loading: true }));

				await expenseService.deleteExpense(expenseId);

				update((state) => ({
					...state,
					expenses: state.expenses.filter((exp) => exp.id !== expenseId),
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
		 * Set filters and reload expenses
		 */
		setFilters: async (filters) => {
			try {
				update((state) => ({
					...state,
					loading: true,
					filters: { ...state.filters, ...filters }
				}));

				const expenses = await expenseService.getExpenses(filters);

				update((state) => ({
					...state,
					expenses,
					loading: false,
					error: null
				}));

				return expenses;
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
		 * Clear filters and reload expenses
		 */
		clearFilters: async () => {
			const emptyFilters = {
				category: null,
				start_date: null,
				end_date: null,
				min_amount: null,
				max_amount: null,
				payment_method: null
			};

			try {
				update((state) => ({
					...state,
					loading: true,
					filters: emptyFilters
				}));

				const expenses = await expenseService.getExpenses({});

				update((state) => ({
					...state,
					expenses,
					loading: false,
					error: null
				}));

				return expenses;
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
		 * Export expenses as CSV
		 */
		exportExpenses: async (filters = {}) => {
			try {
				update((state) => ({ ...state, loading: true }));

				const blob = await expenseService.exportExpenses(filters);

				update((state) => ({
					...state,
					loading: false,
					error: null
				}));

				// Create a download link
				const url = window.URL.createObjectURL(blob);
				const a = document.createElement('a');
				a.style.display = 'none';
				a.href = url;
				a.download = 'expenses.csv';
				document.body.appendChild(a);
				a.click();
				window.URL.revokeObjectURL(url);

				return true;
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
		 * Clear any expense errors
		 */
		clearError: () => {
			update((state) => ({ ...state, error: null }));
		}
	};
}

export const expenseStore = createExpenseStore();
