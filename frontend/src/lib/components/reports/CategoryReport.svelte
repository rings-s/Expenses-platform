<!-- frontend/src/lib/components/reports/CategoryReport.svelte -->
<script>
	import { formatCurrency } from '$lib/utils/formatters';

	export let categoryData = [];
	export let chart = null;
</script>

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
									class="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"
								>
									Category
								</th>
								<th
									class="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"
								>
									Amount
								</th>
								<th
									class="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"
								>
									Count
								</th>
								<th
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
