<!-- frontend/src/routes/reports/[id]/+page.svelte -->
<script>
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import AppLayout from '$lib/components/layout/AppLayout.svelte';
	import { reportStore } from '$lib/stores/reportStore';
	import Alert from '$lib/components/ui/Alert.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import SummaryReport from '$lib/components/reports/SummaryReport.svelte';
	import CategoryReport from '$lib/components/reports/CategoryReport.svelte';
	import TrendReport from '$lib/components/reports/TrendReport.svelte';
	import HeatmapReport from '$lib/components/reports/HeatmapReport.svelte';

	// Get the report ID from the URL
	const reportId = $page.params.id;

	// State
	let report = null;
	let reportData = null;
	let chart = null;
	let loading = true;
	let error = null;

	onMount(async () => {
		try {
			loading = true;

			// Load the report details
			await loadReport();

			// Then load the associated data based on report type
			if (report) {
				await loadReportData();
			}
		} catch (err) {
			error = err.message;
		} finally {
			loading = false;
		}
	});

	async function loadReport() {
		try {
			// Load the specific report
			await reportStore.loadReports();
			report = $reportStore.reports.find((r) => r.id === reportId);

			if (!report) {
				error = 'Report not found';
			}
		} catch (err) {
			error = err.message;
		}
	}

	async function loadReportData() {
		// Load different data based on report type
		try {
			const params = {
				...(report.parameters || {}),
				start_date: report.start_date,
				end_date: report.end_date
			};

			switch (report.report_type) {
				case 'expense_summary':
				case 'summary':
					const summaryResponse = await reportStore.loadExpenseSummary(params);
					reportData = summaryResponse.summary;
					chart = summaryResponse.chart;
					break;

				case 'expenses_by_category':
				case 'by_category':
					const categoryResponse = await reportStore.loadExpensesByCategory({
						...params,
						chart_type: report.chart_type
					});
					reportData = categoryResponse.data;
					chart = categoryResponse.chart;
					break;

				case 'expenses_over_time':
				case 'trends':
					const trendsResponse = await reportStore.loadExpensesTimeSeries({
						...params,
						chart_type: report.chart_type || 'line'
					});
					reportData = trendsResponse.data;
					chart = trendsResponse.chart;
					break;

				case 'expense_heatmap':
				case 'heatmap':
					const year = params.year || new Date().getFullYear();
					const heatmapResponse = await reportStore.loadExpenseHeatmap({ year });
					chart = heatmapResponse.chart;
					break;

				default:
					error = 'Unknown report type';
			}
		} catch (err) {
			error = err.message;
		}
	}

	async function handleExportChart() {
		if (!chart) {
			error = 'No chart available to export';
			return;
		}

		try {
			loading = true;
			error = null;

			// Ensure chart is a valid base64 image
			const chartExportData = chart.startsWith('data:image/png;base64,')
				? chart
				: `data:image/png;base64,${chart}`;

			const blob = await reportStore.exportChart(chartExportData);

			// Create a download link
			const url = window.URL.createObjectURL(blob);
			const a = document.createElement('a');
			a.style.display = 'none';
			a.href = url;
			a.download = `${report.name.replace(/\s+/g, '_')}.png`;
			document.body.appendChild(a);
			a.click();
			window.URL.revokeObjectURL(url);
			document.body.removeChild(a);

			loading = false;
		} catch (err) {
			console.error('Export error:', err);
			error = err.message || 'Failed to export chart';
			loading = false;
		}
	}

	async function handleDelete() {
		if (confirm('Are you sure you want to delete this report?')) {
			try {
				loading = true;
				await reportStore.deleteReport(reportId);
				goto('/reports');
			} catch (err) {
				error = err.message;
				loading = false;
			}
		}
	}

	function handleBack() {
		goto('/reports');
	}

	function getReportTypeLabel(type) {
		const types = {
			expense_summary: 'Expense Summary',
			summary: 'Expense Summary',
			expenses_by_category: 'Expenses by Category',
			by_category: 'Expenses by Category',
			expenses_over_time: 'Expenses Over Time',
			trends: 'Expenses Over Time',
			expense_heatmap: 'Expense Heatmap',
			heatmap: 'Expense Heatmap',
			custom: 'Custom Report'
		};
		return types[type] || type;
	}

	function getFormattedDate(dateStr) {
		if (!dateStr) return 'Not specified';
		const date = new Date(dateStr);
		return date.toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		});
	}
