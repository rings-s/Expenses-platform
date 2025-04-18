<script>
	import { onMount } from 'svelte';
	import Chart from 'chart.js/auto';
	import AppLayout from '$lib/components/layout/AppLayout.svelte';
	import { expenseStore } from '$lib/stores/expenseStore';
	import { categoryStore } from '$lib/stores/categoryStore';
	import { budgetStore } from '$lib/stores/budgetStore';
	import { reportStore } from '$lib/stores/reportStore';
	import { formatCurrency } from '$lib/utils/formatters';
	import { getThisMonth, getDateRangeOptions } from '$lib/utils/dateUtils';
	import { createPieChartData, createLineChartData, getChartOptions } from '$lib/utils/chartUtils';
	import Button from '$lib/components/ui/Button.svelte';
	import Alert from '$lib/components/ui/Alert.svelte';

	let loading = true;
	let error = null;
	let summary = null;
	let categoryChart = null;
	let timeSeriesChart = null;
	let budgetComparisonChart = null;

	let currentPeriod = 'this_month';
	let dateRanges = getDateRangeOptions();

	// Initialize dashboard data
	onMount(async () => {
		try {
			loading = true;

			// Load categories first
			await categoryStore.loadCategories();

			// Fetch initial dashboard data
			await Promise.all([
				loadExpenseSummary(),
				loadCategoryData(),
				loadTimeSeriesData(),
				loadBudgetComparison()
			]);
		} catch (err) {
			error = err.message || 'Failed to load dashboard data';
		} finally {
			loading = false;
		}
	});

	async function loadExpenseSummary() {
		const selectedRange = dateRanges.find((range) => range.value === currentPeriod);
		const response = await reportStore.loadExpenseSummary({
			period: currentPeriod,
			start_date: selectedRange?.start,
			end_date: selectedRange?.end
		});

		summary = response.summary;
	}

	async function loadCategoryData() {
		const selectedRange = dateRanges.find((range) => range.value === currentPeriod);
		const response = await reportStore.loadExpensesByCategory({
			period: currentPeriod,
			chart_type: 'pie',
			start_date: selectedRange?.start,
			end_date: selectedRange?.end
		});

		initCategoryChart(response.data);
	}

	async function loadTimeSeriesData() {
		const selectedRange = dateRanges.find((range) => range.value === currentPeriod);
		const response = await reportStore.loadExpensesTimeSeries({
			period: currentPeriod,
			chart_type: 'line',
			group_by: 'auto',
			start_date: selectedRange?.start,
			end_date: selectedRange?.end
		});

		initTimeSeriesChart(response.data);
	}

	async function loadBudgetComparison() {
		const response = await budgetStore.loadBudgetComparisons({
			period:
				currentPeriod === 'this_month'
					? 'current_month'
					: currentPeriod === 'this_year'
						? 'current_year'
						: 'current_month'
		});
	}

	// Initialize the category chart
	function initCategoryChart(data) {
		if (categoryChart) {
			categoryChart.destroy();
		}

		if (!data || data.length === 0) return;

		const canvas = document.getElementById('category-chart');
		if (!canvas) return;

		const ctx = canvas.getContext('2d');
		const chartData = createPieChartData(data);

		categoryChart = new Chart(ctx, {
			type: 'doughnut',
			data: chartData,
			options: getChartOptions('doughnut', 'Expenses by Category', 'USD')
		});
	}

	// Initialize the time series chart
	function initTimeSeriesChart(data) {
		if (timeSeriesChart) {
			timeSeriesChart.destroy();
		}

		if (!data || data.length === 0) return;

		const canvas = document.getElementById('time-series-chart');
		if (!canvas) return;

		const ctx = canvas.getContext('2d');
		const chartData = createLineChartData(data);

		timeSeriesChart = new Chart(ctx, {
			type: 'line',
			data: chartData,
			options: getChartOptions('line', 'Expenses Over Time', 'USD')
		});
	}

	// Handle period change
	async function handlePeriodChange(event) {
		currentPeriod = event.target.value;

		try {
			loading = true;
			error = null;

			await Promise.all([
				loadExpenseSummary(),
				loadCategoryData(),
				loadTimeSeriesData(),
				loadBudgetComparison()
			]);
		} catch (err) {
			error = err.message || 'Failed to load dashboard data';
		} finally {
			loading = false;
		}
	}
</script>

<svelte:head>
	<title>Dashboard - Expensis</title>
</svelte:head>

