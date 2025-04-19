<script>
	import { formatCurrency } from '$lib/utils/formatters';

	export let stats = {
		totalExpenses: 0,
		expenseCount: 0,
		averageExpense: 0,
		highestExpense: 0
	};

	export let currency = 'USD';
</script>

<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
	<!-- Total Expenses -->
	<div class="rounded-lg bg-white p-4 shadow">
		<h3 class="text-sm font-medium text-gray-500">Total Expenses</h3>
		<p class="mt-2 text-3xl font-bold text-gray-900">
			{formatCurrency(stats.totalExpenses, currency)}
		</p>
	</div>

	<!-- Number of Expenses -->
	<div class="rounded-lg bg-white p-4 shadow">
		<h3 class="text-sm font-medium text-gray-500">Number of Expenses</h3>
		<p class="mt-2 text-3xl font-bold text-gray-900">{stats.expenseCount}</p>
	</div>

	<!-- Average Expense -->
	<div class="rounded-lg bg-white p-4 shadow">
		<h3 class="text-sm font-medium text-gray-500">Average Expense</h3>
		<p class="mt-2 text-3xl font-bold text-gray-900">
			{formatCurrency(stats.averageExpense, currency)}
		</p>
	</div>

	<!-- Highest Expense -->
	<div class="rounded-lg bg-white p-4 shadow">
		<h3 class="text-sm font-medium text-gray-500">Highest Expense</h3>
		<p class="mt-2 text-3xl font-bold text-gray-900">
			{formatCurrency(stats.highestExpense, currency)}
		</p>
	</div>
</div>
