<!-- frontend/src/lib/components/reports/SavedReportList.svelte -->
<script>
	export let reports = [];
	export let onViewReport = () => {};
	export let onDeleteReport = () => {};
</script>

<div class="overflow-hidden rounded-lg bg-white shadow">
	{#if reports && reports.length > 0}
		<div class="p-4">
			<div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
				{#each reports as report (report.id)}
					<div class="rounded-lg border p-4 transition-shadow hover:shadow-md">
						<h3 class="text-lg font-medium text-gray-900">{report.name}</h3>
						<p class="mt-1 text-sm text-gray-500">{report.description || 'No description'}</p>
						<div class="mt-2 flex items-center">
							<span class="text-xs font-medium text-gray-500">Type:</span>
							<span class="ml-1 text-xs text-gray-900">
								{report.report_type.replace('_', ' ')}
							</span>
						</div>
						<div class="mt-1 flex items-center">
							<span class="text-xs font-medium text-gray-500">Chart:</span>
							<span class="ml-1 text-xs text-gray-900">{report.chart_type}</span>
						</div>
						<div class="mt-3 flex justify-end space-x-2">
							<button
								class="text-sm text-blue-600 hover:text-blue-900"
								on:click={() => onViewReport(report)}
							>
								View
							</button>
							<button
								class="text-sm text-red-600 hover:text-red-900"
								on:click={() => onDeleteReport(report.id)}
							>
								Delete
							</button>
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
