/**
 * UI Store
 *
 * Central store for managing global UI state:
 * - Theme (light/dark)
 * - Sidebar visibility
 * - Modal management
 * - Responsive breakpoints
 * - Global loading states
 */

import { writable, derived, get } from 'svelte/store';
import { browser } from '$app/environment';

// Types for UI store
export interface Modal {
	id: string;
	component: any;
	props?: Record<string, any>;
	options?: {
		closable?: boolean;
		closeOnClickOutside?: boolean;
		closeOnEsc?: boolean;
		fullScreen?: boolean;
		width?: string;
	};
}

interface Breakpoint {
	mobile: boolean; // < 640px
	tablet: boolean; // >= 640px
	desktop: boolean; // >= 1024px
	wide: boolean; // >= 1280px
}

export interface UIState {
	// Theme
	theme: 'light' | 'dark' | 'system';

	// Sidebar
	sidebarOpen: boolean;
	sidebarWidth: number;
	sidebarCollapsed: boolean;

	// Modals
	modals: Modal[];

	// Responsive
	breakpoints: Breakpoint;

	// Loading states
	pageLoading: boolean;
	globalLoading: boolean;
	loadingStates: Record<string, boolean>;
}

// Create the UI store
const createUIStore = () => {
	// Determine initial theme
	let initialTheme: 'light' | 'dark' | 'system' = 'system';

	if (browser) {
		// Check localStorage
		const storedTheme = localStorage.getItem('theme') as 'light' | 'dark' | 'system' | null;
		if (storedTheme) {
			initialTheme = storedTheme;
		}

		// Apply theme immediately
		applyTheme(initialTheme);
	}

	// Initial state
	const initialState: UIState = {
		theme: initialTheme,
		sidebarOpen: true,
		sidebarWidth: 280,
		sidebarCollapsed: false,
		modals: [],
		breakpoints: {
			mobile: false,
			tablet: false,
			desktop: false,
			wide: false
		},
		pageLoading: false,
		globalLoading: false,
		loadingStates: {}
	};

	// Create the writable store
	const { subscribe, update, set } = writable<UIState>(initialState);

	return {
		subscribe,

		/**
		 * Initialize the UI store
		 * Sets up event listeners for responsive behavior
		 */
		init: () => {
			if (browser) {
				// Initialize theme
				const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
				const theme = get({ subscribe }).theme;

				if (theme === 'system') {
					document.documentElement.classList.toggle('dark', prefersDark);
				}

				// Set up responsive breakpoints
				const updateBreakpoints = () => {
					update((state) => ({
						...state,
						breakpoints: {
							mobile: window.innerWidth < 640,
							tablet: window.innerWidth >= 640,
							desktop: window.innerWidth >= 1024,
							wide: window.innerWidth >= 1280
						},
						// Automatically close sidebar on mobile
						sidebarOpen: window.innerWidth >= 1024 ? state.sidebarOpen : false
					}));
				};

				// Initial breakpoint check
				updateBreakpoints();

				// Listen for window resize
				window.addEventListener('resize', updateBreakpoints);

				// Listen for theme changes
				window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (event) => {
					const uiState = get({ subscribe });
					if (uiState.theme === 'system') {
						document.documentElement.classList.toggle('dark', event.matches);
					}
				});

				// Return cleanup function
				return () => {
					window.removeEventListener('resize', updateBreakpoints);
				};
			}
		},

		/**
		 * Toggle dark/light theme
		 */
		toggleTheme: () => {
			update((state) => {
				const currentTheme = state.theme;
				let newTheme: 'light' | 'dark' | 'system';

				// Rotate through themes
				if (currentTheme === 'light') newTheme = 'dark';
				else if (currentTheme === 'dark') newTheme = 'system';
				else newTheme = 'light';

				// Store in localStorage
				if (browser) {
					localStorage.setItem('theme', newTheme);
					applyTheme(newTheme);
				}

				return {
					...state,
					theme: newTheme
				};
			});
		},

		/**
		 * Set a specific theme
		 */
		setTheme: (theme: 'light' | 'dark' | 'system') => {
			update((state) => {
				// Store in localStorage
				if (browser) {
					localStorage.setItem('theme', theme);
					applyTheme(theme);
				}

				return {
					...state,
					theme
				};
			});
		},

		/**
		 * Toggle sidebar visibility
		 */
		toggleSidebar: () => {
			update((state) => ({
				...state,
				sidebarOpen: !state.sidebarOpen
			}));
		},

		/**
		 * Open the sidebar
		 */
		openSidebar: () => {
			update((state) => ({
				...state,
				sidebarOpen: true
			}));
		},

		/**
		 * Close the sidebar
		 */
		closeSidebar: () => {
			update((state) => ({
				...state,
				sidebarOpen: false
			}));
		},

		/**
		 * Toggle sidebar collapsed state
		 */
		toggleSidebarCollapsed: () => {
			update((state) => ({
				...state,
				sidebarCollapsed: !state.sidebarCollapsed
			}));
		},

		/**
		 * Set sidebar width
		 */
		setSidebarWidth: (width: number) => {
			update((state) => ({
				...state,
				sidebarWidth: width
			}));
		},

		/**
		 * Show a modal
		 * @returns Modal ID for later reference
		 */
		showModal: (component: any, props: Record<string, any> = {}, options = {}) => {
			const id = generateId();

			update((state) => ({
				...state,
				modals: [
					...state.modals,
					{
						id,
						component,
						props,
						options: {
							closable: true,
							closeOnClickOutside: true,
							closeOnEsc: true,
							fullScreen: false,
							width: '500px',
							...options
						}
					}
				]
			}));

			return id;
		},

		/**
		 * Close a modal by ID
		 */
		closeModal: (id: string) => {
			update((state) => ({
				...state,
				modals: state.modals.filter((modal) => modal.id !== id)
			}));
		},

		/**
		 * Close all modals
		 */
		closeAllModals: () => {
			update((state) => ({
				...state,
				modals: []
			}));
		},

		/**
		 * Set page loading state
		 */
		setPageLoading: (loading: boolean) => {
			update((state) => ({
				...state,
				pageLoading: loading
			}));
		},

		/**
		 * Set global loading state
		 */
		setGlobalLoading: (loading: boolean) => {
			update((state) => ({
				...state,
				globalLoading: loading
			}));
		},

		/**
		 * Set a named loading state
		 */
		setLoadingState: (key: string, loading: boolean) => {
			update((state) => ({
				...state,
				loadingStates: {
					...state.loadingStates,
					[key]: loading
				}
			}));
		}
	};
};

// Helper to apply theme to document
function applyTheme(theme: 'light' | 'dark' | 'system') {
	if (browser) {
		if (theme === 'dark') {
			document.documentElement.classList.add('dark');
		} else if (theme === 'light') {
			document.documentElement.classList.remove('dark');
		} else {
			// System theme - check user preference
			const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
			document.documentElement.classList.toggle('dark', prefersDark);
		}
	}
}

// Generate a unique ID
function generateId(): string {
	return Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
}

// Create and export the store
export const uiStore = createUIStore();

// Derived stores for convenient access to specific parts of the state
export const theme = derived(uiStore, ($store) => $store.theme);
export const sidebarOpen = derived(uiStore, ($store) => $store.sidebarOpen);
export const sidebarCollapsed = derived(uiStore, ($store) => $store.sidebarCollapsed);
export const modals = derived(uiStore, ($store) => $store.modals);
export const breakpoints = derived(uiStore, ($store) => $store.breakpoints);
export const pageLoading = derived(uiStore, ($store) => $store.pageLoading);
export const globalLoading = derived(uiStore, ($store) => $store.globalLoading);
