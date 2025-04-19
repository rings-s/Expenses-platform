<script>
	export let categoryChart = null;
	export let trendChart = null;
	export let loading = false;
	export let chartError = false;
</script>

<div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
	<!-- Expenses by Category Chart -->
	<div class="rounded-lg bg-white p-4 shadow">
		<h2 class="mb-4 text-lg font-medium">Expenses by Category</h2>

		{#if chartError}
			<div class="border-l-4 border-yellow-400 bg-yellow-50 p-4">
				<div class="flex">
					<div class="flex-shrink-0">
						<svg class="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
							<path
								fill-rule="evenodd"
								d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
								clip-rule="evenodd"
							/>
						</svg>
					</div>
					<div class="ml-3">
						<p class="text-sm text-yellow-700">
							There was an issue loading the category chart. Please check back later.
						</p>
					</div>
				</div>
			</div>
		{:else if loading}
			<div class="flex h-48 items-center justify-center">
				<div class="h-8 w-8 animate-spin rounded-full border-t-2 border-b-2 border-blue-500"></div>
			</div>
		{:else if categoryChart}
			<div class="h-64">
				<img src={categoryChart} alt="Expenses by Category Chart" class="mx-auto h-full" />
			</div>
		{:else}
			<div class="flex h-64 items-center justify-center text-gray-500">
				No category data available
			</div>
		{/if}
	</div>

	<!-- Expense Trend Chart -->
	<div class="rounded-lg bg-white p-4 shadow">
		<h2 class="mb-4 text-lg font-medium">Expense Trend</h2>

		{#if chartError}
			<div class="border-l-4 border-yellow-400 bg-yellow-50 p-4">
				<div class="flex">
					<div class="flex-shrink-0">
						<svg class="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
							<path
								fill-rule="evenodd"
								d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
								clip-rule="evenodd"
							/>
						</svg>
					</div>
					<div class="ml-3">
						<p class="text-sm text-yellow-700">
							There was an issue loading the trend chart. Please check back later.
						</p>
					</div>
				</div>
			</div>
		{:else if loading}
			<div class="flex h-48 items-center justify-center">
				<div class="h-8 w-8 animate-spin rounded-full border-t-2 border-b-2 border-blue-500"></div>
			</div>
		{:else if trendChart}
			<div class="h-64">
				<img src={trendChart} alt="Expense Trend Chart" class="mx-auto h-full" />
			</div>
		{:else}
			<div class="flex h-64 items-center justify-center text-gray-500">No trend data available</div>
		{/if}
	</div>
</div>
