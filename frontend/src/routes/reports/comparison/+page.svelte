<!-- frontend/src/routes/reports/comparison/+page.svelte -->
<script>
	import { onMount } from 'svelte';
	import AppLayout from '$lib/components/layout/AppLayout.svelte';
	import { reportStore } from '$lib/stores/reportStore';
	import { getDateRangeOptions } from '$lib/utils/dateUtils';
	import Alert from '$lib/components/ui/Alert.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import ComparisonReport from '$lib/components/reports/ComparisonReport.svelte';

	// State
	let loading = true;
	let error = null;
	let periodData = {
		currentPeriod: { label: 'Current Month', data: null },
		previousPeriod: { label: 'Previous Month', data: null }
	};

	// Period options
	let dateRanges = getDateRangeOptions();
	let currentPeriodValue = 'this_month';
	let previousPeriodValue = 'last_month';

	onMount(async () => {
		try {
			loading = true;
			await loadComparisonData();
		} catch (err) {
			error = err.message;
		} finally {
			loading = false;
		}
	});

	async function loadComparisonData() {
		try {
			// Get date ranges for selected periods
			const currentRange = dateRanges.find((r) => r.value === currentPeriodValue);
			const previousRange = dateRanges.find((r) => r.value === previousPeriodValue);

			if (!currentRange || !previousRange) {
				error = 'Invalid period selection';
				return;
			}

			// Load current period data
			const currentResponse = await reportStore.loadExpenseSummary({
				start_date: currentRange.start,
				end_date: currentRange.end
			});

			// Load previous period data
			const previousResponse = await reportStore.loadExpenseSummary({
				start_date: previousRange.start,
				end_date: previousRange.end
			});

			// Update period data
			periodData = {
				currentPeriod: {
					label: currentRange.label,
					data: currentResponse.summary
				},
				previousPeriod: {
					label: previousRange.label,
					data: previousResponse.summary
				}
			};
		} catch (err) {
			error = err.message;
		}
	}

	async function handlePeriodChange() {
		try {
			loading = true;
			error = null;
			await loadComparisonData();
		} catch (err) {
			error = err.message;
		} finally {
			loading = false;
		}
	}

	async function exportComparison() {
		// Implementation would go here
		alert('Export feature not implemented yet');
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
