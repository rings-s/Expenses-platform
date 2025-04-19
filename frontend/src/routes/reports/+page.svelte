<!-- frontend/src/routes/reports/+page.svelte -->
<script>
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
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
	import ReportInsight from '$lib/components/reports/ReportInsight.svelte';

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
			await Promise.all([
				loadSummary(),
				loadCategoryReport(),
				loadTimeSeriesReport(),
				loadSavedReports()
			]);
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
			console.error('Summary load error:', err);
			error = err.message || 'Failed to load summary';
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
			console.error('Category report load error:', err);
			error = err.message || 'Failed to load category report';
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
			console.error('Time series load error:', err);
			error = err.message || 'Failed to load time series';
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
			console.error('Heatmap load error:', err);
			error = err.message || 'Failed to load heatmap';
		}
	}

	async function loadSavedReports() {
		try {
			await reportStore.loadReports();
			savedReports = $reportStore.reports;
		} catch (err) {
			console.error('Saved reports load error:', err);
			error = err.message || 'Failed to load saved reports';
		}
	}

	// Event handlers
	function handleTabChange(tab) {
		activeTab = tab;
		reloadCurrentTabData();
	}

	async function reloadCurrentTabData() {
		loading = true;
		try {
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
		} catch (err) {
			error = err.message;
		} finally {
			loading = false;
		}
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
			error = err.message || 'Failed to export chart';
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

			// Ensure parameters are a string
			fullReportData.parameters = JSON.stringify(fullReportData.parameters);

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
			error = err.message || 'Failed to save report';
		} finally {
			loading = false;
		}
	}

	async function viewReport(report) {
		goto(`/reports/${report.id}`);
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
	<title>Reports - Expensis</title>
</svelte:head>

<AppLayout title="Reports & Analytics">
	<!-- Success Message -->
	{#if successMessage}
		<Alert type="success">{successMessage}</Alert>
	{/if}

	<!-- Error Message -->
	{#if error}
		<Alert type="error">{error}</Alert>
	{/if}

	<!-- Navigation Tabs -->
	<div class="mb-6 rounded-lg bg-white shadow">
		<ReportTabs {activeTab} onTabChange={handleTabChange} />
	</div>

	<!-- Filters and Settings -->
	<div class="mb-6 rounded-lg bg-white p-4 shadow">
		<ReportFilters
			tab={activeTab}
			{categories}
			{currentPeriod}
			{chartType}
			{selectedCategory}
			{currentYear}
			onPeriodChange={handlePeriodChange}
			onChartTypeChange={handleChartTypeChange}
			onCategoryChange={handleCategoryChange}
			onYearChange={handleYearChange}
			onExportChart={exportChart}
			onSaveReport={() => (showSaveModal = true)}
		/>
	</div>

	<!-- Report Content -->
	{#if loading}
		<div class="flex h-64 items-center justify-center rounded-lg bg-white shadow">
			<div class="h-12 w-12 animate-spin rounded-full border-t-2 border-b-2 border-blue-500"></div>
		</div>
	{:else if activeTab === 'summary'}
		<div class="grid grid-cols-1 gap-6 md:grid-cols-3">
			<div class="md:col-span-2">
				<SummaryReport {summary} {chart} />
			</div>
			<div>
				<ReportInsight {summary} {categoryData} {timeSeriesData} />
			</div>
		</div>
	{:else if activeTab === 'by-category'}
		<div class="grid grid-cols-1 gap-6 md:grid-cols-3">
			<div class="md:col-span-2">
				<CategoryReport {categoryData} {chart} />
			</div>
			<div>
				<ReportInsight {summary} {categoryData} {timeSeriesData} />
			</div>
		</div>
	{:else if activeTab === 'trends'}
		<TrendReport {timeSeriesData} {chart} />
	{:else if activeTab === 'heatmap'}
		<HeatmapReport {chart} {currentYear} />
	{:else if activeTab === 'saved'}
		<SavedReportList
			reports={savedReports}
			onViewReport={viewReport}
			onDeleteReport={deleteReport}
		/>
	{/if}

	<!-- Save Report Modal -->
	<SaveReportModal
		isOpen={showSaveModal}
		reportType={activeTab === 'summary'
			? 'expense_summary'
			: activeTab === 'by-category'
				? 'expenses_by_category'
				: activeTab === 'trends'
					? 'expenses_over_time'
					: activeTab === 'heatmap'
						? 'expense_heatmap'
						: 'custom'}
		{chartType}
		on:save={saveReport}
		on:close={() => (showSaveModal = false)}
	/>
</AppLayout>
