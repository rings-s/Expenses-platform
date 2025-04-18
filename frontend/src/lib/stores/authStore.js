// src/lib/stores/authStore.js
import { writable } from 'svelte/store';
import authService from '../services/authService';
import { userStore } from './userStore';

const browser = typeof window !== 'undefined';

function createAuthStore() {
	const { subscribe, set, update } = writable({
		isAuthenticated: browser ? authService.isAuthenticated() : false,
		loading: false,
		error: null
	});

	return {
		subscribe,

		/**
		 * Initialize the auth store
		 */
		initialize: async () => {
			if (!browser) return;

			// Check if token exists and is valid
			if (authService.isAuthenticated()) {
				try {
					update((state) => ({ ...state, loading: true }));

					// Try to get user profile to validate token
					await userStore.loadProfile();

					update((state) => ({
						...state,
						isAuthenticated: true,
						loading: false,
						error: null
					}));
				} catch (error) {
					// If token is invalid, try to refresh it
					const refreshed = await authService.refreshToken();

					if (refreshed) {
						await userStore.loadProfile();
						update((state) => ({
							...state,
							isAuthenticated: true,
							loading: false,
							error: null
						}));
					} else {
						// If refresh fails, logout
						authService.logout();
						update((state) => ({
							...state,
							isAuthenticated: false,
							loading: false,
							error: null
						}));
					}
				}
			}
		},

		/**
		 * Login a user
		 */
		login: async (credentials) => {
			try {
				update((state) => ({ ...state, loading: true, error: null }));

				const response = await authService.login(credentials);

				// Load user profile after login
				await userStore.loadProfile();

				update((state) => ({
					...state,
					isAuthenticated: true,
					loading: false
				}));

				return response;
			} catch (error) {
				update((state) => ({
					...state,
					isAuthenticated: false,
					loading: false,
					error: error.message
				}));

				throw error;
			}
		},

		/**
		 * Register a new user
		 */
		register: async (userData) => {
			try {
				update((state) => ({ ...state, loading: true, error: null }));

				const response = await authService.register(userData);

				// Load user profile after registration
				await userStore.loadProfile();

				update((state) => ({
					...state,
					isAuthenticated: true,
					loading: false
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
		 * Logout a user
		 */
		logout: async () => {
			try {
				update((state) => ({ ...state, loading: true }));

				await authService.logout();
				userStore.reset();

				update((state) => ({
					...state,
					isAuthenticated: false,
					loading: false,
					error: null
				}));
			} catch (error) {
				update((state) => ({
					...state,
					loading: false,
					error: error.message
				}));
			}
		},

		/**
		 * Clear any auth errors
		 */
		clearError: () => {
			update((state) => ({ ...state, error: null }));
		}
	};
}

export const authStore = createAuthStore();
