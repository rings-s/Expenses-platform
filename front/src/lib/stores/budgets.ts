/**
 * Budgets Store
 *
 * Central store for managing budget data:
 * - Budget listing
 * - Selected budget
 * - Budget CRUD operations state
 * - Budget performance metrics
 */

import { writable, derived } from 'svelte/store';
import type { Budget, BudgetFormData, Currency, BudgetPeriod } from '$lib/types/expenses';
import { categoryMap } from './categories';

// Types for the budgets store
interface BudgetState {
	// Data
	budgets: Budget[];
	selectedBudget: Budget | null;

	// Filters
	currentPeriod: BudgetPeriod;
	selectedCurrency: Currency;

	// Performance metrics
	totalBudgeted: number;
	totalSpent: number;
	totalRemaining: number;
	overallPercentage: number;

	// State flags
	isLoading: boolean;
	isCreating: boolean;
	isUpdating: boolean;
	isDeleting: boolean;
	error: string | null;
}

// Create the budgets store
const createBudgetsStore = () => {
	// Initial state
	const initialState: BudgetState = {
		budgets: [],
		selectedBudget: null,
		currentPeriod: 'monthly',
		selectedCurrency: 'USD',
		totalBudgeted: 0,
		totalSpent: 0,
		totalRemaining: 0,
		overallPercentage: 0,
		isLoading: false,
		isCreating: false,
		isUpdating: false,
		isDeleting: false,
		error: null
	};

	// Create the writable store
	const { subscribe, update, set } = writable<BudgetState>(initialState);

	return {
		subscribe,

		/**
		 * Reset the store to initial state
		 */
		reset: () => {
			set(initialState);
		},

		/**
		 * Set budgets data (typically from API response)
		 */
		setBudgets: (budgets: Budget[]) => {
			update((state) => {
				// Calculate performance metrics
				const filteredBudgets = budgets.filter(
					(b) => b.period === state.currentPeriod && b.currency === state.selectedCurrency
				);

				const totalBudgeted = filteredBudgets.reduce((sum, budget) => sum + budget.amount, 0);
				const totalSpent = filteredBudgets.reduce(
					(sum, budget) => sum + (budget.spent_amount || 0),
					0
				);
				const totalRemaining = Math.max(0, totalBudgeted - totalSpent);
				const overallPercentage =
					totalBudgeted > 0 ? Math.min(100, (totalSpent / totalBudgeted) * 100) : 0;

				return {
					...state,
					budgets,
					totalBudgeted,
					totalSpent,
					totalRemaining,
					overallPercentage,
					isLoading: false,
					error: null
				};
			});
		},

		/**
		 * Set selected budget
		 */
		selectBudget: (budget: Budget | null) => {
			update((state) => ({
				...state,
				selectedBudget: budget
			}));
		},

		/**
		 * Select budget by ID
		 */
		selectBudgetById: (id: string) => {
			update((state) => {
				// Find budget in the current list
				const budget = state.budgets.find((b) => b.id === id) || null;

				return {
					...state,
					selectedBudget: budget
				};
			});
		},

		/**
		 * Add a new budget to the store (after creation)
		 */
		addBudget: (budget: Budget) => {
			update((state) => {
				const updatedBudgets = [...state.budgets, budget];

				// Recalculate metrics if the new budget matches current filters
				let metrics = {
					totalBudgeted: state.totalBudgeted,
					totalSpent: state.totalSpent,
					totalRemaining: state.totalRemaining,
					overallPercentage: state.overallPercentage
				};

				if (budget.period === state.currentPeriod && budget.currency === state.selectedCurrency) {
					metrics.totalBudgeted = state.totalBudgeted + budget.amount;
					metrics.totalSpent = state.totalSpent + (budget.spent_amount || 0);
					metrics.totalRemaining = Math.max(0, metrics.totalBudgeted - metrics.totalSpent);
					metrics.overallPercentage =
						metrics.totalBudgeted > 0
							? Math.min(100, (metrics.totalSpent / metrics.totalBudgeted) * 100)
							: 0;
				}

				return {
					...state,
					budgets: updatedBudgets,
					...metrics,
					isCreating: false
				};
			});
		},

		/**
		 * Update an existing budget in the store
		 */
		updateBudget: (updatedBudget: Budget) => {
			update((state) => {
				// Find the old budget for comparison
				const oldBudget = state.budgets.find((b) => b.id === updatedBudget.id);

				// Update in budgets list
				const updatedBudgets = state.budgets.map((budget) =>
					budget.id === updatedBudget.id ? updatedBudget : budget
				);

				// Update selected budget if it's the same one
				const updatedSelectedBudget =
					state.selectedBudget?.id === updatedBudget.id ? updatedBudget : state.selectedBudget;

				// Recalculate metrics if the budget matches current filters
				let metrics = {
					totalBudgeted: state.totalBudgeted,
					totalSpent: state.totalSpent,
					totalRemaining: state.totalRemaining,
					overallPercentage: state.overallPercentage
				};

				// If old budget matched filters
				if (
					oldBudget &&
					oldBudget.period === state.currentPeriod &&
					oldBudget.currency === state.selectedCurrency
				) {
					// Remove old budget from totals
					metrics.totalBudgeted -= oldBudget.amount;
					metrics.totalSpent -= oldBudget.spent_amount || 0;
				}

				// If updated budget matches filters
				if (
					updatedBudget.period === state.currentPeriod &&
					updatedBudget.currency === state.selectedCurrency
				) {
					// Add updated budget to totals
					metrics.totalBudgeted += updatedBudget.amount;
					metrics.totalSpent += updatedBudget.spent_amount || 0;
				}

				// Recalculate remaining and percentage
				metrics.totalRemaining = Math.max(0, metrics.totalBudgeted - metrics.totalSpent);
				metrics.overallPercentage =
					metrics.totalBudgeted > 0
						? Math.min(100, (metrics.totalSpent / metrics.totalBudgeted) * 100)
						: 0;

				return {
					...state,
					budgets: updatedBudgets,
					selectedBudget: updatedSelectedBudget,
					...metrics,
					isUpdating: false
				};
			});
		},

		/**
		 * Remove a budget from the store
		 */
		removeBudget: (id: string) => {
			update((state) => {
				// Find the budget being removed
				const budgetToRemove = state.budgets.find((b) => b.id === id);

				// Remove from budgets list
				const updatedBudgets = state.budgets.filter((budget) => budget.id !== id);

				// Clear selected budget if it's the same one
				const updatedSelectedBudget = state.selectedBudget?.id === id ? null : state.selectedBudget;

				// Recalculate metrics if the removed budget matched current filters
				let metrics = {
					totalBudgeted: state.totalBudgeted,
					totalSpent: state.totalSpent,
					totalRemaining: state.totalRemaining,
					overallPercentage: state.overallPercentage
				};

				if (
					budgetToRemove &&
					budgetToRemove.period === state.currentPeriod &&
					budgetToRemove.currency === state.selectedCurrency
				) {
					metrics.totalBudgeted -= budgetToRemove.amount;
					metrics.totalSpent -= budgetToRemove.spent_amount || 0;
					metrics.totalRemaining = Math.max(0, metrics.totalBudgeted - metrics.totalSpent);
					metrics.overallPercentage =
						metrics.totalBudgeted > 0
							? Math.min(100, (metrics.totalSpent / metrics.totalBudgeted) * 100)
							: 0;
				}

				return {
					...state,
					budgets: updatedBudgets,
					selectedBudget: updatedSelectedBudget,
					...metrics,
					isDeleting: false
				};
			});
		},

		/**
		 * Set the current period filter
		 */
		setCurrentPeriod: (period: BudgetPeriod) => {
			update((state) => {
				// Filter budgets for the new period and recalculate metrics
				const filteredBudgets = state.budgets.filter(
					(b) => b.period === period && b.currency === state.selectedCurrency
				);

				const totalBudgeted = filteredBudgets.reduce((sum, budget) => sum + budget.amount, 0);
				const totalSpent = filteredBudgets.reduce(
					(sum, budget) => sum + (budget.spent_amount || 0),
					0
				);
				const totalRemaining = Math.max(0, totalBudgeted - totalSpent);
				const overallPercentage =
					totalBudgeted > 0 ? Math.min(100, (totalSpent / totalBudgeted) * 100) : 0;

				return {
					...state,
					currentPeriod: period,
					totalBudgeted,
					totalSpent,
					totalRemaining,
					overallPercentage
				};
			});
		},

		/**
		 * Set the selected currency filter
		 */
		setSelectedCurrency: (currency: Currency) => {
			update((state) => {
				// Filter budgets for the new currency and recalculate metrics
				const filteredBudgets = state.budgets.filter(
					(b) => b.period === state.currentPeriod && b.currency === currency
				);

				const totalBudgeted = filteredBudgets.reduce((sum, budget) => sum + budget.amount, 0);
				const totalSpent = filteredBudgets.reduce(
					(sum, budget) => sum + (budget.spent_amount || 0),
					0
				);
				const totalRemaining = Math.max(0, totalBudgeted - totalSpent);
				const overallPercentage =
					totalBudgeted > 0 ? Math.min(100, (totalSpent / totalBudgeted) * 100) : 0;

				return {
					...state,
					selectedCurrency: currency,
					totalBudgeted,
					totalSpent,
					totalRemaining,
					overallPercentage
				};
			});
		},

		/**
		 * Update budget spent amounts (e.g. after new expense is added)
		 */
		updateBudgetSpending: (categoryId: string | null, amount: number, currency: Currency) => {
			update((state) => {
				// Find budgets that match the category (or null for overall budget)
				let matchingBudgets = state.budgets.filter(
					(b) =>
						b.currency === currency &&
						(b.category === categoryId || (categoryId === null && b.category === null))
				);

				if (matchingBudgets.length === 0) return state;

				// Update matching budgets
				const updatedBudgets = state.budgets.map((budget) => {
					if (
						budget.currency === currency &&
						(budget.category === categoryId || (categoryId === null && budget.category === null))
					) {
						const newSpentAmount = (budget.spent_amount || 0) + amount;
						const newRemainingAmount = Math.max(0, budget.amount - newSpentAmount);
						const newPercentage =
							budget.amount > 0 ? Math.min(100, (newSpentAmount / budget.amount) * 100) : 0;

						return {
							...budget,
							spent_amount: newSpentAmount,
							remaining_amount: newRemainingAmount,
							percentage_used: newPercentage
						};
					}
					return budget;
				});

				// Recalculate overall metrics if any affected budget matches current filters
				let metrics = {
					totalSpent: state.totalSpent,
					totalRemaining: state.totalRemaining,
					overallPercentage: state.overallPercentage
				};

				const affectedFilteredBudgets = matchingBudgets.filter(
					(b) => b.period === state.currentPeriod && b.currency === state.selectedCurrency
				);

				if (affectedFilteredBudgets.length > 0) {
					metrics.totalSpent = state.totalSpent + amount;
					metrics.totalRemaining = Math.max(0, state.totalBudgeted - metrics.totalSpent);
					metrics.overallPercentage =
						state.totalBudgeted > 0
							? Math.min(100, (metrics.totalSpent / state.totalBudgeted) * 100)
							: 0;
				}

				// Update selected budget if affected
				let updatedSelectedBudget = state.selectedBudget;
				if (
					state.selectedBudget &&
					(state.selectedBudget.category === categoryId ||
						(categoryId === null && state.selectedBudget.category === null)) &&
					state.selectedBudget.currency === currency
				) {
					const newSpentAmount = (state.selectedBudget.spent_amount || 0) + amount;
					const newRemainingAmount = Math.max(0, state.selectedBudget.amount - newSpentAmount);
					const newPercentage =
						state.selectedBudget.amount > 0
							? Math.min(100, (newSpentAmount / state.selectedBudget.amount) * 100)
							: 0;

					updatedSelectedBudget = {
						...state.selectedBudget,
						spent_amount: newSpentAmount,
						remaining_amount: newRemainingAmount,
						percentage_used: newPercentage
					};
				}

				return {
					...state,
					budgets: updatedBudgets,
					selectedBudget: updatedSelectedBudget,
					...metrics
				};
			});
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
export const budgetsStore = createBudgetsStore();

// Derived stores for convenient access
export const budgets = derived(budgetsStore, ($store) => $store.budgets);
export const selectedBudget = derived(budgetsStore, ($store) => $store.selectedBudget);
export const currentPeriod = derived(budgetsStore, ($store) => $store.currentPeriod);
export const selectedCurrency = derived(budgetsStore, ($store) => $store.selectedCurrency);
export const totalBudgeted = derived(budgetsStore, ($store) => $store.totalBudgeted);
export const totalSpent = derived(budgetsStore, ($store) => $store.totalSpent);
export const totalRemaining = derived(budgetsStore, ($store) => $store.totalRemaining);
export const overallPercentage = derived(budgetsStore, ($store) => $store.overallPercentage);
export const budgetsLoading = derived(budgetsStore, ($store) => $store.isLoading);
export const budgetsError = derived(budgetsStore, ($store) => $store.error);

// Filtered budgets for current period and currency
export const filteredBudgets = derived(budgetsStore, ($store) =>
	$store.budgets.filter(
		(b) => b.period === $store.currentPeriod && b.currency === $store.selectedCurrency
	)
);

// Combined derived store with budget and category info
export const budgetsWithCategories = derived(
	[budgetsStore, categoryMap],
	([$budgetsStore, $categoryMap]) => {
		return $budgetsStore.budgets.map((budget) => {
			// Enrich budget with category info
			let categoryName = 'Uncategorized';
			let categoryColor = '#CCCCCC';

			if (budget.category && $categoryMap[budget.category]) {
				categoryName = $categoryMap[budget.category].name;
				categoryColor = $categoryMap[budget.category].color;
			}

			return {
				...budget,
				category_name: categoryName,
				category_color: categoryColor
			};
		});
	}
);

// Budgets over/under threshold
export const warningBudgets = derived(filteredBudgets, ($budgets) =>
	$budgets.filter((b) => b.percentage_used && b.percentage_used >= 80)
);

export const criticalBudgets = derived(filteredBudgets, ($budgets) =>
	$budgets.filter((b) => b.percentage_used && b.percentage_used >= 100)
);
