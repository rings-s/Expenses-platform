<script>
	import { onMount } from 'svelte';
	import AppLayout from '$lib/components/layout/AppLayout.svelte';
	import { reportStore } from '$lib/stores/reportStore';
	import { categoryStore } from '$lib/stores/categoryStore';
	import { getDateRangeOptions } from '$lib/utils/dateUtils';
	import { formatCurrency } from '$lib/utils/formatters';
	import Button from '$lib/components/ui/Button.svelte';
	import Alert from '$lib/components/ui/Alert.svelte';

	// State
	let loading = true;
	let error = null;
	let activeTab = 'summary';
	let dateRanges = getDateRangeOptions();
	let currentPeriod = 'this_month';
	let categories = [];
	let chart = null;

	// Chart options
	let chartType = 'pie';
	let selectedCategory = '';
	let currentYear = new Date().getFullYear();

	// Report data
	let summary = null;
	let categoryData = [];
	let timeSeriesData = [];
	let savedReports = [];

	// Chart types
	const chartTypes = [
		{ value: 'pie', label: 'Pie Chart' },
		{ value: 'bar', label: 'Bar Chart' },
		{ value: 'line', label: 'Line Chart' },
		{ value: 'doughnut', label: 'Doughnut Chart' }
	];

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

	async function loadSummary() {
		try {
			const selectedRange = dateRanges.find((range) => range.value === currentPeriod);
			const response = await reportStore.loadExpenseSummary({
				period: currentPeriod,
				start_date: selectedRange?.start,
				end_date: selectedRange?.end
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
			const selectedRange = dateRanges.find((range) => range.value === currentPeriod);
			const response = await reportStore.loadExpensesByCategory({
				period: currentPeriod,
				chart_type: chartType,
				start_date: selectedRange?.start,
				end_date: selectedRange?.end
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
			const selectedRange = dateRanges.find((range) => range.value === currentPeriod);
			const response = await reportStore.loadExpensesTimeSeries({
				period: currentPeriod,
				chart_type: 'line',
				group_by: 'auto',
				start_date: selectedRange?.start,
				end_date: selectedRange?.end,
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

	function setActiveTab(tab) {
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

	async function handlePeriodChange(event) {
		currentPeriod = event.target.value;
		loading = true;

		// Reload data for the current tab
		await reloadCurrentTabData();

		loading = false;
	}

	async function handleChartTypeChange(event) {
		chartType = event.target.value;
		if (activeTab === 'by-category') {
			await loadCategoryReport();
		}
	}

	async function handleCategoryChange(event) {
		selectedCategory = event.target.value;
		if (activeTab === 'trends') {
			await loadTimeSeriesReport();
		}
	}

	async function handleYearChange(event) {
		currentYear = event.target.value;
		if (activeTab === 'heatmap') {
			await loadHeatmapReport();
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
		if (!chart) return;

		try {
			loading = true;
			await reportStore.exportChart(chart);
			loading = false;
		} catch (err) {
			error = err.message;
			loading = false;
		}
	}

	async function saveCurrentReport() {
		// Implementation for saving the current report would go here
		alert('Feature to save current report coming soon!');
	}
</script>

<svelte:head>
	<title>Reports - Expensis</title>
</svelte:head>

<AppLayout title="Reports & Analytics">
	{#if error}
		<Alert type="error">{error}</Alert>
	{/if}

	<!-- Navigation Tabs -->
	<div class="mb-6 rounded-lg bg-white shadow">
		<nav class="flex flex-wrap">
			<button
				class={`px-4 py-3 text-sm font-medium ${activeTab === 'summary' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
				on:click={() => setActiveTab('summary')}
			>
				Summary
			</button>
			<button
				class={`px-4 py-3 text-sm font-medium ${activeTab === 'by-category' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
				on:click={() => setActiveTab('by-category')}
			>
				By Category
			</button>
			<button
				class={`px-4 py-3 text-sm font-medium ${activeTab === 'trends' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
				on:click={() => setActiveTab('trends')}
			>
				Trends
			</button>
			<button
				class={`px-4 py-3 text-sm font-medium ${activeTab === 'heatmap' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
				on:click={() => setActiveTab('heatmap')}
			>
				Heatmap
			</button>
			<button
				class={`px-4 py-3 text-sm font-medium ${activeTab === 'saved' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
				on:click={() => setActiveTab('saved')}
			>
				Saved Reports
			</button>
		</nav>
	</div>

	<!-- Filters and Settings -->
	<div class="mb-6 rounded-lg bg-white p-4 shadow">
		<div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
			<!-- Time Period (for all except heatmap) -->
			{#if activeTab !== 'heatmap' && activeTab !== 'saved'}
				<div>
					<label for="period" class="block text-sm font-medium text-gray-700">Time Period</label>
					<select
						id="period"
						value={currentPeriod}
						on:change={handlePeriodChange}
						class="mt-1 block w-full rounded-md border-gray-300 py-2 pr-10 pl-3 text-base focus:border-blue-500 focus:ring-blue-500 focus:outline-none sm:text-sm"
					>
						{#each dateRanges as range}
							<option value={range.value}>{range.label}</option>
						{/each}
					</select>
				</div>
			{/if}

			<!-- Chart Type (for category view) -->
			{#if activeTab === 'by-category'}
				<div>
					<label for="chart-type" class="block text-sm font-medium text-gray-700">Chart Type</label>
					<select
						id="chart-type"
						value={chartType}
						on:change={handleChartTypeChange}
						class="mt-1 block w-full rounded-md border-gray-300 py-2 pr-10 pl-3 text-base focus:border-blue-500 focus:ring-blue-500 focus:outline-none sm:text-sm"
					>
						{#each chartTypes as type}
							<option value={type.value}>{type.label}</option>
						{/each}
					</select>
				</div>
			{/if}

			<!-- Category Filter (for trends) -->
			{#if activeTab === 'trends'}
				<div>
					<label for="category-filter" class="block text-sm font-medium text-gray-700"
						>Category</label
					>
					<select
						id="category-filter"
						value={selectedCategory}
						on:change={handleCategoryChange}
						class="mt-1 block w-full rounded-md border-gray-300 py-2 pr-10 pl-3 text-base focus:border-blue-500 focus:ring-blue-500 focus:outline-none sm:text-sm"
					>
						<option value="">All Categories</option>
						{#each categories as category}
							<option value={category.id}>{category.name}</option>
						{/each}
					</select>
				</div>
			{/if}

			<!-- Year selector (for heatmap) -->
			{#if activeTab === 'heatmap'}
				<div>
					<label for="year" class="block text-sm font-medium text-gray-700">Year</label>
					<select
						id="year"
						value={currentYear}
						on:change={handleYearChange}
						class="mt-1 block w-full rounded-md border-gray-300 py-2 pr-10 pl-3 text-base focus:border-blue-500 focus:ring-blue-500 focus:outline-none sm:text-sm"
					>
						{#each Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i) as year}
							<option value={year}>{year}</option>
						{/each}
					</select>
				</div>
			{/if}

			<!-- Action buttons -->
			<div class="flex items-end justify-end space-x-2 lg:col-span-2">
				{#if activeTab !== 'saved'}
					<Button variant="outline" on:click={saveCurrentReport} size="sm">
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
								d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
							/>
						</svg>
						Save Report
					</Button>

					<Button variant="outline" on:click={exportChart} size="sm">
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
						Export Chart
					</Button>
				{/if}
			</div>
		</div>
	</div>

	<!-- Report Content -->
	{#if loading}
		<div class="flex h-64 items-center justify-center rounded-lg bg-white shadow">
			<div class="h-12 w-12 animate-spin rounded-full border-t-2 border-b-2 border-blue-500"></div>
		</div>
	{:else}
		<!-- Summary View -->
		{#if activeTab === 'summary'}
			<div class="overflow-hidden rounded-lg bg-white shadow">
				{#if summary}
					<div class="p-4">
						<div class="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
							<!-- Total Expenses -->
							<div class="rounded-lg bg-gray-50 p-4">
								<h3 class="text-sm font-medium text-gray-500">Total Expenses</h3>
								<p class="mt-2 text-3xl font-bold text-gray-900">
									{formatCurrency(summary.total_expenses)}
								</p>
							</div>

							<!-- Number of Expenses -->
							<div class="rounded-lg bg-gray-50 p-4">
								<h3 class="text-sm font-medium text-gray-500">Number of Expenses</h3>
								<p class="mt-2 text-3xl font-bold text-gray-900">{summary.expense_count}</p>
							</div>

							<!-- Average Expense -->
							<div class="rounded-lg bg-gray-50 p-4">
								<h3 class="text-sm font-medium text-gray-500">Average Expense</h3>
								<p class="mt-2 text-3xl font-bold text-gray-900">
									{formatCurrency(summary.average_expense)}
								</p>
							</div>

							<!-- Highest Expense -->
							<div class="rounded-lg bg-gray-50 p-4">
								<h3 class="text-sm font-medium text-gray-500">Highest Expense</h3>
								<p class="mt-2 text-3xl font-bold text-gray-900">
									{formatCurrency(summary.highest_expense)}
								</p>
							</div>
						</div>

						{#if chart}
							<div class="mt-4 flex justify-center">
								<img src={chart} alt="Expense Summary Chart" class="h-auto max-w-full" />
							</div>
						{/if}
					</div>
				{:else}
					<div class="p-6 text-center">
						<p class="text-gray-500">No expense data available for the selected period.</p>
					</div>
				{/if}
			</div>

			<!-- Categories View -->
		{:else if activeTab === 'by-category'}
			<div class="overflow-hidden rounded-lg bg-white shadow">
				{#if categoryData && categoryData.length > 0}
					<div class="p-4">
						{#if chart}
							<div class="mb-6 flex justify-center">
								<img src={chart} alt="Expenses by Category Chart" class="h-auto max-w-full" />
							</div>
						{/if}

						<div class="mt-4">
							<h3 class="mb-4 text-lg font-medium text-gray-900">Category Breakdown</h3>
							<div class="overflow-x-auto">
								<table class="min-w-full divide-y divide-gray-200">
									<thead class="bg-gray-50">
										<tr>
											<th
												scope="col"
												class="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"
											>
												Category
											</th>
											<th
												scope="col"
												class="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"
											>
												Amount
											</th>
											<th
												scope="col"
												class="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"
											>
												Count
											</th>
											<th
												scope="col"
												class="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"
											>
												Percentage
											</th>
										</tr>
									</thead>
									<tbody class="divide-y divide-gray-200 bg-white">
										{#each categoryData as item}
											<tr>
												<td class="px-6 py-4 whitespace-nowrap">
													<div class="flex items-center">
														<div
															class="mr-2 h-3 w-3 rounded-full"
															style="background-color: {item.category_color};"
														></div>
														<div class="text-sm font-medium text-gray-900">
															{item.category_name}
														</div>
													</div>
												</td>
												<td class="px-6 py-4 text-sm whitespace-nowrap text-gray-500">
													{formatCurrency(item.total_amount)}
												</td>
												<td class="px-6 py-4 text-sm whitespace-nowrap text-gray-500">
													{item.expense_count}
												</td>
												<td class="px-6 py-4 text-sm whitespace-nowrap text-gray-500">
													{item.percentage.toFixed(2)}%
												</td>
											</tr>
										{/each}
									</tbody>
								</table>
							</div>
						</div>
					</div>
				{:else}
					<div class="p-6 text-center">
						<p class="text-gray-500">No category data available for the selected period.</p>
					</div>
				{/if}
			</div>

			<!-- Trends View -->
		{:else if activeTab === 'trends'}
			<div class="overflow-hidden rounded-lg bg-white shadow">
				{#if timeSeriesData && timeSeriesData.length > 0}
					<div class="p-4">
						{#if chart}
							<div class="mb-6 flex justify-center">
								<img src={chart} alt="Expense Trends Chart" class="h-auto max-w-full" />
							</div>
						{/if}
					</div>
				{:else}
					<div class="p-6 text-center">
						<p class="text-gray-500">No trend data available for the selected period.</p>
					</div>
				{/if}
			</div>

			<!-- Heatmap View -->
		{:else if activeTab === 'heatmap'}
			<div class="overflow-hidden rounded-lg bg-white shadow">
				<div class="p-4">
					{#if chart}
						<div class="flex justify-center">
							<img src={chart} alt="Expense Heatmap" class="h-auto max-w-full" />
						</div>
					{:else}
						<div class="p-6 text-center">
							<p class="text-gray-500">No heatmap data available for the selected year.</p>
						</div>
					{/if}
				</div>
			</div>

			<!-- Saved Reports View -->
		{:else if activeTab === 'saved'}
			<div class="overflow-hidden rounded-lg bg-white shadow">
				{#if savedReports && savedReports.length > 0}
					<div class="p-4">
						<div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
							{#each savedReports as report (report.id)}
								<div class="rounded-lg border p-4 transition-shadow hover:shadow-md">
									<h3 class="text-lg font-medium text-gray-900">{report.name}</h3>
									<p class="mt-1 text-sm text-gray-500">{report.description || 'No description'}</p>
									<div class="mt-2 flex items-center">
										<span class="text-xs font-medium text-gray-500">Type:</span>
										<span class="ml-1 text-xs text-gray-900"
											>{report.report_type.replace('_', ' ')}</span
										>
									</div>
									<div class="mt-1 flex items-center">
										<span class="text-xs font-medium text-gray-500">Chart:</span>
										<span class="ml-1 text-xs text-gray-900">{report.chart_type}</span>
									</div>
									<div class="mt-3 flex justify-end space-x-2">
										<button class="text-sm text-blue-600 hover:text-blue-900">View</button>
										<button class="text-sm text-red-600 hover:text-red-900">Delete</button>
									</div>
								</div>
							{/each}
						</div>
					</div>
				{:else}
					<div class="p-6 text-center">
						<p class="text-gray-500">
							No saved reports found. Create and save reports to access them here.
						</p>
					</div>
				{/if}
			</div>
		{/if}
	{/if}
</AppLayout>
