/**
 * Authentication Store
 *
 * This module provides a centralized store for managing authentication state
 * across the application. It leverages Svelte 5's runes system for reactive
 * state management and TypeScript for type safety.
 *
 * Key features:
 * - JWT-based authentication with access and refresh tokens
 * - Persistent authentication state (localStorage)
 * - Token validation and automatic refresh
 * - Type-safe state management
 * - Error handling
 */

import { writable, derived, get } from 'svelte/store';
import { browser } from '$app/environment';
import type { User, AuthTokens, AuthState } from '$lib/types/auth.types';
import { isTokenValid, parseToken, decodeToken } from '$lib/utils/token';

// Storage key for localStorage persistence
const STORAGE_KEY = 'auth_state';

/**
 * Creates and manages the authentication store
 *
 * @returns An enhanced writable store with authentication methods
 */
const createAuthStore = () => {
	// Default state for unauthenticated users
	const DEFAULT_STATE: AuthState = {
		user: null,
		tokens: null,
		isAuthenticated: false,
		isLoading: true,
		error: null,
		message: null
	};

	// Create the writable store with initial state
	const { subscribe, set, update } = writable<AuthState>({ ...DEFAULT_STATE });

	// Enhanced store with auth-specific methods
	return {
		subscribe,

		/**
		 * Updates the internal store state
		 * @private For internal use by auth methods
		 */
		_update: update,

		/**
		 * Initialize the auth store from localStorage
		 * Called during app initialization to restore authentication state
		 */
		init: () => {
			update((state) => ({ ...state, isLoading: true }));

			if (browser) {
				try {
					const stored = localStorage.getItem(STORAGE_KEY);

					if (stored) {
						const authData = JSON.parse(stored);

						// Validate token to ensure it's not expired
						if (authData?.tokens?.access && isTokenValid(authData.tokens.access)) {
							console.info('Valid auth token found, restoring session state');

							// Verify token data matches user data for security
							const tokenData = decodeToken(authData.tokens.access);

							if (tokenData?.user_id === authData.user?.id) {
								update((state) => ({
									...state,
									...authData,
									isAuthenticated: true,
									isLoading: false
								}));
								return;
							}

							console.warn('Token user mismatch, clearing auth state');
						} else {
							console.info('Expired token found, clearing auth state');
						}

						// Clear invalid state
						localStorage.removeItem(STORAGE_KEY);
					}
				} catch (error) {
					console.error('Error restoring auth state:', error);
					localStorage.removeItem(STORAGE_KEY);
				}
			}

			// Reset to default unauthenticated state
			update((state) => ({ ...DEFAULT_STATE, isLoading: false }));
		},

		/**
		 * Set the authenticated user and tokens
		 * @param user User object
		 * @param tokens Authentication tokens
		 */
		setAuth: (user: User, tokens: AuthTokens) => {
			// Create new auth state
			const authData = {
				user,
				tokens,
				isAuthenticated: true,
				isLoading: false,
				error: null,
				message: null
			};

			// Save to localStorage for persistence
			if (browser) {
				try {
					localStorage.setItem(STORAGE_KEY, JSON.stringify({ user, tokens }));
				} catch (error) {
					console.error('Failed to save auth state to localStorage:', error);
				}
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
					try {
						localStorage.setItem(
							STORAGE_KEY,
							JSON.stringify({
								user,
								tokens: state.tokens
							})
						);
					} catch (error) {
						console.error('Failed to update user in localStorage:', error);
					}
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
				try {
					localStorage.removeItem(STORAGE_KEY);
				} catch (error) {
					console.error('Failed to clear auth state from localStorage:', error);
				}
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
					throw new Error(`Token refresh failed: ${response.status}`);
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
						try {
							localStorage.setItem(
								STORAGE_KEY,
								JSON.stringify({ user: state.user, tokens: newTokens })
							);
						} catch (error) {
							console.error('Failed to update tokens in localStorage:', error);
						}
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

// Create and export the auth store singleton
export const authStore = createAuthStore();

// Derived stores for easier access to specific properties
export const user = derived(authStore, ($authStore) => $authStore.user);
export const isAuthenticated = derived(authStore, ($authStore) => $authStore.isAuthenticated);
export const isLoading = derived(authStore, ($authStore) => $authStore.isLoading);
export const authError = derived(authStore, ($authStore) => $authStore.error);
export const authMessage = derived(authStore, ($authStore) => $authStore.message);

// Helper function to get a synchronous value from the store
export const getAuthState = (): AuthState => get(authStore);
