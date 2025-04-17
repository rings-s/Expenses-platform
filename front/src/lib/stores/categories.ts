/**
 * Categories Store
 *
 * Central store for managing expense categories:
 * - Category listing
 * - Selected category
 * - Category CRUD operations state
 */

import { writable, derived } from 'svelte/store';
import type { Category, CategoryFormData } from '$lib/types/expenses';

// Types for the categories store
interface CategoryState {
	// Data
	categories: Category[];
	selectedCategory: Category | null;

	// State flags
	isLoading: boolean;
	isCreating: boolean;
	isUpdating: boolean;
	isDeleting: boolean;
	error: string | null;
}

// Create the categories store
const createCategoriesStore = () => {
	// Initial state
	const initialState: CategoryState = {
		categories: [],
		selectedCategory: null,
		isLoading: false,
		isCreating: false,
		isUpdating: false,
		isDeleting: false,
		error: null
	};

	// Create the writable store
	const { subscribe, update, set } = writable<CategoryState>(initialState);

	return {
		subscribe,

		/**
		 * Reset the store to initial state
		 */
		reset: () => {
			set(initialState);
		},

		/**
		 * Set categories data (typically from API response)
		 */
		setCategories: (categories: Category[]) => {
			update((state) => ({
				...state,
				categories,
				isLoading: false,
				error: null
			}));
		},

		/**
		 * Set selected category
		 */
		selectCategory: (category: Category | null) => {
			update((state) => ({
				...state,
				selectedCategory: category
			}));
		},

		/**
		 * Select category by ID
		 */
		selectCategoryById: (id: string) => {
			update((state) => {
				// Find category in the current list
				const category = state.categories.find((c) => c.id === id) || null;

				return {
					...state,
					selectedCategory: category
				};
			});
		},

		/**
		 * Add a new category to the store (after creation)
		 */
		addCategory: (category: Category) => {
			update((state) => {
				// Add to list and sort alphabetically
				const updatedCategories = [...state.categories, category].sort((a, b) =>
					a.name.localeCompare(b.name)
				);

				return {
					...state,
					categories: updatedCategories,
					isCreating: false
				};
			});
		},

		/**
		 * Update an existing category in the store
		 */
		updateCategory: (updatedCategory: Category) => {
			update((state) => {
				// Update in categories list
				const updatedCategories = state.categories
					.map((category) => (category.id === updatedCategory.id ? updatedCategory : category))
					.sort((a, b) => a.name.localeCompare(b.name));

				// Update selected category if it's the same one
				const updatedSelectedCategory =
					state.selectedCategory?.id === updatedCategory.id
						? updatedCategory
						: state.selectedCategory;

				return {
					...state,
					categories: updatedCategories,
					selectedCategory: updatedSelectedCategory,
					isUpdating: false
				};
			});
		},

		/**
		 * Remove a category from the store
		 */
		removeCategory: (id: string) => {
			update((state) => {
				// Remove from categories list
				const updatedCategories = state.categories.filter((category) => category.id !== id);

				// Clear selected category if it's the same one
				const updatedSelectedCategory =
					state.selectedCategory?.id === id ? null : state.selectedCategory;

				return {
					...state,
					categories: updatedCategories,
					selectedCategory: updatedSelectedCategory,
					isDeleting: false
				};
			});
		},

		/**
		 * Get a category from the store by ID
		 */
		getCategoryById: (id: string | null): Category | undefined => {
			if (!id) return undefined;

			const state = get(this);
			return state.categories.find((c) => c.id === id);
		},

		/**
		 * Get a category from the store by name
		 */
		getCategoryByName: (name: string): Category | undefined => {
			const state = get(this);
			return state.categories.find((c) => c.name.toLowerCase() === name.toLowerCase());
		},

		/**
		 * Get the default category
		 */
		getDefaultCategory: (): Category | undefined => {
			const state = get(this);
			return state.categories.find((c) => c.is_default);
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

// Helper function to get store value synchronously
function get<T>(store: { subscribe: (callback: (value: T) => void) => () => void }): T {
	let value: T;
	const unsubscribe = store.subscribe((val: T) => {
		value = val;
	});
	unsubscribe();
	return value!;
}

// Create and export the store
export const categoriesStore = createCategoriesStore();

// Derived stores for convenient access
export const categories = derived(categoriesStore, ($store) => $store.categories);
export const selectedCategory = derived(categoriesStore, ($store) => $store.selectedCategory);
export const categoriesLoading = derived(categoriesStore, ($store) => $store.isLoading);
export const categoriesError = derived(categoriesStore, ($store) => $store.error);
export const defaultCategory = derived(
	categoriesStore,
	($store) => $store.categories.find((c) => c.is_default) || null
);

// Create a map of category IDs to names for easy lookups
export const categoryMap = derived(categoriesStore, ($store) => {
	const map: Record<string, Category> = {};
	$store.categories.forEach((category) => {
		map[category.id] = category;
	});
	return map;
});

// Group categories by color for visualization
export const categoriesByColor = derived(categoriesStore, ($store) => {
	const grouped: Record<string, Category[]> = {};
	$store.categories.forEach((category) => {
		if (!grouped[category.color]) {
			grouped[category.color] = [];
		}
		grouped[category.color].push(category);
	});
	return grouped;
});
