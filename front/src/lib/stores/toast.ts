/**
 * Toast Notification Store
 *
 * A comprehensive toast notification system with support for:
 * - Multiple toast types (success, error, info, warning)
 * - Customizable durations
 * - Toast stacking
 * - Animated transitions
 * - Programmatic dismissal
 */

import { writable, derived } from 'svelte/store';
import { browser } from '$app/environment';

// Types
export type ToastType = 'success' | 'error' | 'warning' | 'info';
export type ToastPosition =
	| 'top-right'
	| 'top-left'
	| 'bottom-right'
	| 'bottom-left'
	| 'top-center'
	| 'bottom-center';

export interface Toast {
	id: string;
	type: ToastType;
	message: string;
	title?: string;
	duration: number;
	dismissible: boolean;
	timestamp: number;
	action?: {
		label: string;
		callback: () => void;
	};
}

export interface ToastOptions {
	type?: ToastType;
	title?: string;
	duration?: number;
	dismissible?: boolean;
	action?: {
		label: string;
		callback: () => void;
	};
}

export interface ToastState {
	toasts: Toast[];
	position: ToastPosition;
	pauseOnHover: boolean;
	maxToasts: number;
}

// Default options
const DEFAULT_DURATION = 5000; // 5 seconds
const DEFAULT_POSITION: ToastPosition = 'bottom-right';
const DEFAULT_MAX_TOASTS = 5;

// Create the toast store
const createToastStore = () => {
	// Initial state
	const initialState: ToastState = {
		toasts: [],
		position: DEFAULT_POSITION,
		pauseOnHover: true,
		maxToasts: DEFAULT_MAX_TOASTS
	};

	// Create the writable store
	const { subscribe, update } = writable<ToastState>(initialState);

	// Return the enhanced store with toast-specific methods
	return {
		subscribe,

		/**
		 * Show a toast notification
		 *
		 * @param message Toast message
		 * @param options Toast options
		 * @returns Toast ID for programmatic dismissal
		 */
		show: (message: string, options: ToastOptions = {}): string => {
			const id = generateId();

			// Create the toast with defaults merged with options
			const toast: Toast = {
				id,
				message,
				type: options.type || 'info',
				title: options.title,
				duration: options.duration || DEFAULT_DURATION,
				dismissible: options.dismissible !== undefined ? options.dismissible : true,
				timestamp: Date.now(),
				action: options.action
			};

			// Add toast to the store
			update((state) => {
				// Add new toast to the beginning of the array
				let updatedToasts = [toast, ...state.toasts];

				// Limit number of toasts if needed
				if (updatedToasts.length > state.maxToasts) {
					updatedToasts = updatedToasts.slice(0, state.maxToasts);
				}

				return {
					...state,
					toasts: updatedToasts
				};
			});

			// Auto-dismiss the toast after duration (if in browser)
			if (browser && toast.duration > 0) {
				setTimeout(() => {
					this.dismiss(id);
				}, toast.duration);
			}

			return id;
		},

		/**
		 * Show a success toast
		 *
		 * @param message Toast message
		 * @param options Toast options
		 * @returns Toast ID
		 */
		success: (message: string, options: Omit<ToastOptions, 'type'> = {}) => {
			return this.show(message, { ...options, type: 'success' });
		},

		/**
		 * Show an error toast
		 *
		 * @param message Toast message
		 * @param options Toast options
		 * @returns Toast ID
		 */
		error: (message: string, options: Omit<ToastOptions, 'type'> = {}) => {
			return this.show(message, { ...options, type: 'error' });
		},

		/**
		 * Show a warning toast
		 *
		 * @param message Toast message
		 * @param options Toast options
		 * @returns Toast ID
		 */
		warning: (message: string, options: Omit<ToastOptions, 'type'> = {}) => {
			return this.show(message, { ...options, type: 'warning' });
		},

		/**
		 * Show an info toast
		 *
		 * @param message Toast message
		 * @param options Toast options
		 * @returns Toast ID
		 */
		info: (message: string, options: Omit<ToastOptions, 'type'> = {}) => {
			return this.show(message, { ...options, type: 'info' });
		},

		/**
		 * Dismiss a specific toast by ID
		 *
		 * @param id Toast ID to dismiss
		 */
		dismiss: (id: string) => {
			update((state) => ({
				...state,
				toasts: state.toasts.filter((toast) => toast.id !== id)
			}));
		},

		/**
		 * Dismiss all toasts
		 */
		dismissAll: () => {
			update((state) => ({
				...state,
				toasts: []
			}));
		},

		/**
		 * Set toast position
		 *
		 * @param position New position
		 */
		setPosition: (position: ToastPosition) => {
			update((state) => ({
				...state,
				position
			}));
		},

		/**
		 * Set whether toasts should pause on hover
		 *
		 * @param pause Whether to pause on hover
		 */
		setPauseOnHover: (pause: boolean) => {
			update((state) => ({
				...state,
				pauseOnHover: pause
			}));
		},

		/**
		 * Set maximum number of toasts to show at once
		 *
		 * @param max Maximum number of toasts
		 */
		setMaxToasts: (max: number) => {
			update((state) => {
				// Limit existing toasts if needed
				let updatedToasts = state.toasts;
				if (updatedToasts.length > max) {
					updatedToasts = updatedToasts.slice(0, max);
				}

				return {
					...state,
					maxToasts: max,
					toasts: updatedToasts
				};
			});
		}
	};
};

// Generate a unique ID for each toast
function generateId(): string {
	return Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
}

// Create and export the toast store
export const toastStore = createToastStore();

// Derived stores for easier access
export const toasts = derived(toastStore, ($store) => $store.toasts);
export const position = derived(toastStore, ($store) => $store.position);
export const pauseOnHover = derived(toastStore, ($store) => $store.pauseOnHover);
