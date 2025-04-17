import { writable, derived } from 'svelte/store';
import { browser } from '$app/environment';
import type { User, AuthTokens, AuthState } from '$lib/types/auth.types';
import { isTokenValid, parseToken } from '$lib/utils/token';

// Create the initial auth state
const createAuthStore = () => {
	const STORAGE_KEY = 'auth';
	const DEFAULT_STATE: AuthState = {
		user: null,
		tokens: null,
		isAuthenticated: false,
		isLoading: true,
		error: null
	};

	// Create the writable store with initial state
	const { subscribe, set, update } = writable<AuthState>({ ...DEFAULT_STATE });

	return {
		subscribe,
		_update: update, // Expose update method for internal use

		/**
		 * Initialize the auth store from localStorage
		 */
		init: () => {
			update((state) => ({ ...state, isLoading: true }));

			if (browser) {
				// Try to get auth data from localStorage
				try {
					const stored = localStorage.getItem(STORAGE_KEY);
					if (stored) {
						const authData = JSON.parse(stored);

						// Validate token to ensure it's not expired
						if (
							authData &&
							authData.tokens &&
							authData.tokens.access &&
							isTokenValid(authData.tokens.access)
						) {
							console.log('Valid token found, restoring auth state');
							update((state) => ({
								...state,
								...authData,
								isAuthenticated: true,
								isLoading: false
							}));
							return;
						} else {
							console.log('Expired token found, clearing auth state');
							localStorage.removeItem(STORAGE_KEY);
						}
					}
				} catch (error) {
					console.error('Error restoring auth state:', error);
					localStorage.removeItem(STORAGE_KEY);
				}
			}

			// If no valid auth data was found or not in browser, set to not authenticated
			update((state) => ({ ...DEFAULT_STATE, isLoading: false }));
		},

		/**
		 * Set the authenticated user and tokens
		 * @param user User object
		 * @param tokens Authentication tokens
		 */
		setAuth: (user: User, tokens: AuthTokens) => {
			const authData = { user, tokens, isAuthenticated: true, isLoading: false, error: null };

			// Save to localStorage
			if (browser) {
				localStorage.setItem(STORAGE_KEY, JSON.stringify({ user, tokens }));
			}

			// Update the store
			set(authData);
		},

		/**
		 * Update just the user portion of the auth state
		 * @param user Updated user object
		 */
		updateUser: (user: User) => {
			update((state) => {
				const newState = { ...state, user };

				// Update localStorage
				if (browser && state.tokens) {
					localStorage.setItem(STORAGE_KEY, JSON.stringify({ user, tokens: state.tokens }));
				}

				return newState;
			});
		},

		/**
		 * Logout the user and clear the auth state
		 */
		logout: () => {
			// Clear localStorage
			if (browser) {
				localStorage.removeItem(STORAGE_KEY);
			}

			// Reset store to initial state
			set({ ...DEFAULT_STATE, isLoading: false });
		},

		/**
		 * Set an error message
		 * @param error Error message
		 */
		setError: (error: string) => {
			update((state) => ({ ...state, error }));
		},

		/**
		 * Clear the current error
		 */
		clearError: () => {
			update((state) => ({ ...state, error: null }));
		},

		/**
		 * Set a system message
		 * @param message System message
		 */
		setMessage: (message: string) => {
			update((state) => ({ ...state, message }));
		},

		/**
		 * Clear the current message
		 */
		clearMessage: () => {
			update((state) => ({ ...state, message: null }));
		},

		/**
		 * Refresh the access token
		 * @param refreshToken Refresh token to use
		 * @returns Promise<boolean> indicating success
		 */
		refreshToken: async (refreshToken: string): Promise<boolean> => {
			try {
				const response = await fetch(
					`${import.meta.env.VITE_API_URL || '/api'}/accounts/token/refresh/`,
					{
						method: 'POST',
						headers: {
							'Content-Type': 'application/json'
						},
						body: JSON.stringify({ refresh: refreshToken })
					}
				);

				if (!response.ok) {
					throw new Error('Token refresh failed');
				}

				const data = await response.json();

				update((state) => {
					// Create new tokens object, keeping the refresh token if a new one wasn't provided
					const newTokens = {
						...state.tokens,
						access: data.access,
						...(data.refresh && { refresh: data.refresh })
					};

					// Update localStorage
					if (browser && state.user) {
						localStorage.setItem(
							STORAGE_KEY,
							JSON.stringify({ user: state.user, tokens: newTokens })
						);
					}

					return {
						...state,
						tokens: newTokens,
						isAuthenticated: true
					};
				});

				return true;
			} catch (error) {
				console.error('Error refreshing token:', error);
				return false;
			}
		}
	};
};

// Create and export the auth store
export const authStore = createAuthStore();

// Derived stores for easier access to specific properties
export const user = derived(authStore, ($authStore) => $authStore.user);
export const isAuthenticated = derived(authStore, ($authStore) => $authStore.isAuthenticated);
export const isLoading = derived(authStore, ($authStore) => $authStore.isLoading);
export const authError = derived(authStore, ($authStore) => $authStore.error);
export const authMessage = derived(authStore, ($authStore) => $authStore.message);
