/**
 * Get the start and end of today
 */
export function getToday() {
	const today = new Date();
	today.setHours(0, 0, 0, 0);

	const tomorrow = new Date(today);
	tomorrow.setDate(tomorrow.getDate() + 1);

	return {
		start: today.toISOString().split('T')[0],
		end: today.toISOString().split('T')[0]
	};
}

/**
 * Get the start and end of this week
 */
export function getThisWeek() {
	const today = new Date();
	const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, etc.

	// Calculate start of week (Sunday)
	const startOfWeek = new Date(today);
	startOfWeek.setDate(today.getDate() - dayOfWeek);
	startOfWeek.setHours(0, 0, 0, 0);

	// Calculate end of week (Saturday)
	const endOfWeek = new Date(startOfWeek);
	endOfWeek.setDate(startOfWeek.getDate() + 6);

	return {
		start: startOfWeek.toISOString().split('T')[0],
		end: endOfWeek.toISOString().split('T')[0]
	};
}

/**
 * Get the start and end of this month
 */
export function getThisMonth() {
	const today = new Date();

	// Start of month
	const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

	// End of month
	const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

	return {
		start: startOfMonth.toISOString().split('T')[0],
		end: endOfMonth.toISOString().split('T')[0]
	};
}

/**
 * Get the start and end of this year
 */
export function getThisYear() {
	const today = new Date();

	// Start of year
	const startOfYear = new Date(today.getFullYear(), 0, 1);

	// End of year
	const endOfYear = new Date(today.getFullYear(), 11, 31);

	return {
		start: startOfYear.toISOString().split('T')[0],
		end: endOfYear.toISOString().split('T')[0]
	};
}

/**
 * Get the start and end of a custom date range
 */
export function getDateRange(start, end) {
	if (!start || !end) return { start: null, end: null };

	const startDate = new Date(start);
	const endDate = new Date(end);

	return {
		start: startDate.toISOString().split('T')[0],
		end: endDate.toISOString().split('T')[0]
	};
}

/**
 * Add days to a date
 */
export function addDays(date, days) {
	const result = new Date(date);
	result.setDate(result.getDate() + days);
	return result;
}

/**
 * Get the date ranges for common periods
 */
export function getDateRangeOptions() {
	const today = getToday();
	const thisWeek = getThisWeek();
	const thisMonth = getThisMonth();
	const thisYear = getThisYear();

	const yesterday = addDays(new Date(), -1).toISOString().split('T')[0];

	// Last 7 days
	const last7Start = addDays(new Date(), -6).toISOString().split('T')[0];
	const last7End = today.end;

	// Last 30 days
	const last30Start = addDays(new Date(), -29).toISOString().split('T')[0];
	const last30End = today.end;

	// Last month
	const now = new Date();
	const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
	const lastMonthStart = new Date(lastMonthEnd.getFullYear(), lastMonthEnd.getMonth(), 1);

	return [
		{ label: 'Today', value: 'today', start: today.start, end: today.end },
		{ label: 'Yesterday', value: 'yesterday', start: yesterday, end: yesterday },
		{ label: 'This Week', value: 'this_week', start: thisWeek.start, end: thisWeek.end },
		{ label: 'Last 7 Days', value: 'last_7_days', start: last7Start, end: last7End },
		{ label: 'This Month', value: 'this_month', start: thisMonth.start, end: thisMonth.end },
		{ label: 'Last 30 Days', value: 'last_30_days', start: last30Start, end: last30End },
		{
			label: 'Last Month',
			value: 'last_month',
			start: lastMonthStart.toISOString().split('T')[0],
			end: lastMonthEnd.toISOString().split('T')[0]
		},
		{ label: 'This Year', value: 'this_year', start: thisYear.start, end: thisYear.end },
		{ label: 'All Time', value: 'all_time', start: null, end: null }
	];
}
