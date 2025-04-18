/**
 * Format currency with proper symbol and decimal places
 */
export function formatCurrency(amount, currency = 'USD') {
	const formatter = new Intl.NumberFormat('en-US', {
		style: 'currency',
		currency,
		minimumFractionDigits: 2,
		maximumFractionDigits: 2
	});

	return formatter.format(amount);
}

/**
 * Format date to a standard format
 */
export function formatDate(date, format = 'long') {
	if (!date) return '';

	const dateObj = new Date(date);

	if (format === 'short') {
		return dateObj.toLocaleDateString();
	} else if (format === 'medium') {
		return dateObj.toLocaleDateString(undefined, {
			year: 'numeric',
			month: 'short',
			day: 'numeric'
		});
	} else if (format === 'long') {
		return dateObj.toLocaleDateString(undefined, {
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		});
	} else if (format === 'iso') {
		return dateObj.toISOString().split('T')[0];
	}

	return dateObj.toLocaleDateString();
}

/**
 * Format a percentage
 */
export function formatPercentage(value, decimals = 1) {
	if (typeof value !== 'number') return '0%';

	return `${value.toFixed(decimals)}%`;
}

/**
 * Truncate text with ellipsis
 */
export function truncateText(text, maxLength = 50) {
	if (!text || text.length <= maxLength) return text;

	return `${text.substring(0, maxLength)}...`;
}

/**
 * Get the first letter of each word (for avatars)
 */
export function getInitials(name) {
	if (!name) return '';

	return name
		.split(' ')
		.map((word) => word.charAt(0).toUpperCase())
		.join('')
		.substring(0, 2);
}

/**
 * Convert a file to data URL
 */
export function fileToDataUrl(file) {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onload = () => resolve(reader.result);
		reader.onerror = reject;
		reader.readAsDataURL(file);
	});
}
