<script>
	import { onMount } from 'svelte';
	import AppLayout from '$lib/components/layout/AppLayout.svelte';
	import { expenseStore } from '$lib/stores/expenseStore';
	import { categoryStore } from '$lib/stores/categoryStore';
	import { formatCurrency } from '$lib/utils/formatters';
	import Alert from '$lib/components/ui/Alert.svelte';
	import Button from '$lib/components/ui/Button.svelte';

	let expenses = [];
	let categories = [];
	let loading = true;
	let error = null;
	let summaryError = false;
	let chartError = false;

	onMount(async () => {
		try {
			loading = true;

			// Load basic data that shouldn't cause errors
			await categoryStore.loadCategories();
			categories = $categoryStore.categories;

			await expenseStore.loadExpenses({
				start_date: new Date().toISOString().split('T')[0],
				limit: 5
			});

			expenses = $expenseStore.expenses;

			// Try to get summary data - might fail but we'll handle it
			try {
				// This call might fail with the current backend issues
				await loadSummaryData();
			} catch (err) {
				console.error('Summary data failed to load:', err);
				summaryError = true;
			}

			// Try to load chart data - might fail but we'll handle it
			try {
				// This call might fail with the current backend issues
				await loadChartData();
			} catch (err) {
				console.error('Chart data failed to load:', err);
				chartError = true;
			}
		} catch (err) {
			error = err.message;
		} finally {
			loading = false;
		}
	});

	async function loadSummaryData() {
		// This is a placeholder - we know it might fail with current backend issues
		// You can replace this with actual code once backend is fixed
	}

	async function loadChartData() {
		// This is a placeholder - we know it might fail with current backend issues
		// You can replace this with actual code once backend is fixed
	}
</script>

<svelte:head>
	<title>Dashboard - Expensis</title>
</svelte:head>

<AppLayout title="Dashboard">
	{#if error}
		<Alert type="error">{error}</Alert>
	{/if}

	<!-- Recent Expenses Section - This should work even with the errors -->
	<div class="mb-6 rounded-lg bg-white p-4 shadow">
		<h2 class="mb-4 text-lg font-medium">Recent Expenses</h2>

		{#if loading && expenses.length === 0}
			<div class="flex h-32 items-center justify-center">
				<div class="h-8 w-8 animate-spin rounded-full border-t-2 border-b-2 border-blue-500"></div>
			</div>
		{:else if expenses.length === 0}
			<p class="py-4 text-center text-gray-500">No recent expenses found.</p>
		{:else}
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
						</tr>
					</thead>
					<tbody class="divide-y divide-gray-200 bg-white">
						{#each expenses as expense (expense.id)}
							<tr>
								<td class="px-6 py-4 text-sm whitespace-nowrap text-gray-500">
									{new Date(expense.date).toLocaleDateString()}
								</td>
								<td class="px-6 py-4 text-sm font-medium whitespace-nowrap text-gray-900">
									{expense.description}
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

			<div class="mt-4 text-center">
				<a href="/expenses" class="text-sm font-medium text-blue-600 hover:text-blue-900">
					View all expenses →
				</a>
			</div>
		{/if}
	</div>

	<!-- Summary Section with Error Handling -->
	<div class="mb-6 rounded-lg bg-white p-4 shadow">
		<h2 class="mb-4 text-lg font-medium">Summary</h2>

		{#if summaryError}
			<Alert type="warning">
				There was an issue loading the summary data. Please check back later or contact support if
				the issue persists.
			</Alert>
		{:else if loading}
			<div class="flex h-32 items-center justify-center">
				<div class="h-8 w-8 animate-spin rounded-full border-t-2 border-b-2 border-blue-500"></div>
			</div>
		{/if}
	</div>

	<!-- Charts Section with Error Handling -->
	<div class="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
		<div class="rounded-lg bg-white p-4 shadow">
			<h2 class="mb-4 text-lg font-medium">Expenses by Category</h2>

			{#if chartError}
				<Alert type="warning">
					There was an issue loading the category chart. Please check back later or contact support
					if the issue persists.
				</Alert>
			{:else if loading}
				<div class="flex h-48 items-center justify-center">
					<div
						class="h-8 w-8 animate-spin rounded-full border-t-2 border-b-2 border-blue-500"
					></div>
				</div>
			{/if}
		</div>

		<div class="rounded-lg bg-white p-4 shadow">
			<h2 class="mb-4 text-lg font-medium">Expense Trend</h2>

			{#if chartError}
				<Alert type="warning">
					There was an issue loading the trend chart. Please check back later or contact support if
					the issue persists.
				</Alert>
			{:else if loading}
				<div class="flex h-48 items-center justify-center">
					<div
						class="h-8 w-8 animate-spin rounded-full border-t-2 border-b-2 border-blue-500"
					></div>
				</div>
			{/if}
		</div>
	</div>

	<!-- Quick Actions -->
	<div class="rounded-lg bg-white p-6 shadow">
		<h2 class="mb-4 text-lg font-medium">Quick Actions</h2>
		<div class="grid grid-cols-1 gap-4 md:grid-cols-3">
			<a
				href="/expenses/new"
				class="inline-flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none"
			>
				<svg
					class="mr-2 -ml-1 h-5 w-5"
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M12 4v16m8-8H4"
					/>
				</svg>
				Add Expense
			</a>
			<a
				href="/budgets/new"
				class="inline-flex items-center justify-center rounded-md border border-transparent bg-green-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:outline-none"
			>
				<svg
					class="mr-2 -ml-1 h-5 w-5"
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
					/>
				</svg>
				Create Budget
			</a>
			<a
				href="/reports"
				class="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none"
			>
				<svg
					class="mr-2 -ml-1 h-5 w-5"
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
					/>
				</svg>
				Generate Reports
			</a>
		</div>
	</div>
</AppLayout>
