<!--
  Summary Chart Component

  A comprehensive dashboard-style component that combines multiple charts and metrics.
  Features:
  - Multiple chart types in a single view (bar, pie, line)
  - Key metrics display with icons and trends
  - Responsive grid layout
  - Interactive filters
  - Time period selector
  - Dark mode support
  - Animation and transitions
-->
<script lang="ts">
	import { onMount } from 'svelte';
	import { fade, slide } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';
	import BarChart from './BarChart.svelte';
	import LineChart from './LineChart.svelte';
	import PieChart from './PieChart.svelte';
	import { formatCurrency, formatNumber, formatPercentage, formatDate } from '$lib/utils/format';
	import { theme } from '$lib/stores/ui';
	import type {
		Currency,
		ExpenseSummary,
		CategoryExpenseData,
		TimeSeriesData
	} from '$lib/types/expenses';

	// Props with Svelte 5 runes
	const {
		// Summary data
		title = $props<string>('Expense Summary'),
		period = $props<string>('This Month'),
		summary = $props<ExpenseSummary | null>(null),
		categoryData = $props<CategoryExpenseData[]>([]),
		timeSeriesData = $props<TimeSeriesData[]>([]),
		currency = $props<Currency>('USD'),

		// Component options
		showCategoryChart = $props<boolean>(true),
		showTimeSeriesChart = $props<boolean>(true),
		showMetricsCards = $props<boolean>(true),

		// Layout
		layout = $props<'grid' | 'column'>('grid'),

		// Customization
		height = $props<string | number>('auto'),
		colorPalette = $props<string[]>([]),

		// Interactions
		loading = $props<boolean>(false),
		error = $props<string | null>(null)
	} = $props();

	// Local state
	let selectedComparison = $state<'previous' | 'average'>('previous');
	let selectedChart = $state<'pie' | 'bar'>('pie');
	let selectedTimeUnit = $state<'day' | 'week' | 'month'>('day');
	let animate = $state(true);

	// Determine theme and styles
	const isDarkMode = $derived($theme === 'dark');
	const bgColor = $derived(isDarkMode ? 'bg-gray-800' : 'bg-white');
	const textColor = $derived(isDarkMode ? 'text-gray-100' : 'text-gray-800');
	const cardBgColor = $derived(isDarkMode ? 'bg-gray-700' : 'bg-gray-50');
	const borderColor = $derived(isDarkMode ? 'border-gray-700' : 'border-gray-200');

	// Prepare chart data
	const categoryChartData = $derived({
		labels: categoryData.map((cat) => cat.category_name),
		datasets: [
			{
				label: 'Amount',
				data: categoryData.map((cat) => cat.total_amount),
				backgroundColor: categoryData.map((cat) => cat.category_color)
			}
		]
	});

	const timeSeriesChartData = $derived({
		labels: timeSeriesData.map((item) => new Date(item.date)),
		datasets: [
			{
				label: 'Expenses',
				data: timeSeriesData.map((item) => item.amount),
				borderColor: '#3B82F6',
				backgroundColor: 'rgba(59, 130, 246, 0.1)'
			}
		]
	});

	// Prepare metrics
	const totalExpenses = $derived(summary ? summary.total_expenses : 0);
	const expenseCount = $derived(summary ? summary.expense_count : 0);
	const averageExpense = $derived(summary ? summary.average_expense : 0);
	const highestExpense = $derived(summary ? summary.highest_expense : 0);

	// Example trend data (would come from actual comparison in real app)
	const totalTrend = $derived({ percentage: 12.5, direction: 'up' });
	const countTrend = $derived({ percentage: 5.2, direction: 'up' });
	const averageTrend = $derived({ percentage: 7.3, direction: 'up' });
	const highestTrend = $derived({ percentage: -3.8, direction: 'down' });

	const getTrendClass = (trend: { percentage: number; direction: string }) => {
		if (trend.direction === 'up') {
			return 'text-red-500 dark:text-red-400';
		} else if (trend.direction === 'down') {
			return 'text-green-500 dark:text-green-400';
		}
		return 'text-gray-500 dark:text-gray-400';
	};

	// Layout style calculation
	const gridStyle = $derived(
		layout === 'grid' ? 'grid gap-6 md:grid-cols-2 lg:grid-cols-3' : 'flex flex-col space-y-6'
	);

	const chartHeight = $derived(layout === 'grid' ? '250px' : '300px');

	// Lifecycle
	onMount(() => {
		// Disable animation after initial render
		setTimeout(() => {
			animate = false;
		}, 1000);
	});
</script>

