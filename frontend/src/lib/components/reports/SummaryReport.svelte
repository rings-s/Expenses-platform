<!-- frontend/src/lib/components/reports/SummaryReport.svelte -->
<script>
	import { formatCurrency } from '$lib/utils/formatters';

	export let summary = null;
	export let chart = null;
</script>

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
