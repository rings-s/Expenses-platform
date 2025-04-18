<!-- frontend/src/routes/reports/comparison/+page.svelte -->
<script>
	import { onMount } from 'svelte';
	import AppLayout from '$lib/components/layout/AppLayout.svelte';
	import { reportStore } from '$lib/stores/reportStore';
	import { categoryStore } from '$lib/stores/categoryStore';
	import Alert from '$lib/components/ui/Alert.svelte';

	// Import report components
	import ReportTabs from '$lib/components/reports/ReportTabs.svelte';
	import ReportFilters from '$lib/components/reports/ReportFilters.svelte';
	import SummaryReport from '$lib/components/reports/SummaryReport.svelte';
	import CategoryReport from '$lib/components/reports/CategoryReport.svelte';
	import TrendReport from '$lib/components/reports/TrendReport.svelte';
	import HeatmapReport from '$lib/components/reports/HeatmapReport.svelte';
	import SavedReportList from '$lib/components/reports/SavedReportList.svelte';
	import SaveReportModal from '$lib/components/reports/SaveReportModal.svelte';

	import { getDateRangeOptions } from '$lib/utils/dateUtils';
	const dateRanges = getDateRangeOptions();

	// State variables
	let loading = true;
	let error = null;
	let successMessage = '';
	let activeTab = 'summary';
	let currentPeriod = 'this_month';
	let categories = [];
	let chart = null;
	let showSaveModal = false;

	// Chart options
	let chartType = 'pie';
	let selectedCategory = '';
	let currentYear = new Date().getFullYear();

	// Report data
	let summary = null;
	let categoryData = [];
	let timeSeriesData = [];
	let savedReports = [];

	// Reactive statement to clear success message
	$: if (successMessage) {
		setTimeout(() => {
			successMessage = '';
		}, 5000);
	}

	onMount(async () => {
		try {
			loading = true;

			// Load categories
			await categoryStore.loadCategories();
			categories = $categoryStore.categories;

			// Load initial reports
			await Promise.all([loadSummary(), loadCategoryReport(), loadSavedReports()]);
		} catch (err) {
			error = err.message;
		} finally {
			loading = false;
		}
	});

	// Load functions
	async function loadSummary() {
		try {
			const response = await reportStore.loadExpenseSummary({
				period: currentPeriod
			});

			summary = response.summary;
			if (activeTab === 'summary') {
				chart = response.chart;
			}
		} catch (err) {
			error = err.message;
		}
	}

	async function loadCategoryReport() {
		try {
			const response = await reportStore.loadExpensesByCategory({
				period: currentPeriod,
				chart_type: chartType
			});

			categoryData = response.data;
			if (activeTab === 'by-category') {
				chart = response.chart;
			}
		} catch (err) {
			error = err.message;
		}
	}

	async function loadTimeSeriesReport() {
		try {
			const response = await reportStore.loadExpensesTimeSeries({
				period: currentPeriod,
				chart_type: 'line',
				group_by: 'auto',
				category: selectedCategory || undefined
			});

			timeSeriesData = response.data;
			if (activeTab === 'trends') {
				chart = response.chart;
			}
		} catch (err) {
			error = err.message;
		}
	}

	async function loadHeatmapReport() {
		try {
			const response = await reportStore.loadExpenseHeatmap({
				year: currentYear
			});

			if (activeTab === 'heatmap') {
				chart = response.chart;
			}
		} catch (err) {
			error = err.message;
		}
	}

	async function loadSavedReports() {
		try {
			await reportStore.loadReports();
			savedReports = $reportStore.reports;
		} catch (err) {
			error = err.message;
		}
	}

	// Event handlers
	function handleTabChange(tab) {
		activeTab = tab;
		loading = true;

		// Load appropriate data based on selected tab
		switch (tab) {
			case 'summary':
				loadSummary();
				break;
			case 'by-category':
				loadCategoryReport();
				break;
			case 'trends':
				loadTimeSeriesReport();
				break;
			case 'heatmap':
				loadHeatmapReport();
				break;
			case 'saved':
				loadSavedReports();
				break;
		}

		loading = false;
	}

	function handlePeriodChange(event) {
		currentPeriod = event.target.value;
		reloadCurrentTabData();
	}

	function handleChartTypeChange(event) {
		chartType = event.target.value;
		if (activeTab === 'by-category') {
			loadCategoryReport();
		}
	}

	function handleCategoryChange(event) {
		selectedCategory = event.target.value;
		if (activeTab === 'trends') {
			loadTimeSeriesReport();
		}
	}

	function handleYearChange(event) {
		currentYear = event.target.value;
		if (activeTab === 'heatmap') {
			loadHeatmapReport();
		}
	}

	async function reloadCurrentTabData() {
		switch (activeTab) {
			case 'summary':
				await loadSummary();
				break;
			case 'by-category':
				await loadCategoryReport();
				break;
			case 'trends':
				await loadTimeSeriesReport();
				break;
			case 'heatmap':
				await loadHeatmapReport();
				break;
			case 'saved':
				await loadSavedReports();
				break;
		}
	}

	async function exportChart() {
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

			// Create a download link for the returned file
			const url = window.URL.createObjectURL(blob);
			const a = document.createElement('a');
			a.style.display = 'none';
			a.href = url;

			// Generate filename based on current tab and period
			const tabName = activeTab.replace('-', '_');
			const fileName = `${tabName}_chart_${new Date().toISOString().split('T')[0]}.png`;
			a.download = fileName;

			document.body.appendChild(a);
			a.click();
			window.URL.revokeObjectURL(url);
			document.body.removeChild(a);

			// Add success message
			successMessage = 'Chart exported successfully!';
		} catch (err) {
			console.error('Chart export error:', err);

			// More detailed error handling
			if (err.response) {
				try {
					const errorDetails = await err.response.json();
					error = errorDetails.detail || JSON.stringify(errorDetails);
				} catch {
					error = err.message || 'Failed to export chart';
				}
			} else {
				error = err.message || 'Failed to export chart';
			}
		} finally {
			loading = false;
		}
	}

	async function saveReport(event) {
		const reportData = event.detail;

		try {
			loading = true;
			error = null;
			successMessage = '';

			// Get date range based on period
			const dateRange = dateRanges.find((r) => r.value === currentPeriod) || {};

			// Prepare report data
			const fullReportData = {
				name: reportData.name,
				description: reportData.description || '',
				report_type:
					activeTab === 'summary'
						? 'expense_summary'
						: activeTab === 'by-category'
							? 'expenses_by_category'
							: activeTab === 'trends'
								? 'expenses_over_time'
								: activeTab === 'heatmap'
									? 'expense_heatmap'
									: 'custom',
				chart_type: chartType || 'bar',
				start_date: dateRange.start || null,
				end_date: dateRange.end || null,
				categories: [],
				parameters: {
					period: currentPeriod,
					category: selectedCategory || null,
					chart_type: chartType,
					year: currentYear
				},
				is_favorite: reportData.is_favorite || false
			};

			// Convert parameters to a JSON string if needed
			if (typeof fullReportData.parameters !== 'string') {
				fullReportData.parameters = JSON.stringify(fullReportData.parameters);
			}

			// Create the report
			const savedReport = await reportStore.createReport(fullReportData);

			// Close modal
			showSaveModal = false;

			// Show success message
			successMessage = `Report "${savedReport.name}" saved successfully!`;

			// If on saved reports tab, refresh the list
			if (activeTab === 'saved') {
				await loadSavedReports();
			}
		} catch (err) {
			console.error('Error saving report:', err);

			// More detailed error handling
			if (err.response) {
				try {
					const errorDetails = await err.response.json();
					error = errorDetails.detail || JSON.stringify(errorDetails);
				} catch {
					error = err.message || 'Failed to save report';
				}
			} else {
				error = err.message || 'Failed to save report';
			}
		} finally {
			loading = false;
		}
	}

	async function viewReport(report) {
		window.location.href = `/reports/${report.id}`;
	}

	async function deleteReport(reportId) {
		if (confirm('Are you sure you want to delete this report?')) {
			try {
				loading = true;
				await reportStore.deleteReport(reportId);
				await loadSavedReports();
				successMessage = 'Report deleted successfully!';
			} catch (err) {
				error = err.message;
			} finally {
				loading = false;
			}
		}
	}
