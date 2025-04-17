/**
 * Formatting Utilities
 *
 * Utility functions for formatting various data types:
 * - Currency formatting with localization
 * - Date formatting with various options
 * - Number formatting with decimal places
 * - Percentage formatting
 * - File size formatting
 */

import type { Currency } from '$lib/types/expenses';
import { browser } from '$app/environment';
import { CURRENCY_SYMBOLS } from '$lib/types/expenses';

/**
 * Format a number as currency
 *
 * @param amount The amount to format
 * @param currency Currency code (USD, EUR, etc.)
 * @param options Additional formatting options
 * @returns Formatted currency string
 */
export function formatCurrency(
	amount: number,
	currency: Currency = 'USD',
	options: Intl.NumberFormatOptions = {}
): string {
	// Handle edge cases
	if (amount === null || amount === undefined) return '';
	if (isNaN(amount)) return 'Invalid amount';

	// Default options for currency formatting
	const defaultOptions: Intl.NumberFormatOptions = {
		style: 'currency',
		currency,
		minimumFractionDigits: 2,
		maximumFractionDigits: 2
	};

	// Merge options
	const mergedOptions = { ...defaultOptions, ...options };

	try {
		// Try to use Intl.NumberFormat if available (browser environment)
		if (browser) {
			const formatter = new Intl.NumberFormat(undefined, mergedOptions);
			return formatter.format(amount);
		}

		// Fallback for server-side rendering or older browsers
		return `${CURRENCY_SYMBOLS[currency] || '$'}${amount.toFixed(mergedOptions.maximumFractionDigits)}`;
	} catch (error) {
		// Fallback in case of any errors
		console.error('Error formatting currency:', error);
		return `${CURRENCY_SYMBOLS[currency] || '$'}${amount.toFixed(2)}`;
	}
}

/**
 * Format a number with specified decimal places
 *
 * @param value The number to format
 * @param decimalPlaces Number of decimal places to show
 * @param options Additional formatting options
 * @returns Formatted number string
 */
export function formatNumber(
	value: number,
	decimalPlaces: number = 2,
	options: Intl.NumberFormatOptions = {}
): string {
	// Handle edge cases
	if (value === null || value === undefined) return '';
	if (isNaN(value)) return 'Invalid number';

	// Default options for number formatting
	const defaultOptions: Intl.NumberFormatOptions = {
		minimumFractionDigits: decimalPlaces,
		maximumFractionDigits: decimalPlaces
	};

	// Merge options
	const mergedOptions = { ...defaultOptions, ...options };

	try {
		// Try to use Intl.NumberFormat if available (browser environment)
		if (browser) {
			const formatter = new Intl.NumberFormat(undefined, mergedOptions);
			return formatter.format(value);
		}

		// Fallback for server-side rendering or older browsers
		return value.toFixed(decimalPlaces);
	} catch (error) {
		// Fallback in case of any errors
		console.error('Error formatting number:', error);
		return value.toFixed(decimalPlaces);
	}
}

/**
 * Format a percentage value
 *
 * @param value The value to format as percentage (0-100)
 * @param decimalPlaces Number of decimal places to show
 * @returns Formatted percentage string
 */
export function formatPercentage(value: number, decimalPlaces: number = 1): string {
	// Handle edge cases
	if (value === null || value === undefined) return '';
	if (isNaN(value)) return 'Invalid percentage';

	try {
		// Try to use Intl.NumberFormat if available (browser environment)
		if (browser) {
			const formatter = new Intl.NumberFormat(undefined, {
				style: 'percent',
				minimumFractionDigits: decimalPlaces,
				maximumFractionDigits: decimalPlaces
			});

			// Convert decimal to percentage (0.5 -> 50%)
			const percentValue = value >= 0 && value <= 1 ? value : value / 100;
			return formatter.format(percentValue);
		}

		// Fallback for server-side rendering or older browsers
		const percentValue = value >= 0 && value <= 1 ? value * 100 : value;
		return `${percentValue.toFixed(decimalPlaces)}%`;
	} catch (error) {
		// Fallback in case of any errors
		console.error('Error formatting percentage:', error);
		return `${value.toFixed(decimalPlaces)}%`;
	}
}

