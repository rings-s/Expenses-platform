<script>
	import { formatCurrency, formatDate } from '$lib/utils/formatters';

	export let expenses = [];
	export let loading = false;

	// Define the number of expenses to show
	export let limit = 5;

	// Slice the expenses array to show only the desired number
	$: displayedExpenses = expenses.slice(0, limit);
</script>

<div class="rounded-lg bg-white p-4 shadow">
	<div class="mb-4 flex items-center justify-between">
		<h2 class="text-lg font-medium">Recent Expenses</h2>
		<a href="/expenses" class="text-sm font-medium text-blue-600 hover:text-blue-900"> View all </a>
	</div>

	{#if loading}
		<div class="flex h-32 items-center justify-center">
			<div class="h-8 w-8 animate-spin rounded-full border-t-2 border-b-2 border-blue-500"></div>
		</div>
	{:else if displayedExpenses.length === 0}
		<p class="py-4 text-center text-gray-500">No expenses found.</p>
	{:else}
		<div class="overflow-x-auto">
			<table class="min-w-full divide-y divide-gray-200">
				<thead class="bg-gray-50">
					<tr>
						<th
							class="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"
						>
							Date
						</th>
						<th
							class="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"
						>
							Description
						</th>
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
					</tr>
				</thead>
				<tbody class="divide-y divide-gray-200 bg-white">
					{#each displayedExpenses as expense (expense.id)}
						<tr class="hover:bg-gray-50">
							<td class="px-6 py-4 text-sm whitespace-nowrap text-gray-500">
								{formatDate(expense.date, 'medium')}
							</td>
							<td class="px-6 py-4 text-sm font-medium whitespace-nowrap text-gray-900">
								<a href={`/expenses/${expense.id}`} class="hover:text-blue-600">
									{expense.description}
								</a>
							</td>
							<td class="px-6 py-4 text-sm whitespace-nowrap text-gray-500">
								{#if expense.category_color}
									<span class="inline-flex items-center">
										<span
											class="mr-1.5 h-2 w-2 rounded-full"
											style="background-color: {expense.category_color};"
										></span>
										{expense.category_name || 'Uncategorized'}
									</span>
								{:else}
									{expense.category_name || 'Uncategorized'}
								{/if}
							</td>
							<td class="px-6 py-4 text-sm whitespace-nowrap text-gray-900">
								{formatCurrency(expense.amount, expense.currency)}
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{/if}
</div>