</script>

<svelte:head>
	<title>Period Comparison - Expensis</title>
</svelte:head>

<AppLayout title="Period Comparison">
	{#if error}
		<Alert type="error">{error}</Alert>
	{/if}

	<!-- Period Selection Controls -->
	<div class="mb-6 rounded-lg bg-white p-4 shadow">
		<div class="grid grid-cols-1 gap-4 md:grid-cols-3">
			<div>
				<label for="current-period" class="block text-sm font-medium text-gray-700"
					>Current Period</label
				>
				<select
					id="current-period"
					bind:value={currentPeriodValue}
					on:change={handlePeriodChange}
					class="mt-1 block w-full rounded-md border-gray-300 py-2 pr-10 pl-3 text-base focus:border-blue-500 focus:ring-blue-500 focus:outline-none sm:text-sm"
				>
					{#each dateRanges as range}
						<option value={range.value}>{range.label}</option>
					{/each}
				</select>
			</div>

			<div>
				<label for="previous-period" class="block text-sm font-medium text-gray-700"
					>Compare With</label
				>
				<select
					id="previous-period"
					bind:value={previousPeriodValue}
					on:change={handlePeriodChange}
					class="mt-1 block w-full rounded-md border-gray-300 py-2 pr-10 pl-3 text-base focus:border-blue-500 focus:ring-blue-500 focus:outline-none sm:text-sm"
				>
					{#each dateRanges as range}
						<option value={range.value}>{range.label}</option>
					{/each}
				</select>
			</div>

			<div class="flex items-end">
				<Button variant="outline" on:click={exportComparison}>
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
					Export Comparison
				</Button>
			</div>
		</div>
	</div>

	<!-- Comparison Report Content -->
	{#if loading}
		<div class="flex h-64 items-center justify-center rounded-lg bg-white shadow">
			<div class="h-12 w-12 animate-spin rounded-full border-t-2 border-b-2 border-blue-500"></div>
		</div>
	{:else}
		<ComparisonReport {periodData} />
	{/if}
</AppLayout>