/**
 * Date format options
 */
export enum DateFormat {
	SHORT = 'short', // 01/20/2023
	MEDIUM = 'medium', // Jan 20, 2023
	LONG = 'long', // January 20, 2023
	FULL = 'full', // Friday, January 20, 2023
	ISO = 'iso', // 2023-01-20
	TIME = 'time', // 3:30 PM
	DATETIME = 'datetime', // Jan 20, 2023, 3:30 PM
	RELATIVE = 'relative' // 2 days ago, etc.
}

/**
 * Format a date with various options
 *
 * @param date The date to format (string, Date, or timestamp)
 * @param format The format to use (from DateFormat enum or custom string)
 * @returns Formatted date string
 */
export function formatDate(
	date: string | Date | number,
	format: DateFormat | string = DateFormat.MEDIUM
): string {
	// Handle edge cases
	if (!date) return '';

	try {
		// Convert input to Date object
		const dateObj =
			typeof date === 'string' ? new Date(date) : date instanceof Date ? date : new Date(date);

		// Check for invalid date
		if (isNaN(dateObj.getTime())) return 'Invalid date';

		// Handle relative time format
		if (format === DateFormat.RELATIVE) {
			return formatRelativeTime(dateObj);
		}

		// Handle ISO format
		if (format === DateFormat.ISO) {
			return dateObj.toISOString().split('T')[0];
		}

		// Use Intl.DateTimeFormat for standard formats
		if (browser) {
			let options: Intl.DateTimeFormatOptions = {};

			switch (format) {
				case DateFormat.SHORT:
					options = { year: 'numeric', month: '2-digit', day: '2-digit' };
					break;
				case DateFormat.MEDIUM:
					options = { year: 'numeric', month: 'short', day: 'numeric' };
					break;
				case DateFormat.LONG:
					options = { year: 'numeric', month: 'long', day: 'numeric' };
					break;
				case DateFormat.FULL:
					options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
					break;
				case DateFormat.TIME:
					options = { hour: 'numeric', minute: '2-digit', hour12: true };
					break;
				case DateFormat.DATETIME:
					options = {
						year: 'numeric',
						month: 'short',
						day: 'numeric',
						hour: 'numeric',
						minute: '2-digit',
						hour12: true
					};
					break;
				default:
					// Custom format string (not implemented in this version)
					options = { year: 'numeric', month: 'short', day: 'numeric' };
			}

			return new Intl.DateTimeFormat(undefined, options).format(dateObj);
		}

		// Fallback formatting for server-side rendering
		const year = dateObj.getFullYear();
		const month = String(dateObj.getMonth() + 1).padStart(2, '0');
		const day = String(dateObj.getDate()).padStart(2, '0');
		const hours = dateObj.getHours();
		const minutes = String(dateObj.getMinutes()).padStart(2, '0');
		const ampm = hours >= 12 ? 'PM' : 'AM';
		const hours12 = hours % 12 || 12;

		switch (format) {
			case DateFormat.SHORT:
				return `${month}/${day}/${year}`;
			case DateFormat.TIME:
				return `${hours12}:${minutes} ${ampm}`;
			case DateFormat.DATETIME:
				return `${month}/${day}/${year}, ${hours12}:${minutes} ${ampm}`;
			default:
				return `${year}-${month}-${day}`;
		}
	} catch (error) {
		console.error('Error formatting date:', error);
		return String(date);
	}
}

/**
 * Format a date as relative time (e.g., "2 days ago")
 *
 * @param date The date to format
 * @returns Relative time string
 */