<div class="summary-dashboard w-full {typeof height === 'number' ? `h-${height}` : height}">
	<!-- Header -->
	<div
		class="mb-6 flex flex-col space-y-2 sm:flex-row sm:items-center sm:justify-between sm:space-y-0"
	>
		<div>
			<h2 class="text-xl font-bold {textColor}">{title}</h2>
			<p class="text-sm text-gray-500 dark:text-gray-400">{period}</p>
		</div>

		<!-- Time unit selector for time series -->
		{#if showTimeSeriesChart && timeSeriesData.length > 0}
			<div class="flex items-center space-x-2 rounded-md border {borderColor} p-1">
				<button
					class="rounded px-3 py-1 text-sm {selectedTimeUnit === 'day'
						? 'bg-blue-100 text-blue-700 dark:bg-blue-800 dark:text-blue-200'
						: 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'}"
					on:click={() => (selectedTimeUnit = 'day')}
				>
					Day
				</button>
				<button
					class="rounded px-3 py-1 text-sm {selectedTimeUnit === 'week'
						? 'bg-blue-100 text-blue-700 dark:bg-blue-800 dark:text-blue-200'
						: 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'}"
					on:click={() => (selectedTimeUnit = 'week')}
				>
					Week
				</button>
				<button
					class="rounded px-3 py-1 text-sm {selectedTimeUnit === 'month'
						? 'bg-blue-100 text-blue-700 dark:bg-blue-800 dark:text-blue-200'
						: 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'}"
					on:click={() => (selectedTimeUnit = 'month')}
				>
					Month
				</button>
			</div>
		{/if}
	</div>

	<!-- Loading state -->
	{#if loading}
		<div class="flex min-h-[300px] items-center justify-center">
			<div class="flex flex-col items-center">
				<div
					class="h-12 w-12 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600"
				></div>
				<p class="mt-4 {textColor}">Loading summary data...</p>
			</div>
		</div>
		<!-- Error state -->
	{:else if error}
		<div class="flex min-h-[300px] items-center justify-center">
			<div class="flex flex-col items-center text-center">
				<div
					class="flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900"
				>
					<svg
						class="h-8 w-8 text-red-600 dark:text-red-400"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
						/>
					</svg>
				</div>
				<h3 class="mt-4 text-lg font-medium {textColor}">Error Loading Data</h3>
				<p class="mt-2 max-w-md text-sm text-gray-500 dark:text-gray-400">{error}</p>
			</div>
		</div>
		<!-- No data state -->
	{:else if !summary || (categoryData.length === 0 && timeSeriesData.length === 0)}
		<div class="flex min-h-[300px] items-center justify-center">
			<div class="flex flex-col items-center text-center">
				<div
					class="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800"
				>
					<svg
						class="h-8 w-8 text-gray-400 dark:text-gray-500"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4" />
					</svg>
				</div>
				<h3 class="mt-4 text-lg font-medium {textColor}">No Data Available</h3>
				<p class="mt-2 max-w-md text-sm text-gray-500 dark:text-gray-400">
					There are no expenses recorded for this period.
				</p>
			</div>
		</div>
		<!-- Content -->
	{:else}
		<!-- Content container with responsive layout -->
		<div class={gridStyle}>
			<!-- Metrics Cards Row -->
			{#if showMetricsCards && summary}
				<div class="col-span-full mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
					<!-- Total Expenses -->
					<div
						in:fade={{ duration: animate ? 300 : 0, delay: animate ? 100 : 0 }}
						class="flex items-center rounded-lg border {borderColor} {cardBgColor} p-4 shadow-sm"
					>
						<div
							class="mr-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900"
						>
							<svg
								class="h-6 w-6 text-blue-600 dark:text-blue-400"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
								/>
							</svg>
						</div>
						<div>
							<p class="text-sm font-medium text-gray-500 dark:text-gray-400">Total Expenses</p>
							<p class="text-xl font-bold {textColor}">{formatCurrency(totalExpenses, currency)}</p>
							<div class="mt-1 flex items-center text-xs">
								<span class={getTrendClass(totalTrend)}>
									{totalTrend.direction === 'up' ? '↑' : '↓'}
									{formatPercentage(totalTrend.percentage)}
								</span>
								<span class="ml-1 text-gray-500 dark:text-gray-400">vs. last period</span>
							</div>
						</div>
					</div>

					<!-- Expense Count -->
					<div
						in:fade={{ duration: animate ? 300 : 0, delay: animate ? 200 : 0 }}
						class="flex items-center rounded-lg border {borderColor} {cardBgColor} p-4 shadow-sm"
					>
						<div
							class="mr-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900"
						>
							<svg
								class="h-6 w-6 text-green-600 dark:text-green-400"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"
								/>
							</svg>
						</div>
						<div>
							<p class="text-sm font-medium text-gray-500 dark:text-gray-400">Number of Expenses</p>
							<p class="text-xl font-bold {textColor}">{expenseCount}</p>
							<div class="mt-1 flex items-center text-xs">
								<span class={getTrendClass(countTrend)}>
									{countTrend.direction === 'up' ? '↑' : '↓'}
									{formatPercentage(countTrend.percentage)}
								</span>
								<span class="ml-1 text-gray-500 dark:text-gray-400">vs. last period</span>
							</div>
						</div>
					</div>

					<!-- Average Expense -->
					<div
						in:fade={{ duration: animate ? 300 : 0, delay: animate ? 300 : 0 }}
						class="flex items-center rounded-lg border {borderColor} {cardBgColor} p-4 shadow-sm"
					>
						<div
							class="mr-4 flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900"
						>
							<svg
								class="h-6 w-6 text-purple-600 dark:text-purple-400"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
								/>
							</svg>
						</div>
						<div>
							<p class="text-sm font-medium text-gray-500 dark:text-gray-400">Average Expense</p>
							<p class="text-xl font-bold {textColor}">
								{formatCurrency(averageExpense, currency)}
							</p>
							<div class="mt-1 flex items-center text-xs">
								<span class={getTrendClass(averageTrend)}>
									{averageTrend.direction === 'up' ? '↑' : '↓'}
									{formatPercentage(averageTrend.percentage)}
								</span>
								<span class="ml-1 text-gray-500 dark:text-gray-400">vs. last period</span>
							</div>
						</div>
					</div>

					<!-- Highest Expense -->
					<div
						in:fade={{ duration: animate ? 300 : 0, delay: animate ? 400 : 0 }}
						class="flex items-center rounded-lg border {borderColor} {cardBgColor} p-4 shadow-sm"
					>
						<div
							class="mr-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900"
						>
							<svg
								class="h-6 w-6 text-red-600 dark:text-red-400"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
								/>
							</svg>
						</div>
						<div>
							<p class="text-sm font-medium text-gray-500 dark:text-gray-400">Highest Expense</p>
							<p class="text-xl font-bold {textColor}">
								{formatCurrency(highestExpense, currency)}
							</p>
							<div class="mt-1 flex items-center text-xs">
								<span class={getTrendClass(highestTrend)}>
									{highestTrend.direction === 'up' ? '↑' : '↓'}
									{formatPercentage(Math.abs(highestTrend.percentage))}
								</span>
								<span class="ml-1 text-gray-500 dark:text-gray-400">vs. last period</span>
							</div>
						</div>
					</div>
				</div>
			{/if}

			<!-- Category Chart -->
			{#if showCategoryChart && categoryData.length > 0}
				<div
					class="chart-container"
					in:fade={{ duration: animate ? 400 : 0, delay: animate ? 200 : 0 }}
				>
					<div class="mb-2 flex items-center justify-between">
						<h3 class="text-lg font-medium {textColor}">Expenses by Category</h3>
						<div class="flex items-center space-x-2 rounded-md border {borderColor} p-1">
							<button
								class="rounded px-2 py-1 text-xs {selectedChart === 'pie'
									? 'bg-blue-100 text-blue-700 dark:bg-blue-800 dark:text-blue-200'
									: 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'}"
								on:click={() => (selectedChart = 'pie')}
							>
								Pie
							</button>
							<button
								class="rounded px-2 py-1 text-xs {selectedChart === 'bar'
									? 'bg-blue-100 text-blue-700 dark:bg-blue-800 dark:text-blue-200'
									: 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'}"
								on:click={() => (selectedChart = 'bar')}
							>
								Bar
							</button>
						</div>
					</div>

					<div class="rounded-lg border {borderColor} {bgColor} p-4">
						{#if selectedChart === 'pie'}
							<PieChart
								data={categoryChartData}
								height={chartHeight}
								width="100%"
								showPercentages={true}
								legendPosition="right"
								{currency}
								type="doughnut"
								animationDuration={animate ? 750 : 0}
							/>
						{:else}
							<BarChart
								data={categoryChartData}
								height={chartHeight}
								width="100%"
								horizontal={true}
								showGrid={false}
								{currency}
								animationDuration={animate ? 750 : 0}
							/>
						{/if}
					</div>
				</div>
			{/if}

			<!-- Time Series Chart -->
			{#if showTimeSeriesChart && timeSeriesData.length > 0}
				<div
					class="chart-container {layout === 'grid' ? 'lg:col-span-2' : ''}"
					in:fade={{ duration: animate ? 400 : 0, delay: animate ? 300 : 0 }}
				>
					<div class="mb-2 flex items-center justify-between">
						<h3 class="text-lg font-medium {textColor}">Expenses Over Time</h3>
					</div>

					<div class="rounded-lg border {borderColor} {bgColor} p-4">
						<LineChart
							data={timeSeriesChartData}
							height={chartHeight}
							width="100%"
							xAxisType="time"
							timeUnit={selectedTimeUnit}
							{currency}
							areaFill={true}
							animationDuration={animate ? 750 : 0}
						/>
					</div>
				</div>
			{/if}
		</div>
	{/if}
</div>

<style>
	.summary-dashboard {
		transition: all 0.3s ease;
	}

	@media (max-width: 640px) {
		.chart-container {
			min-height: 300px;
		}
	}
</style>
