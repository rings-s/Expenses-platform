<!-- frontend/src/lib/components/reports/ComparisonReport.svelte -->
<script>
	import { formatCurrency, formatPercentage } from '$lib/utils/formatters';

	export let periodData = {
		currentPeriod: { label: 'Current Month', data: null },
		previousPeriod: { label: 'Previous Month', data: null }
	};
	export let chart = null;

	// Calculate the difference between current and previous periods
	$: diff = {
		total:
			periodData.currentPeriod?.data?.total_expenses -
				periodData.previousPeriod?.data?.total_expenses || 0,
		count:
			periodData.currentPeriod?.data?.expense_count -
				periodData.previousPeriod?.data?.expense_count || 0,
		average:
			periodData.currentPeriod?.data?.average_expense -
				periodData.previousPeriod?.data?.average_expense || 0
	};

	// Calculate percentage changes
	$: percentChange = {
		total: periodData.previousPeriod?.data?.total_expenses
			? (diff.total / periodData.previousPeriod.data.total_expenses) * 100
			: 0,
		count: periodData.previousPeriod?.data?.expense_count
			? (diff.count / periodData.previousPeriod.data.expense_count) * 100
			: 0,
		average: periodData.previousPeriod?.data?.average_expense
			? (diff.average / periodData.previousPeriod.data.average_expense) * 100
			: 0
	};

	// Helper function for styling
	function getChangeColor(change) {
		return change > 0 ? 'text-red-600' : change < 0 ? 'text-green-600' : 'text-gray-600';
	}

	function getChangeIcon(change) {
		if (change > 0) {
			return `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clip-rule="evenodd" />
                    </svg>`;
		} else if (change < 0) {
			return `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M12 13a1 1 0 100 2h5a1 1 0 001-1v-5a1 1 0 10-2 0v2.586l-4.293-4.293a1 1 0 00-1.414 0L8 9.586 3.707 5.293a1 1 0 00-1.414 1.414l5 5a1 1 0 001.414 0L11 9.414 14.586 13H12z" clip-rule="evenodd" />
                    </svg>`;
		}
		return '';
	}
</script>

<div class="overflow-hidden rounded-lg bg-white shadow">
	<div class="p-4">
		<h3 class="mb-4 text-lg font-medium text-gray-900">Period Comparison</h3>

		{#if periodData.currentPeriod?.data && periodData.previousPeriod?.data}
			<div class="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
				<!-- Total Expenses Comparison -->
				<div class="rounded-lg bg-gray-50 p-4">
					<h4 class="text-sm font-medium text-gray-500">Total Expenses</h4>
					<div class="mt-2 flex flex-col">
						<div class="flex justify-between">
							<span class="text-sm text-gray-500">{periodData.currentPeriod.label}</span>
							<span class="font-medium"
								>{formatCurrency(periodData.currentPeriod.data.total_expenses)}</span
							>
						</div>
						<div class="flex justify-between">
							<span class="text-sm text-gray-500">{periodData.previousPeriod.label}</span>
							<span class="font-medium"
								>{formatCurrency(periodData.previousPeriod.data.total_expenses)}</span
							>
						</div>
						<div class="mt-2 border-t border-gray-200 pt-2">
							<div class="flex items-center justify-between">
								<span class="text-sm font-medium text-gray-500">Change</span>
								<div class="flex items-center">
									<span class={`font-medium ${getChangeColor(diff.total)}`}>
										{@html getChangeIcon(diff.total)}
										{formatCurrency(Math.abs(diff.total))}
										({formatPercentage(Math.abs(percentChange.total))})
									</span>
								</div>
							</div>
						</div>
					</div>
				</div>

				<!-- Expense Count Comparison -->
				<div class="rounded-lg bg-gray-50 p-4">
					<h4 class="text-sm font-medium text-gray-500">Number of Expenses</h4>
					<div class="mt-2 flex flex-col">
						<div class="flex justify-between">
							<span class="text-sm text-gray-500">{periodData.currentPeriod.label}</span>
							<span class="font-medium">{periodData.currentPeriod.data.expense_count}</span>
						</div>
						<div class="flex justify-between">
							<span class="text-sm text-gray-500">{periodData.previousPeriod.label}</span>
							<span class="font-medium">{periodData.previousPeriod.data.expense_count}</span>
						</div>
						<div class="mt-2 border-t border-gray-200 pt-2">
							<div class="flex items-center justify-between">
								<span class="text-sm font-medium text-gray-500">Change</span>
								<div class="flex items-center">
									<span class={`font-medium ${getChangeColor(diff.count)}`}>
										{@html getChangeIcon(diff.count)}
										{Math.abs(diff.count)}
										({formatPercentage(Math.abs(percentChange.count))})
									</span>
								</div>
							</div>
						</div>
					</div>
				</div>

				<!-- Average Expense Comparison -->
				<div class="rounded-lg bg-gray-50 p-4">
					<h4 class="text-sm font-medium text-gray-500">Average Expense</h4>
					<div class="mt-2 flex flex-col">
						<div class="flex justify-between">
							<span class="text-sm text-gray-500">{periodData.currentPeriod.label}</span>
							<span class="font-medium"
								>{formatCurrency(periodData.currentPeriod.data.average_expense)}</span
							>
						</div>
						<div class="flex justify-between">
							<span class="text-sm text-gray-500">{periodData.previousPeriod.label}</span>
							<span class="font-medium"
								>{formatCurrency(periodData.previousPeriod.data.average_expense)}</span
							>
						</div>
						<div class="mt-2 border-t border-gray-200 pt-2">
							<div class="flex items-center justify-between">
								<span class="text-sm font-medium text-gray-500">Change</span>
								<div class="flex items-center">
									<span class={`font-medium ${getChangeColor(diff.average)}`}>
										{@html getChangeIcon(diff.average)}
										{formatCurrency(Math.abs(diff.average))}
										({formatPercentage(Math.abs(percentChange.average))})
									</span>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			{#if chart}
				<div class="mt-4 flex justify-center">
					<img src={chart} alt="Period Comparison Chart" class="h-auto max-w-full" />
				</div>
			{/if}
		{:else}
			<div class="p-6 text-center">
				<p class="text-gray-500">No comparison data available for the selected periods.</p>
			</div>
		{/if}
	</div>
</div>