export function formatRelativeTime(date: Date | string | number): string {
	if (!browser) return ''; // Only available in browser

	try {
		// Convert to Date object if needed
		const dateObj =
			typeof date === 'string' ? new Date(date) : date instanceof Date ? date : new Date(date);

		// Check for invalid date
		if (isNaN(dateObj.getTime())) return 'Invalid date';

		const now = new Date();
		const diffMs = now.getTime() - dateObj.getTime();
		const diffSec = Math.round(diffMs / 1000);
		const diffMin = Math.round(diffSec / 60);
		const diffHour = Math.round(diffMin / 60);
		const diffDay = Math.round(diffHour / 24);
		const diffWeek = Math.round(diffDay / 7);
		const diffMonth = Math.round(diffDay / 30);
		const diffYear = Math.round(diffDay / 365);

		// Future dates
		if (diffMs < 0) {
			const absDiffSec = Math.abs(diffSec);
			const absDiffMin = Math.abs(diffMin);
			const absDiffHour = Math.abs(diffHour);
			const absDiffDay = Math.abs(diffDay);

			if (absDiffSec < 60) return 'in a few seconds';
			if (absDiffMin < 60) return `in ${absDiffMin} minute${absDiffMin === 1 ? '' : 's'}`;
			if (absDiffHour < 24) return `in ${absDiffHour} hour${absDiffHour === 1 ? '' : 's'}`;
			if (absDiffDay < 7) return `in ${absDiffDay} day${absDiffDay === 1 ? '' : 's'}`;
			return formatDate(dateObj, DateFormat.MEDIUM);
		}

		// Past dates
		if (diffSec < 60) return 'just now';
		if (diffMin < 60) return `${diffMin} minute${diffMin === 1 ? '' : 's'} ago`;
		if (diffHour < 24) return `${diffHour} hour${diffHour === 1 ? '' : 's'} ago`;
		if (diffDay < 7) return `${diffDay} day${diffDay === 1 ? '' : 's'} ago`;
		if (diffWeek < 4) return `${diffWeek} week${diffWeek === 1 ? '' : 's'} ago`;
		if (diffMonth < 12) return `${diffMonth} month${diffMonth === 1 ? '' : 's'} ago`;
		return `${diffYear} year${diffYear === 1 ? '' : 's'} ago`;
	} catch (error) {
		console.error('Error formatting relative time:', error);
		return String(date);
	}
}

/**
 * Format a file size in bytes to a human-readable string
 *
 * @param bytes File size in bytes
 * @param decimals Number of decimal places to show
 * @returns Formatted file size string
 */
export function formatFileSize(bytes: number, decimals: number = 2): string {
	if (bytes === 0) return '0 Bytes';
	if (isNaN(bytes) || !isFinite(bytes)) return '';

	const k = 1024;
	const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
	const i = Math.floor(Math.log(bytes) / Math.log(k));

	return parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + ' ' + sizes[i];
}

/**
 * Truncate a string with ellipsis if it exceeds max length
 *
 * @param text Text to truncate
 * @param maxLength Maximum allowed length
 * @param ellipsis Ellipsis string to append
 * @returns Truncated string
 */
export function truncateText(
	text: string,
	maxLength: number = 50,
	ellipsis: string = '...'
): string {
	if (!text) return '';
	if (text.length <= maxLength) return text;

	return text.substring(0, maxLength - ellipsis.length) + ellipsis;
}

/**
 * Convert a string to title case
 *
 * @param text Text to convert
 * @returns Title cased text
 */
export function toTitleCase(text: string): string {
	if (!text) return '';

	return text
		.toLowerCase()
		.split(' ')
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
		.join(' ');
}

/**
 * Format a phone number
 *
 * @param phone Phone number to format
 * @param format Format string (default: "(XXX) XXX-XXXX")
 * @returns Formatted phone number
 */
export function formatPhoneNumber(phone: string, format: string = '(XXX) XXX-XXXX'): string {
	if (!phone) return '';

	// Strip non-numeric characters
	const cleaned = phone.replace(/\D/g, '');

	// Apply the format
	let result = format;
	let charIndex = 0;

	for (let i = 0; i < format.length; i++) {
		if (format[i] === 'X') {
			if (charIndex < cleaned.length) {
				result = result.substring(0, i) + cleaned[charIndex++] + result.substring(i + 1);
			} else {
				result = result.substring(0, i) + 'X' + result.substring(i + 1);
			}
		}
	}

	return result;
}
