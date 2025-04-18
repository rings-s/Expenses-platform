import { writable } from 'svelte/store';
import budgetService from '../services/budgetService';

function createBudgetStore() {
	const { subscribe, set, update } = writable({
		budgets: [],
		comparisons: [],
		loading: false,
		error: null
	});

	return {
		subscribe,

		/**
		 * Load all budgets
		 */
		loadBudgets: async () => {
			try {
				update((state) => ({ ...state, loading: true }));

				const budgets = await budgetService.getBudgets();

				update((state) => ({
					...state,
					budgets,
					loading: false,
					error: null
				}));

				return budgets;
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
		 * Load budget comparisons
		 */
		loadBudgetComparisons: async (params = {}) => {
			try {
				update((state) => ({ ...state, loading: true }));

				const response = await budgetService.getBudgetComparison(params);

				update((state) => ({
					...state,
					comparisons: response.data,
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
		 * Create a new budget
		 */
		createBudget: async (budgetData) => {
			try {
				update((state) => ({ ...state, loading: true }));

				const newBudget = await budgetService.createBudget(budgetData);

				update((state) => ({
					...state,
					budgets: [...state.budgets, newBudget],
					loading: false,
					error: null
				}));

				return newBudget;
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
		 * Update a budget
		 */
		updateBudget: async (budgetId, budgetData) => {
			try {
				update((state) => ({ ...state, loading: true }));

				const updatedBudget = await budgetService.updateBudget(budgetId, budgetData);

				update((state) => ({
					...state,
					budgets: state.budgets.map((budget) => (budget.id === budgetId ? updatedBudget : budget)),
					loading: false,
					error: null
				}));

				return updatedBudget;
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
		 * Delete a budget
		 */
		deleteBudget: async (budgetId) => {
			try {
				update((state) => ({ ...state, loading: true }));

				await budgetService.deleteBudget(budgetId);

				update((state) => ({
					...state,
					budgets: state.budgets.filter((budget) => budget.id !== budgetId),
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
		 * Clear any budget errors
		 */
		clearError: () => {
			update((state) => ({ ...state, error: null }));
		}
	};
}

export const budgetStore = createBudgetStore();
