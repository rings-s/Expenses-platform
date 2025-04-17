/**
 * Helper Utilities
 *
 * General utility functions for various purposes:
 * - Data manipulation
 * - DOM operations
 * - Object and array helpers
 * - ID generation
 * - Color utilities
 */

import type { Category } from '$lib/types/expenses';

/**
 * Generate a random ID of specified length
 *
 * @param length Length of the ID (default: 8)
 * @returns Random alphanumeric ID
 */
export function generateId(length: number = 8): string {
	const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	let result = '';

	for (let i = 0; i < length; i++) {
		result += chars.charAt(Math.floor(Math.random() * chars.length));
	}

	return result;
}

/**
 * Generate a unique ID with timestamp and random component
 *
 * @returns Unique ID
 */
export function generateUniqueId(): string {
	return `${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Deep clone an object or array
 *
 * @param obj Object to clone
 * @returns Deep cloned copy
 */
export function deepClone<T>(obj: T): T {
	if (obj === null || typeof obj !== 'object') {
		return obj;
	}

	// Handle Date objects
	if (obj instanceof Date) {
		return new Date(obj.getTime()) as unknown as T;
	}

	// Handle Array objects
	if (Array.isArray(obj)) {
		return obj.map((item) => deepClone(item)) as unknown as T;
	}

	// Handle regular objects
	const clonedObj: any = {};

	Object.entries(obj as Record<string, any>).forEach(([key, value]) => {
		clonedObj[key] = deepClone(value);
	});

	return clonedObj as T;
}

/**
 * Deep merge two objects
 *
 * @param target Target object to merge into
 * @param source Source object to merge from
 * @returns Merged object
 */
export function deepMerge<T extends Record<string, any>>(target: T, source: Partial<T>): T {
	const result = { ...target };

	Object.keys(source).forEach((key) => {
		const sourceValue = source[key];
		const targetValue = target[key];

		if (
			sourceValue !== null &&
			typeof sourceValue === 'object' &&
			!Array.isArray(sourceValue) &&
			targetValue !== null &&
			typeof targetValue === 'object' &&
			!Array.isArray(targetValue)
		) {
			// Recursively merge nested objects
			result[key] = deepMerge(targetValue, sourceValue);
		} else {
			// Replace or add simple values or arrays
			result[key] = sourceValue !== undefined ? sourceValue : targetValue;
		}
	});

	return result;
}

/**
 * Check if an object is empty
 *
 * @param obj Object to check
 * @returns True if the object has no properties
 */
export function isEmptyObject(obj: Record<string, any>): boolean {
	if (!obj) return true;
	return Object.keys(obj).length === 0;
}

/**
 * Group an array of objects by a property
 *
 * @param array Array to group
 * @param key Property key to group by
 * @returns Object with groups
 */
export function groupBy<T extends Record<string, any>>(
	array: T[],
	key: keyof T
): Record<string, T[]> {
	return array.reduce(
		(result, item) => {
			const groupKey = String(item[key] || 'undefined');

			if (!result[groupKey]) {
				result[groupKey] = [];
			}

			result[groupKey].push(item);
			return result;
		},
		{} as Record<string, T[]>
	);
}

/**
 * Sum an array of numbers or objects with a numeric property
 *
 * @param array Array to sum
 * @param key Property key for objects (optional)
 * @returns Sum of values
 */
export function sum(array: (number | Record<string, any>)[], key?: string): number {
	return array.reduce((total, item) => {
		const value = key ? Number(item[key] || 0) : typeof item === 'number' ? item : 0;
		return total + (isNaN(value) ? 0 : value);
	}, 0);
}

/**
 * Calculate the average of an array of numbers or objects with a numeric property
 *
 * @param array Array to average
 * @param key Property key for objects (optional)
 * @returns Average value
 */
export function average(array: (number | Record<string, any>)[], key?: string): number {
	if (array.length === 0) return 0;
	return sum(array, key) / array.length;
}

/**
 * Get a random element from an array
 *
 * @param array Source array
 * @returns Random element
 */
export function randomItem<T>(array: T[]): T | undefined {
	if (array.length === 0) return undefined;
	return array[Math.floor(Math.random() * array.length)];
}

/**
 * Shuffle an array
 *
 * @param array Array to shuffle
 * @returns New shuffled array
 */
export function shuffle<T>(array: T[]): T[] {
	const newArray = [...array];

	for (let i = newArray.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[newArray[i], newArray[j]] = [newArray[j], newArray[i]];
	}

	return newArray;
}

/**
 * Sort categories by name
 *
 * @param categories Array of categories
 * @param direction Sort direction (asc/desc)
 * @returns Sorted array
 */
export function sortCategoriesByName(
	categories: Category[],
	direction: 'asc' | 'desc' = 'asc'
): Category[] {
	return [...categories].sort((a, b) => {
		const comparison = a.name.localeCompare(b.name);
		return direction === 'asc' ? comparison : -comparison;
	});
}

/**
 * Sort by a property
 *
 * @param array Array to sort
 * @param key Property key
 * @param direction Sort direction (asc/desc)
 * @returns Sorted array
 */
export function sortBy<T extends Record<string, any>>(
	array: T[],
	key: keyof T,
	direction: 'asc' | 'desc' = 'asc'
): T[] {
	return [...array].sort((a, b) => {
		const valueA = a[key];
		const valueB = b[key];

		// Handle string comparison
		if (typeof valueA === 'string' && typeof valueB === 'string') {
			const comparison = valueA.localeCompare(valueB);
			return direction === 'asc' ? comparison : -comparison;
		}

		// Handle number comparison
		if (typeof valueA === 'number' && typeof valueB === 'number') {
			return direction === 'asc' ? valueA - valueB : valueB - valueA;
		}

		// Handle date comparison
		if (valueA instanceof Date && valueB instanceof Date) {
			return direction === 'asc'
				? valueA.getTime() - valueB.getTime()
				: valueB.getTime() - valueA.getTime();
		}

		// Handle mixed cases
		const comparison = String(valueA).localeCompare(String(valueB));
		return direction === 'asc' ? comparison : -comparison;
	});
}

/**
 * Filter out undefined and null values from an object
 *
 * @param obj Object to clean
 * @returns Cleaned object
 */
export function cleanObject<T extends Record<string, any>>(obj: T): Partial<T> {
	const result: Partial<T> = {};

	Object.entries(obj).forEach(([key, value]) => {
		if (value !== undefined && value !== null) {
			result[key as keyof T] = value;
		}
	});

	return result;
}

/**
 * Ensure a value is within a range
 *
 * @param value Value to clamp
 * @param min Minimum value
 * @param max Maximum value
 * @returns Clamped value
 */
export function clamp(value: number, min: number, max: number): number {
	return Math.max(min, Math.min(max, value));
}

/**
 * Delay/debounce a function call
 *
 * @param fn Function to debounce
 * @param ms Delay in milliseconds
 * @returns Debounced function
 */
export function debounce<T extends (...args: any[]) => any>(
	fn: T,
	ms: number = 300
): (...args: Parameters<T>) => void {
	let timeoutId: ReturnType<typeof setTimeout>;

	return function (...args: Parameters<T>): void {
		clearTimeout(timeoutId);
		timeoutId = setTimeout(() => fn(...args), ms);
	};
}

/**
 * Throttle a function call
 *
 * @param fn Function to throttle
 * @param ms Minimum time between calls in milliseconds
 * @returns Throttled function
 */
export function throttle<T extends (...args: any[]) => any>(
	fn: T,
	ms: number = 300
): (...args: Parameters<T>) => void {
	let canCall = true;

	return function (...args: Parameters<T>): void {
		if (!canCall) return;

		canCall = false;
		fn(...args);

		setTimeout(() => {
			canCall = true;
		}, ms);
	};
}

/**
 * Generate a color palette from a base color
 *
 * @param baseColor Base color in hex format
 * @param steps Number of color steps to generate
 * @returns Array of hex colors
 */
export function generateColorPalette(baseColor: string, steps: number = 5): string[] {
	// Parse the base color
	let r = parseInt(baseColor.slice(1, 3), 16);
	let g = parseInt(baseColor.slice(3, 5), 16);
	let b = parseInt(baseColor.slice(5, 7), 16);

	// Generate lighter and darker variants
	const palette: string[] = [];

	for (let i = 0; i < steps; i++) {
		// Calculate tint factor (0 to 1)
		const factor = i / (steps - 1);

		// Interpolate between the color and white (for lighter shades)
		// or between the color and black (for darker shades)
		let newR, newG, newB;

		if (factor < 0.5) {
			// Lighter shades (interpolate towards white)
			const tintFactor = factor * 2; // rescale from 0-0.5 to 0-1
			newR = Math.round(r + (255 - r) * tintFactor);
			newG = Math.round(g + (255 - g) * tintFactor);
			newB = Math.round(b + (255 - b) * tintFactor);
		} else {
			// Darker shades (interpolate towards black)
			const shadeFactor = (factor - 0.5) * 2; // rescale from 0.5-1 to 0-1
			newR = Math.round(r * (1 - shadeFactor));
			newG = Math.round(g * (1 - shadeFactor));
			newB = Math.round(b * (1 - shadeFactor));
		}

		// Convert back to hex and add to palette
		palette.push(
			`#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`
		);
	}

	return palette;
}