<AppLayout title="Dashboard">
	{#if loading && !summary}
		<div class="flex justify-center items-center h-64">
			<div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
		</div>
	{:else if error}
		<Alert type="error">{error}</Alert>
	{:else}
		<!-- Period selector -->
		<div class="bg-white shadow rounded-lg mb-6 p-4 flex justify-between items-center">
			<h2 class="text-lg font-medium text-gray-900">Period</h2>
			<select
				value={currentPeriod}
				on:change={handlePeriodChange}
				class="mt-1 block w-full sm:w-auto pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
			>
				{#each dateRanges as range}
					<option value={range.value}>{range.label}</option>
				{/each}
			</select>
		</div>

		<!-- Summary cards -->
		<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
			<!-- Total expenses -->
			<div class="bg-white overflow-hidden shadow rounded-lg">
				<div class="px-4 py-5 sm:p-6">
					<div class="flex items-center">
						<div class="flex-shrink-0 bg-blue-500 rounded-md p-3">
							<svg
								class="h-6 w-6 text-white"
								xmlns="http://www.w3.org/2000/svg"
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
						<div class="ml-5 w-0 flex-1">
							<dl>
								<dt class="text-sm font-medium text-gray-500 truncate">Total Expenses</dt>
								<dd>
									<div class="text-lg font-medium text-gray-900">
										{formatCurrency(summary?.total_expenses || 0)}
									</div>
								</dd>
							</dl>
						</div>
					</div>
				</div>
			</div>

			<!-- Number of expenses -->
			<div class="bg-white overflow-hidden shadow rounded-lg">
				<div class="px-4 py-5 sm:p-6">
					<div class="flex items-center">
						<div class="flex-shrink-0 bg-indigo-500 rounded-md p-3">
							<svg
								class="h-6 w-6 text-white"
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
								/>
							</svg>
						</div>
						<div class="ml-5 w-0 flex-1">
							<dl>
								<dt class="text-sm font-medium text-gray-500 truncate">Number of Expenses</dt>
								<dd>
									<div class="text-lg font-medium text-gray-900">
										{summary?.expense_count || 0}
									</div>
								</dd>
							</dl>
						</div>
					</div>
				</div>
			</div>

			<!-- Average expense -->
			<div class="bg-white overflow-hidden shadow rounded-lg">
				<div class="px-4 py-5 sm:p-6">
					<div class="flex items-center">
						<div class="flex-shrink-0 bg-green-500 rounded-md p-3">
							<svg
								class="h-6 w-6 text-white"
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
								/>
							</svg>
						</div>
						<div class="ml-5 w-0 flex-1">
							<dl>
								<dt class="text-sm font-medium text-gray-500 truncate">Average Expense</dt>
								<dd>
									<div class="text-lg font-medium text-gray-900">
										{formatCurrency(summary?.average_expense || 0)}
									</div>
								</dd>
							</dl>
						</div>
					</div>
				</div>
			</div>

			<!-- Highest expense -->
			<div class="bg-white overflow-hidden shadow rounded-lg">
				<div class="px-4 py-5 sm:p-6">
					<div class="flex items-center">
						<div class="flex-shrink-0 bg-red-500 rounded-md p-3">
							<svg
								class="h-6 w-6 text-white"
								xmlns="http://www.w3.org/2000/svg"
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
						<div class="ml-5 w-0 flex-1">
							<dl>
								<dt class="text-sm font-medium text-gray-500 truncate">Highest Expense</dt>
								<dd>
									<div class="text-lg font-medium text-gray-900">
										{formatCurrency(summary?.highest_expense || 0)}
									</div>
								</dd>
							</dl>
						</div>
					</div>
				</div>
			</div>
		</div>

		<!-- Charts -->
		<div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
			<!-- Category chart -->
			<div class="bg-white shadow rounded-lg p-4">
				<h2 class="text-lg font-medium text-gray-900 mb-4">Expenses by Category</h2>
				<div class="h-64">
					<canvas id="category-chart"></canvas>
				</div>
				<div class="mt-4 text-center">
					<a href="/reports/categories" class="text-sm text-blue-600 hover:text-blue-900"
						>View detailed report</a
					>
				</div>
			</div>

			<!-- Time series chart -->
			<div class="bg-white shadow rounded-lg p-4">
				<h2 class="text-lg font-medium text-gray-900 mb-4">Expense Trend</h2>
				<div class="h-64">
					<canvas id="time-series-chart"></canvas>
				</div>
				<div class="mt-4 text-center">
					<a href="/reports/trend" class="text-sm text-blue-600 hover:text-blue-900"
						>View detailed report</a
					>
				</div>
			</div>
		</div>

		<!-- Quick actions -->
		<div class="bg-white shadow rounded-lg mt-6 p-6">
			<h2 class="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>
			<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
				<a
					href="/expenses/new"
					class="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
				>
					<svg
						class="mr-2 -ml-1 h-5 w-5"
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M12 4v16m8-8H4"
						/>
					</svg>
					Add Expense
				</a>
				<a
					href="/budgets/new"
					class="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
				>
					<svg
						class="mr-2 -ml-1 h-5 w-5"
						xmlns="http://www.w3.org/2000/svg"
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
					Create Budget
				</a>
				<a
					href="/reports"
					class="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
				>
					<svg
						class="mr-2 -ml-1 h-5 w-5"
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
						/>
					</svg>
					Generate Reports
				</a>
			</div>
		</div>
	{/if}
</AppLayout>
