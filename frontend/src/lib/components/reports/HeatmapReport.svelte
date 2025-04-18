<!-- frontend/src/lib/components/reports/HeatmapReport.svelte -->
<script>
	export let chart = null;
	export let year = new Date().getFullYear();
</script>

<div class="overflow-hidden rounded-lg bg-white shadow">
	<div class="p-4">
		{#if chart}
			<div class="flex justify-center">
				<img src={chart} alt="Expense Heatmap" class="h-auto max-w-full" />
			</div>
		{:else}
			<div class="p-6 text-center">
				<p class="text-gray-500">No heatmap data available for {year}.</p>
			</div>
		{/if}
	</div>
</div>