</script>

<svelte:head>
	<title>{report ? report.name : 'Report'} - Expensis</title>
</svelte:head>

<AppLayout title={report ? report.name : 'Report Details'}>
	{#if error}
		<Alert type="error">{error}</Alert>
		<div class="mt-4">
			<Button variant="outline" on:click={handleBack}>Back to Reports</Button>
		</div>
	{:else if loading && !report}
		<div class="flex h-64 items-center justify-center rounded-lg bg-white shadow">
			<div class="h-12 w-12 animate-spin rounded-full border-t-2 border-b-2 border-blue-500"></div>
		</div>
	{:else if report}
		<!-- Report header -->
		<div class="mb-6 rounded-lg bg-white p-4 shadow">
			<div class="flex flex-col items-start justify-between md:flex-row md:items-center">
				<div>
					<h2 class="text-xl font-semibold text-gray-900">{report.name}</h2>
					{#if report.description}
						<p class="mt-1 text-sm text-gray-500">{report.description}</p>
					{/if}
					<div class="mt-2 flex flex-wrap items-center text-sm text-gray-500">
						<span class="mr-4">Type: {getReportTypeLabel(report.report_type)}</span>
						<span class="mr-4">Chart: {report.chart_type || 'N/A'}</span>
						{#if report.is_favorite}
							<span class="flex items-center text-yellow-500">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									class="mr-1 h-4 w-4"
									viewBox="0 0 20 20"
									fill="currentColor"
								>
									<path
										d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
									/>
								</svg>
								Favorite
							</span>
						{/if}
					</div>
					{#if report.start_date || report.end_date}
						<div class="mt-1 text-sm text-gray-500">
							Period: {getFormattedDate(report.start_date)} to {getFormattedDate(report.end_date)}
						</div>
					{/if}
				</div>
				<div class="mt-4 flex space-x-2 md:mt-0">
					<Button variant="outline" on:click={handleBack}>Back</Button>
					{#if chart}
						<Button variant="outline" on:click={handleExportChart}>
							<svg
								class="mr-1 h-4 w-4"
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
								/>
							</svg>
							Export
						</Button>
					{/if}
					<Button variant="danger" on:click={handleDelete}>Delete</Button>
				</div>
			</div>
		</div>

		<!-- Report content based on type -->
		{#if loading}
			<div class="flex h-64 items-center justify-center rounded-lg bg-white shadow">
				<div
					class="h-12 w-12 animate-spin rounded-full border-t-2 border-b-2 border-blue-500"
				></div>
			</div>
		{:else if report.report_type === 'expense_summary' || report.report_type === 'summary'}
			<SummaryReport summary={reportData} {chart} />
		{:else if report.report_type === 'expenses_by_category' || report.report_type === 'by_category'}
			<CategoryReport categoryData={reportData} {chart} />
		{:else if report.report_type === 'expenses_over_time' || report.report_type === 'trends'}
			<TrendReport timeSeriesData={reportData} {chart} />
		{:else if report.report_type === 'expense_heatmap' || report.report_type === 'heatmap'}
			<HeatmapReport {chart} year={report.parameters?.year || new Date().getFullYear()} />
		{:else}
			<div class="rounded-lg bg-white p-6 text-center shadow">
				<p class="text-gray-500">This report type is not supported in this view.</p>
			</div>
		{/if}
	{:else}
		<div class="rounded-lg bg-white p-6 text-center shadow">
			<p class="text-gray-500">Report not found.</p>
			<div class="mt-4">
				<Button variant="outline" on:click={handleBack}>Back to Reports</Button>
			</div>
		</div>
	{/if}
</AppLayout>
