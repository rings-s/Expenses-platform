import { writable } from 'svelte/store';
import categoryService from '../services/categoryService';

function createCategoryStore() {
	const { subscribe, set, update } = writable({
		categories: [],
		loading: false,
		error: null
	});

	return {
		subscribe,

		/**
		 * Load all categories
		 */
		loadCategories: async () => {
			try {
				update((state) => ({ ...state, loading: true }));

				const categories = await categoryService.getCategories();

				update((state) => ({
					...state,
					categories,
					loading: false,
					error: null
				}));

				return categories;
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
		 * Create a new category
		 */
		createCategory: async (categoryData) => {
			try {
				update((state) => ({ ...state, loading: true }));

				const newCategory = await categoryService.createCategory(categoryData);

				update((state) => ({
					...state,
					categories: [...state.categories, newCategory],
					loading: false,
					error: null
				}));

				return newCategory;
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
		 * Update a category
		 */
		updateCategory: async (categoryId, categoryData) => {
			try {
				update((state) => ({ ...state, loading: true }));

				const updatedCategory = await categoryService.updateCategory(categoryId, categoryData);

				update((state) => ({
					...state,
					categories: state.categories.map((cat) =>
						cat.id === categoryId ? updatedCategory : cat
					),
					loading: false,
					error: null
				}));

				return updatedCategory;
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
		 * Delete a category
		 */
		deleteCategory: async (categoryId) => {
			try {
				update((state) => ({ ...state, loading: true }));

				await categoryService.deleteCategory(categoryId);

				update((state) => ({
					...state,
					categories: state.categories.filter((cat) => cat.id !== categoryId),
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
		 * Clear any category errors
		 */
		clearError: () => {
			update((state) => ({ ...state, error: null }));
		}
	};
}

export const categoryStore = createCategoryStore();