/**
 * Convert RGB to HSL color
 *
 * @param r Red component (0-255)
 * @param g Green component (0-255)
 * @param b Blue component (0-255)
 * @returns HSL values (h: 0-360, s: 0-100, l: 0-100)
 */
export function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
	r /= 255;
	g /= 255;
	b /= 255;

	const max = Math.max(r, g, b);
	const min = Math.min(r, g, b);
	let h = 0;
	let s = 0;
	const l = (max + min) / 2;

	if (max !== min) {
		const d = max - min;
		s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

		switch (max) {
			case r:
				h = (g - b) / d + (g < b ? 6 : 0);
				break;
			case g:
				h = (b - r) / d + 2;
				break;
			case b:
				h = (r - g) / d + 4;
				break;
		}

		h /= 6;
	}

	return {
		h: Math.round(h * 360),
		s: Math.round(s * 100),
		l: Math.round(l * 100)
	};
}

/**
 * Determine if a color is light or dark (for choosing contrasting text)
 *
 * @param hexColor Hex color value
 * @returns Boolean indicating if color is light
 */
export function isLightColor(hexColor: string): boolean {
	// Parse the hex color
	const r = parseInt(hexColor.slice(1, 3), 16);
	const g = parseInt(hexColor.slice(3, 5), 16);
	const b = parseInt(hexColor.slice(5, 7), 16);

	// Calculate perceived brightness using YIQ formula
	// This gives more weight to colors the human eye is more sensitive to
	const yiq = (r * 299 + g * 587 + b * 114) / 1000;

	return yiq >= 128; // >= 128 is considered light, < 128 is dark
}

