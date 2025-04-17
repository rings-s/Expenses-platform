/**
 * Categories Service
 *
 * Service for interacting with the categories API endpoints:
 * - List categories
 * - Create, update, delete categories
 * - Get category details
 */

import { api } from './api';
import { categoriesStore } from '$lib/stores/categories';
import { toastStore } from '$lib/stores/toast';
import type { Category, CategoryFormData } from '$lib/types/expenses';

/**
 * Categories Service - handles all category-related API calls
 */
export const categoriesService = {
	/**
	 * Get all categories
	 */
	async getCategories(): Promise<Category[]> {
		categoriesStore.setLoading(true);

		try {
			const response = await api.get<Category[]>('/expenses/categories/');

			if (response.error) {
				categoriesStore.setError(response.error.message);
				return [];
			}

			// Update store with categories
			categoriesStore.setCategories(response.data!);
			return response.data!;
		} catch (error) {
			const message = error instanceof Error ? error.message : 'Failed to fetch categories';
			categoriesStore.setError(message);
			return [];
		} finally {
			categoriesStore.setLoading(false);
		}
	},

	/**
	 * Get a single category by ID
	 */
	async getCategoryById(id: string): Promise<Category | null> {
		categoriesStore.setLoading(true);

		try {
			const response = await api.get<Category>(`/expenses/categories/${id}/`);

			if (response.error) {
				categoriesStore.setError(response.error.message);
				return null;
			}

			// Set selected category in store
			categoriesStore.selectCategory(response.data!);
			return response.data!;
		} catch (error) {
			const message = error instanceof Error ? error.message : 'Failed to fetch category';
			categoriesStore.setError(message);
			return null;
		} finally {
			categoriesStore.setLoading(false);
		}
	},

	/**
	 * Create a new category
	 */
	async createCategory(categoryData: CategoryFormData): Promise<Category | null> {
		categoriesStore.setCreating(true);

		try {
			const response = await api.post<Category>('/expenses/categories/', categoryData);

			if (response.error) {
				categoriesStore.setError(response.error.message);
				toastStore.error(`Failed to create category: ${response.error.message}`);
				return null;
			}

			// Add to store and show success toast
			categoriesStore.addCategory(response.data!);
			toastStore.success('Category created successfully');

			return response.data!;
		} catch (error) {
			const message = error instanceof Error ? error.message : 'Failed to create category';
			categoriesStore.setError(message);
			toastStore.error(message);
			return null;
		} finally {
			categoriesStore.setCreating(false);
		}
	},

	/**
	 * Update an existing category
	 */
	async updateCategory(id: string, categoryData: CategoryFormData): Promise<Category | null> {
		categoriesStore.setUpdating(true);

		try {
			const response = await api.put<Category>(`/expenses/categories/${id}/`, categoryData);

			if (response.error) {
				categoriesStore.setError(response.error.message);
				toastStore.error(`Failed to update category: ${response.error.message}`);
				return null;
			}

			// Update in store and show success toast
			categoriesStore.updateCategory(response.data!);
			toastStore.success('Category updated successfully');

			return response.data!;
		} catch (error) {
			const message = error instanceof Error ? error.message : 'Failed to update category';
			categoriesStore.setError(message);
			toastStore.error(message);
			return null;
		} finally {
			categoriesStore.setUpdating(false);
		}
	},

	/**
	 * Delete a category
	 */
	async deleteCategory(id: string): Promise<boolean> {
		categoriesStore.setDeleting(true);

		try {
			const response = await api.delete<{ detail: string }>(`/expenses/categories/${id}/`);

			if (response.error) {
				// Check for special error cases
				if (response.error.message.includes('Cannot delete category with expenses')) {
					toastStore.error(
						'This category has expenses linked to it. Please reassign or delete them first.'
					);
					categoriesStore.setError(response.error.message);
					return false;
				}

				categoriesStore.setError(response.error.message);
				toastStore.error(`Failed to delete category: ${response.error.message}`);
				return false;
			}

			// Remove from store and show success toast
			categoriesStore.removeCategory(id);
			toastStore.success('Category deleted successfully');

			return true;
		} catch (error) {
			const message = error instanceof Error ? error.message : 'Failed to delete category';
			categoriesStore.setError(message);
			toastStore.error(message);
			return false;
		} finally {
			categoriesStore.setDeleting(false);
		}
	},

	/**
	 * Create a default set of categories for new users
	 */
	async createDefaultCategories(): Promise<boolean> {
		const defaultCategories: CategoryFormData[] = [
			{
				name: 'Housing',
				description: 'Rent, mortgage, repairs, and home maintenance',
				color: '#3B82F6', // Blue
				icon: 'home',
				is_default: false
			},
			{
				name: 'Food',
				description: 'Groceries, dining out, and food delivery',
				color: '#10B981', // Green
				icon: 'utensils',
				is_default: false
			},
			{
				name: 'Transportation',
				description: 'Gas, public transit, car maintenance, and rideshares',
				color: '#F59E0B', // Amber
				icon: 'car',
				is_default: false
			},
			{
				name: 'Entertainment',
				description: 'Movies, events, subscriptions, and hobbies',
				color: '#8B5CF6', // Purple
				icon: 'film',
				is_default: false
			},
			{
				name: 'Shopping',
				description: 'Clothing, electronics, and other retail purchases',
				color: '#EC4899', // Pink
				icon: 'shopping-bag',
				is_default: false
			},
			{
				name: 'Utilities',
				description: 'Electricity, water, internet, and phone',
				color: '#6366F1', // Indigo
				icon: 'bolt',
				is_default: false
			},
			{
				name: 'Healthcare',
				description: 'Doctor visits, medications, and insurance',
				color: '#EF4444', // Red
				icon: 'heart',
				is_default: false
			},
			{
				name: 'Education',
				description: 'Tuition, books, and courses',
				color: '#F97316', // Orange
				icon: 'book',
				is_default: false
			},
			{
				name: 'Personal Care',
				description: 'Haircuts, gym membership, and cosmetics',
				color: '#14B8A6', // Teal
				icon: 'user',
				is_default: false
			},
			{
				name: 'Miscellaneous',
				description: 'All other expenses',
				color: '#6B7280', // Gray
				icon: 'ellipsis-h',
				is_default: true
			}
		];

		try {
			let success = true;
			// Create each default category
			for (const categoryData of defaultCategories) {
				const result = await this.createCategory(categoryData);
				if (!result) {
					success = false;
				}
			}

			return success;
		} catch (error) {
			const message =
				error instanceof Error ? error.message : 'Failed to create default categories';
			categoriesStore.setError(message);
			toastStore.error(message);
			return false;
		}
	},

	/**
	 * Set a category as the default
	 */
	async setDefaultCategory(id: string): Promise<boolean> {
		categoriesStore.setUpdating(true);

		try {
			// Get the category first
			const category = await this.getCategoryById(id);
			if (!category) {
				return false;
			}

			// Update to make it the default
			const response = await api.put<Category>(`/expenses/categories/${id}/`, {
				...category,
				is_default: true
			});

			if (response.error) {
				categoriesStore.setError(response.error.message);
				return false;
			}

			// Get all categories again to refresh with the new default
			await this.getCategories();

			toastStore.success(`${category.name} set as default category`);
			return true;
		} catch (error) {
			const message = error instanceof Error ? error.message : 'Failed to set default category';
			categoriesStore.setError(message);
			return false;
		} finally {
			categoriesStore.setUpdating(false);
		}
	}
};
