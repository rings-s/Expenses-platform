import { formatCurrency, formatDate } from './formatters';

/**
 * Create data for a pie chart from category data
 */
export function createPieChartData(categoryData) {
	return {
		labels: categoryData.map((item) => item.category_name),
		datasets: [
			{
				data: categoryData.map((item) => parseFloat(item.total_amount)),
				backgroundColor: categoryData.map((item) => item.category_color),
				borderWidth: 1
			}
		]
	};
}

/**
 * Create data for a bar chart from category data
 */
export function createBarChartData(categoryData) {
	return {
		labels: categoryData.map((item) => item.category_name),
		datasets: [
			{
				label: 'Amount',
				data: categoryData.map((item) => parseFloat(item.total_amount)),
				backgroundColor: categoryData.map((item) => item.category_color),
				borderColor: categoryData.map((item) => adjustColorBrightness(item.category_color, -20)),
				borderWidth: 1
			}
		]
	};
}

/**
 * Create data for a line chart from time series data
 */
export function createLineChartData(timeSeriesData, currency = 'USD') {
	return {
		labels: timeSeriesData.map((item) => formatDate(item.date, 'medium')),
		datasets: [
			{
				label: `Expenses (${currency})`,
				data: timeSeriesData.map((item) => parseFloat(item.amount)),
				fill: true,
				backgroundColor: 'rgba(75, 192, 192, 0.2)',
				borderColor: 'rgba(75, 192, 192, 1)',
				tension: 0.4
			}
		]
	};
}

/**
 * Create data for a budget comparison chart
 */
export function createBudgetComparisonChart(budgetData) {
	return {
		labels: budgetData.map((item) => item.category_name),
		datasets: [
			{
				label: 'Budget',
				data: budgetData.map((item) => parseFloat(item.budget_amount)),
				backgroundColor: 'rgba(54, 162, 235, 0.5)',
				borderColor: 'rgba(54, 162, 235, 1)',
				borderWidth: 1
			},
			{
				label: 'Actual',
				data: budgetData.map((item) => parseFloat(item.actual_amount)),
				backgroundColor: 'rgba(255, 99, 132, 0.5)',
				borderColor: 'rgba(255, 99, 132, 1)',
				borderWidth: 1
			}
		]
	};
}

/**
 * Configure Chart.js options for responsive design
 */
export function getChartOptions(type, title, currency = 'USD') {
	const baseOptions = {
		responsive: true,
		maintainAspectRatio: false,
		plugins: {
			legend: {
				position: 'top'
			},
			title: {
				display: !!title,
				text: title
			},
			tooltip: {
				callbacks: {
					label: function (context) {
						let label = context.dataset.label || '';
						if (label) {
							label += ': ';
						}
						if (context.parsed.y !== undefined) {
							label += formatCurrency(context.parsed.y, currency);
						} else if (context.parsed !== undefined) {
							label += formatCurrency(context.parsed, currency);
						}
						return label;
					}
				}
			}
		}
	};

	// Add type-specific options
	if (type === 'pie' || type === 'doughnut') {
		return {
			...baseOptions,
			cutout: type === 'doughnut' ? '50%' : 0
		};
	} else if (type === 'bar') {
		return {
			...baseOptions,
			scales: {
				y: {
					beginAtZero: true,
					ticks: {
						callback: function (value) {
							return formatCurrency(value, currency);
						}
					}
				}
			}
		};
	} else if (type === 'line') {
		return {
			...baseOptions,
			scales: {
				y: {
					beginAtZero: true,
					ticks: {
						callback: function (value) {
							return formatCurrency(value, currency);
						}
					}
				}
			}
		};
	}

	return baseOptions;
}

/**
 * Adjust color brightness (for borders, etc.)
 */
function adjustColorBrightness(hex, percent) {
	// Convert hex to rgb
	let r = parseInt(hex.substring(1, 3), 16);
	let g = parseInt(hex.substring(3, 5), 16);
	let b = parseInt(hex.substring(5, 7), 16);

	// Adjust brightness
	r = Math.max(0, Math.min(255, r + percent));
	g = Math.max(0, Math.min(255, g + percent));
	b = Math.max(0, Math.min(255, b + percent));

	// Convert back to hex
	return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}
