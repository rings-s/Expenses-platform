import { writable } from 'svelte/store';
import userService from '../services/userService';

function createUserStore() {
	const { subscribe, set, update } = writable({
		profile: null,
		loading: false,
		error: null
	});

	return {
		subscribe,

		/**
		 * Load user profile
		 */
		loadProfile: async () => {
			try {
				update((state) => ({ ...state, loading: true }));

				const profile = await userService.getProfile();

				update((state) => ({
					...state,
					profile,
					loading: false,
					error: null
				}));

				return profile;
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
		 * Update user profile
		 */
		updateProfile: async (profileData) => {
			try {
				update((state) => ({ ...state, loading: true }));

				const updatedProfile = await userService.updateProfile(profileData);

				update((state) => ({
					...state,
					profile: updatedProfile,
					loading: false,
					error: null
				}));

				return updatedProfile;
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
		 * Reset user state
		 */
		reset: () => {
			set({
				profile: null,
				loading: false,
				error: null
			});
		},

		/**
		 * Clear any user errors
		 */
		clearError: () => {
			update((state) => ({ ...state, error: null }));
		}
	};
}

export const userStore = createUserStore();
