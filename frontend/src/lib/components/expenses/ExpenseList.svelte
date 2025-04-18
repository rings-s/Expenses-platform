<!-- frontend/src/lib/components/expenses/ExpenseList.svelte -->
<script>
	import { formatCurrency, formatDate } from '$lib/utils/formatters';

	export let expenses = [];
	export let loading = false;
	export let onDelete = () => {};

	// Payment methods for display
	const paymentMethods = {
		cash: 'Cash',
		credit_card: 'Credit Card',
		debit_card: 'Debit Card',
		bank_transfer: 'Bank Transfer',
		mobile_payment: 'Mobile Payment',
		other: 'Other'
	};
</script>

{#if loading}
	<div class="flex h-64 items-center justify-center rounded-lg bg-white shadow">
		<div class="h-12 w-12 animate-spin rounded-full border-t-2 border-b-2 border-blue-500"></div>
	</div>
{:else if expenses.length === 0}
	<div class="rounded-lg bg-white p-6 text-center shadow">
		<p class="text-gray-500">
			No expenses found. Create your first expense by clicking the "Add Expense" button.
		</p>
	</div>
{:else}
	<div class="overflow-hidden rounded-lg bg-white shadow">
		<div class="overflow-x-auto">
			<table class="min-w-full divide-y divide-gray-200">
				<thead class="bg-gray-50">
					<tr>
						<th
							class="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"
							>Date</th
						>
						<th
							class="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"
							>Description</th
						>
						<th
							class="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"
							>Category</th
						>
						<th
							class="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"
							>Amount</th
						>
						<th
							class="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"
							>Payment</th
						>
						<th
							class="px-6 py-3 text-right text-xs font-medium tracking-wider text-gray-500 uppercase"
							>Actions</th
						>
					</tr>
				</thead>
				<tbody class="divide-y divide-gray-200 bg-white">
					{#each expenses as expense (expense.id)}
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
											class="mr-1.5 h-3 w-3 rounded-full"
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
							<td class="px-6 py-4 text-sm whitespace-nowrap text-gray-500">
								{paymentMethods[expense.payment_method] || expense.payment_method}
							</td>
							<td class="px-6 py-4 text-right text-sm font-medium whitespace-nowrap">
								<a
									href={`/expenses/${expense.id}/edit`}
									class="mr-3 text-blue-600 hover:text-blue-900"
								>
									Edit
								</a>
								<button
									on:click={() => onDelete(expense.id)}
									class="text-red-600 hover:text-red-900"
								>
									Delete
								</button>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</div>
{/if}
