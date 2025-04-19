<!-- frontend/src/lib/components/reports/ReportFilters.svelte -->
<script>
	import { getDateRangeOptions } from '$lib/utils/dateUtils';
	import Button from '$lib/components/ui/Button.svelte';

	export let tab = 'summary';
	export let categories = [];
	export let currentPeriod = 'this_month';
	export let chartType = 'pie';
	export let selectedCategory = '';
	export let currentYear = new Date().getFullYear();
	export let onPeriodChange = () => {};
	export let onChartTypeChange = () => {};
	export let onCategoryChange = () => {};
	export let onYearChange = () => {};
	export let onExportChart = () => {};
	export let onSaveReport = () => {};

	const dateRanges = getDateRangeOptions();

	// Chart types
	const chartTypes = [
		{ value: 'pie', label: 'Pie Chart' },
		{ value: 'bar', label: 'Bar Chart' },
		{ value: 'line', label: 'Line Chart' },
		{ value: 'doughnut', label: 'Doughnut Chart' }
	];

	// Available years for heatmap (current year and 4 previous years)
	const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);
</script>

<div class="grid grid-cols-1 gap-4 md:grid-cols-4">
	<!-- Time Period (for all except heatmap) -->
	{#if tab !== 'heatmap' && tab !== 'saved'}
		<div>
			<label for="period" class="block text-sm font-medium text-gray-700">Time Period</label>
			<select
				id="period"
				value={currentPeriod}
				on:change={(e) => onPeriodChange(e)}
				class="mt-1 block w-full rounded-md border-gray-300 py-2 pr-10 pl-3 text-base focus:border-blue-500 focus:ring-blue-500 focus:outline-none sm:text-sm"
			>
				{#each dateRanges as range}
					<option value={range.value}>{range.label}</option>
				{/each}
			</select>
		</div>
	{/if}

	<!-- Chart Type (for category view) -->
	{#if tab === 'by-category'}
		<div>
			<label for="chart-type" class="block text-sm font-medium text-gray-700">Chart Type</label>
			<select
				id="chart-type"
				value={chartType}
				on:change={(e) => onChartTypeChange(e)}
				class="mt-1 block w-full rounded-md border-gray-300 py-2 pr-10 pl-3 text-base focus:border-blue-500 focus:ring-blue-500 focus:outline-none sm:text-sm"
			>
				{#each chartTypes as type}
					<option value={type.value}>{type.label}</option>
				{/each}
			</select>
		</div>
	{/if}

	<!-- Category Filter (for trends) -->
	{#if tab === 'trends'}
		<div>
			<label for="category-filter" class="block text-sm font-medium text-gray-700">Category</label>
			<select
				id="category-filter"
				value={selectedCategory}
				on:change={(e) => onCategoryChange(e)}
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
	{#if tab === 'heatmap'}
		<div>
			<label for="year" class="block text-sm font-medium text-gray-700">Year</label>
			<select
				id="year"
				value={currentYear}
				on:change={(e) => onYearChange(e)}
				class="mt-1 block w-full rounded-md border-gray-300 py-2 pr-10 pl-3 text-base focus:border-blue-500 focus:ring-blue-500 focus:outline-none sm:text-sm"
			>
				{#each years as year}
					<option value={year}>{year}</option>
				{/each}
			</select>
		</div>
	{/if}

	<!-- Action buttons -->
	{#if tab !== 'saved'}
		<div class="flex justify-end space-x-2 md:col-span-4">
			<Button variant="outline" on:click={onSaveReport} size="sm">
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

			<Button variant="outline" on:click={onExportChart} size="sm">
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
		</div>
	{/if}
</div>
