<!-- frontend/src/routes/dashboard/+page.svelte -->
<script>
	import { onMount } from 'svelte';
	import AppLayout from '$lib/components/layout/AppLayout.svelte';
	import { expenseStore } from '$lib/stores/expenseStore';
	import { categoryStore } from '$lib/stores/categoryStore';
	import { reportStore } from '$lib/stores/reportStore';
	import Alert from '$lib/components/ui/Alert.svelte';

	// Import dashboard components
	import DashboardLayout from '$lib/components/dashboard/DashboardLayout.svelte';
	import StatisticsCards from '$lib/components/dashboard/StatisticsCards.svelte';
	import RecentExpenses from '$lib/components/dashboard/RecentExpenses.svelte';
	import DashboardCharts from '$lib/components/dashboard/DashboardCharts.svelte';
	import QuickActions from '$lib/components/dashboard/QuickActions.svelte';

	let expenses = [];
	let categories = [];
	let loading = true;
	let error = null;
	let summaryError = false;
	let chartError = false;

	// Dashboard data
	let summaryStats = {
		totalExpenses: 0,
		expenseCount: 0,
		averageExpense: 0,
		highestExpense: 0
	};
	let categoryChart = null;
	let trendChart = null;

	// Current period for reports
	let currentPeriod = 'this_month';

	onMount(async () => {
		try {
			loading = true;

			// Load basic data that shouldn't cause errors
			await categoryStore.loadCategories();
			categories = $categoryStore.categories;

			await expenseStore.loadExpenses({
				start_date: new Date().toISOString().split('T')[0],
				limit: 5
			});

			expenses = $expenseStore.expenses;

			// Try to get summary data
			try {
				const summaryResponse = await reportStore.loadExpenseSummary({
					period: currentPeriod
				});

				if (summaryResponse && summaryResponse.summary) {
					summaryStats = {
						totalExpenses: summaryResponse.summary.total_expenses || 0,
						expenseCount: summaryResponse.summary.expense_count || 0,
						averageExpense: summaryResponse.summary.average_expense || 0,
						highestExpense: summaryResponse.summary.highest_expense || 0
					};

					// Get chart if available
					if (summaryResponse.chart) {
						// This could be used if needed
					}
				}
			} catch (err) {
				console.error('Summary data failed to load:', err);
				summaryError = true;
			}

			// Try to load chart data
			try {
				// Load category chart
				const categoryResponse = await reportStore.loadExpensesByCategory({
					period: currentPeriod,
					chart_type: 'pie'
				});

				if (categoryResponse && categoryResponse.chart) {
					categoryChart = categoryResponse.chart;
				}

				// Load trend chart
				const trendResponse = await reportStore.loadExpensesTimeSeries({
					period: currentPeriod,
					chart_type: 'line',
					group_by: 'auto'
				});

				if (trendResponse && trendResponse.chart) {
					trendChart = trendResponse.chart;
				}
			} catch (err) {
				console.error('Chart data failed to load:', err);
				chartError = true;
			}
		} catch (err) {
			error = err.message;
		} finally {
			loading = false;
		}
	});
</script>

<svelte:head>
	<title>Dashboard - Expensis</title>
</svelte:head>

<AppLayout title="Dashboard">
	<DashboardLayout {loading}>
		{#if error}
			<Alert type="error">{error}</Alert>
		{/if}

		{#if !loading}
			<!-- Statistics Cards -->
			<StatisticsCards stats={summaryStats} currency="USD" />

			<!-- Recent Expenses Section -->
			<RecentExpenses {expenses} loading={false} limit={5} />

			<!-- Charts Section -->
			<DashboardCharts {categoryChart} {trendChart} loading={false} {chartError} />

			<!-- Quick Actions -->
			<QuickActions />
		{/if}
	</DashboardLayout>
</AppLayout>