/**
 * Get appropriate text color (black or white) for a background color
 *
 * @param backgroundColor Background color in hex
 * @returns Text color in hex
 */
export function getContrastTextColor(backgroundColor: string): string {
	return isLightColor(backgroundColor) ? '#000000' : '#FFFFFF';
}

/**
 * Get a readable category color for display
 *
 * @param category Category to get color for
 * @returns CSS color string
 */
export function getCategoryColor(category?: Category | null): string {
	if (!category) return '#CCCCCC'; // Default gray for undefined/null
	return category.color || '#0066cc'; // Default blue if no color
}

/**
 * Wait for a specified amount of time
 *
 * @param ms Milliseconds to wait
 * @returns Promise that resolves after the delay
 */
export function wait(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Retry a function multiple times with backoff
 *
 * @param fn Function to retry
 * @param maxAttempts Maximum retry attempts
 * @param initialDelay Initial delay in ms
 * @param backoffFactor Factor to increase delay by with each retry
 * @returns Promise with the function result
 */
export async function retry<T>(
	fn: () => Promise<T>,
	maxAttempts: number = 3,
	initialDelay: number = 300,
	backoffFactor: number = 2
): Promise<T> {
	let attempts = 0;
	let delay = initialDelay;

	while (true) {
		try {
			return await fn();
		} catch (error) {
			attempts++;

			if (attempts >= maxAttempts) {
				throw error;
			}

			// Wait with exponential backoff
			await wait(delay);
			delay *= backoffFactor;
		}
	}
}
