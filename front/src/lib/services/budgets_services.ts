/**
 * Budgets Service
 *
 * Service for interacting with the budgets API endpoints:
 * - List budgets
 * - Create, update, delete budgets
 * - Get budget details
 */

import { api } from './api';
import { budgetsStore } from '$lib/stores/budgets';
import { toastStore } from '$lib/stores/toast';
import type { Budget, BudgetFormData, BudgetPeriod, Currency } from '$lib/types/expenses';

/**
 * Budgets Service - handles all budget-related API calls
 */
export const budgetsService = {
	/**
	 * Get all budgets
	 */
	async getBudgets(): Promise<Budget[]> {
		budgetsStore.setLoading(true);

		try {
			const response = await api.get<Budget[]>('/expenses/budgets/');

			if (response.error) {
				budgetsStore.setError(response.error.message);
				return [];
			}

			// Update store with budgets
			budgetsStore.setBudgets(response.data!);
			return response.data!;
		} catch (error) {
			const message = error instanceof Error ? error.message : 'Failed to fetch budgets';
			budgetsStore.setError(message);
			return [];
		} finally {
			budgetsStore.setLoading(false);
		}
	},

	/**
	 * Get budgets filtered by period and currency
	 */
	async getFilteredBudgets(
		period: BudgetPeriod = 'monthly',
		currency: Currency = 'USD'
	): Promise<Budget[]> {
		budgetsStore.setLoading(true);

		try {
			const params = new URLSearchParams({
				period,
				currency
			});

			const response = await api.get<Budget[]>(`/expenses/budgets/?${params.toString()}`);

			if (response.error) {
				budgetsStore.setError(response.error.message);
				return [];
			}

			// Update the filters in the store
			budgetsStore.setCurrentPeriod(period);
			budgetsStore.setSelectedCurrency(currency);

			// Update store with budgets
			budgetsStore.setBudgets(response.data!);
			return response.data!;
		} catch (error) {
			const message = error instanceof Error ? error.message : 'Failed to fetch budgets';
			budgetsStore.setError(message);
			return [];
		} finally {
			budgetsStore.setLoading(false);
		}
	},

	/**
	 * Get a single budget by ID
	 */
	async getBudgetById(id: string): Promise<Budget | null> {
		budgetsStore.setLoading(true);

		try {
			const response = await api.get<Budget>(`/expenses/budgets/${id}/`);

			if (response.error) {
				budgetsStore.setError(response.error.message);
				return null;
			}

			// Set selected budget in store
			budgetsStore.selectBudget(response.data!);
			return response.data!;
		} catch (error) {
			const message = error instanceof Error ? error.message : 'Failed to fetch budget';
			budgetsStore.setError(message);
			return null;
		} finally {
			budgetsStore.setLoading(false);
		}
	},

	/**
	 * Create a new budget
	 */
	async createBudget(budgetData: BudgetFormData): Promise<Budget | null> {
		budgetsStore.setCreating(true);

		try {
			const response = await api.post<Budget>('/expenses/budgets/', budgetData);

			if (response.error) {
				budgetsStore.setError(response.error.message);
				toastStore.error(`Failed to create budget: ${response.error.message}`);
				return null;
			}

			// Add to store and show success toast
			budgetsStore.addBudget(response.data!);
			toastStore.success('Budget created successfully');

			return response.data!;
		} catch (error) {
			const message = error instanceof Error ? error.message : 'Failed to create budget';
			budgetsStore.setError(message);
			toastStore.error(message);
			return null;
		} finally {
			budgetsStore.setCreating(false);
		}
	},

	/**
	 * Update an existing budget
	 */
	async updateBudget(id: string, budgetData: BudgetFormData): Promise<Budget | null> {
		budgetsStore.setUpdating(true);

		try {
			const response = await api.put<Budget>(`/expenses/budgets/${id}/`, budgetData);

			if (response.error) {
				budgetsStore.setError(response.error.message);
				toastStore.error(`Failed to update budget: ${response.error.message}`);
				return null;
			}

			// Update in store and show success toast
			budgetsStore.updateBudget(response.data!);
			toastStore.success('Budget updated successfully');

			return response.data!;
		} catch (error) {
			const message = error instanceof Error ? error.message : 'Failed to update budget';
			budgetsStore.setError(message);
			toastStore.error(message);
			return null;
		} finally {
			budgetsStore.setUpdating(false);
		}
	},

	/**
	 * Delete a budget
	 */
	async deleteBudget(id: string): Promise<boolean> {
		budgetsStore.setDeleting(true);

		try {
			const response = await api.delete<{ detail: string }>(`/expenses/budgets/${id}/`);

			if (response.error) {
				budgetsStore.setError(response.error.message);
				toastStore.error(`Failed to delete budget: ${response.error.message}`);
				return false;
			}

			// Remove from store and show success toast
			budgetsStore.removeBudget(id);
			toastStore.success('Budget deleted successfully');

			return true;
		} catch (error) {
			const message = error instanceof Error ? error.message : 'Failed to delete budget';
			budgetsStore.setError(message);
			toastStore.error(message);
			return false;
		} finally {
			budgetsStore.setDeleting(false);
		}
	},

	/**
	 * Create default budgets for main spending categories
	 */
	async createDefaultBudgets(
		categories: { id: string; name: string }[],
		currency: Currency = 'USD'
	): Promise<boolean> {
		try {
			// Get current date for start_date
			const today = new Date();
			const startDate = new Date(today.getFullYear(), today.getMonth(), 1);

			// Default budget amounts (these are placeholders and would usually be adjusted by users)
			const defaultAmounts: Record<string, number> = {
				Housing: 1200,
				Food: 500,
				Transportation: 300,
				Entertainment: 200,
				Shopping: 300,
				Utilities: 250,
				Healthcare: 150,
				Education: 100,
				'Personal Care': 100,
				Miscellaneous: 200
			};

			// Create budgets for each category
			for (const category of categories) {
				// Skip if we don't have a default amount for this category
				if (!defaultAmounts[category.name]) continue;

				const budgetData: BudgetFormData = {
					amount: defaultAmounts[category.name],
					currency,
					period: 'monthly',
					start_date: startDate.toISOString().split('T')[0],
					category: category.id
				};

				await this.createBudget(budgetData);
			}

			// Also create an overall budget
			const totalBudget = Object.values(defaultAmounts).reduce((sum, amount) => sum + amount, 0);
			const overallBudgetData: BudgetFormData = {
				amount: totalBudget,
				currency,
				period: 'monthly',
				start_date: startDate.toISOString().split('T')[0]
			};

			await this.createBudget(overallBudgetData);

			toastStore.success('Default budgets created successfully');
			return true;
		} catch (error) {
			const message = error instanceof Error ? error.message : 'Failed to create default budgets';
			budgetsStore.setError(message);
			toastStore.error(message);
			return false;
		}
	},

	/**
	 * Get budget performance relative to spending
	 */
	async getBudgetPerformance(
		period: BudgetPeriod = 'monthly',
		currency: Currency = 'USD'
	): Promise<any> {
		try {
			const params = new URLSearchParams({
				period: period === 'monthly' ? 'current_month' : 'current_year',
				currency
			});

			const response = await api.get<any>(
				`/expenses/analytics/budget-comparison/?${params.toString()}`
			);

			if (response.error) {
				toastStore.error('Failed to fetch budget performance data');
				return null;
			}

			return response.data;
		} catch (error) {
			const message = error instanceof Error ? error.message : 'Failed to fetch budget performance';
			toastStore.error(message);
			return null;
		}
	},

	/**
	 * Check if a budget exists for a specific category
	 */
	async hasBudgetForCategory(
		categoryId: string,
		period: BudgetPeriod = 'monthly'
	): Promise<boolean> {
		try {
			// First ensure we have all budgets loaded
			const budgets = await this.getBudgets();

			// Check if any budget matches the category and period
			return budgets.some((budget) => budget.category === categoryId && budget.period === period);
		} catch (error) {
			return false;
		}
	}
};
