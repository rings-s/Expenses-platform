<!-- frontend/src/lib/components/reports/TrendReport.svelte -->
<script>
	export let timeSeriesData = [];
	export let chart = null;
</script>

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
