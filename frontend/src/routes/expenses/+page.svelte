<script>
	import { onMount } from 'svelte';
	import AppLayout from '$lib/components/layout/AppLayout.svelte';
	import { expenseStore } from '$lib/stores/expenseStore';
	import { categoryStore } from '$lib/stores/categoryStore';
	import { formatCurrency, formatDate } from '$lib/utils/formatters';
	import { getDateRangeOptions } from '$lib/utils/dateUtils';
	import Button from '$lib/components/ui/Button.svelte';
	import Alert from '$lib/components/ui/Alert.svelte';

	// State
	let expenses = [];
	let categories = [];
	let loading = true;
	let error = null;
	let dateRanges = getDateRangeOptions();
	let currentPeriod = 'this_month';
	let searchTerm = '';

	// Filters
	let filters = {
		start_date: dateRanges.find((r) => r.value === 'this_month').start,
		end_date: dateRanges.find((r) => r.value === 'this_month').end,
		category: '',
		payment_method: ''
	};

	// Payment methods for dropdown
	const paymentMethods = [
		{ value: 'cash', label: 'Cash' },
		{ value: 'credit_card', label: 'Credit Card' },
		{ value: 'debit_card', label: 'Debit Card' },
		{ value: 'bank_transfer', label: 'Bank Transfer' },
		{ value: 'mobile_payment', label: 'Mobile Payment' },
		{ value: 'other', label: 'Other' }
	];

	onMount(async () => {
		loading = true;
		try {
			// Load categories first, then expenses
			await categoryStore.loadCategories();
			categories = $categoryStore.categories;

			await loadExpenses();
		} catch (err) {
			error = err.message;
		} finally {
			loading = false;
		}
	});

	async function loadExpenses() {
		try {
			await expenseStore.loadExpenses(filters);
			expenses = $expenseStore.expenses;
		} catch (err) {
			error = err.message;
		}
	}

	async function applyFilters() {
		loading = true;
		await loadExpenses();
		loading = false;
	}

	async function clearFilters() {
		filters = {
			start_date: dateRanges.find((r) => r.value === 'this_month').start,
			end_date: dateRanges.find((r) => r.value === 'this_month').end,
			category: '',
			payment_method: ''
		};
		searchTerm = '';
		loading = true;
		await loadExpenses();
		loading = false;
	}

	function handlePeriodChange(event) {
		currentPeriod = event.target.value;
		const range = dateRanges.find((r) => r.value === currentPeriod);
		if (range) {
			filters.start_date = range.start;
			filters.end_date = range.end;
		}
	}

	async function deleteExpense(id) {
		if (confirm('Are you sure you want to delete this expense?')) {
			try {
				loading = true;
				await expenseStore.deleteExpense(id);
				await loadExpenses();
			} catch (err) {
				error = err.message;
			} finally {
				loading = false;
			}
		}
	}

	async function exportExpenses() {
		try {
			loading = true;
			await expenseStore.exportExpenses(filters);
			loading = false;
		} catch (err) {
			error = err.message;
			loading = false;
		}
	}

	// Filter expenses by search term
	$: filteredExpenses = expenses.filter((expense) =>
		searchTerm
			? expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
				(expense.category_name &&
					expense.category_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
				(expense.notes && expense.notes.toLowerCase().includes(searchTerm.toLowerCase()))
			: true
	);
</script>

<svelte:head>
	<title>Expenses - Expensis</title>
</svelte:head>

<AppLayout title="Expenses">
	{#if error}
		<Alert type="error">{error}</Alert>
	{/if}

	<!-- Filters and Actions Bar -->
	<div class="mb-6 rounded-lg bg-white p-4 shadow">
		<div class="mb-4 flex flex-col items-center justify-between sm:flex-row">
			<h2 class="text-lg font-medium">Expense Management</h2>
			<div class="mt-2 flex space-x-2 sm:mt-0">
				<Button variant="primary" on:click={() => (window.location.href = '/expenses/new')}>
					<svg
						class="mr-1 h-4 w-4"
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
				</Button>
				<Button variant="outline" on:click={exportExpenses}>
					<svg
						class="mr-1 h-4 w-4"
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
						/>
					</svg>
					Export
				</Button>
			</div>
		</div>

		<div class="mb-4 grid grid-cols-1 gap-4 md:grid-cols-4">
			<div>
				<label for="period" class="block text-sm font-medium text-gray-700">Period</label>
				<select
					id="period"
					class="mt-1 block w-full rounded-md border-gray-300 py-2 pr-10 pl-3 text-base focus:border-blue-500 focus:ring-blue-500 focus:outline-none sm:text-sm"
					on:change={handlePeriodChange}
				>
					{#each dateRanges as range}
						<option value={range.value}>{range.label}</option>
					{/each}
				</select>
			</div>

			<div>
				<label for="category-filter" class="block text-sm font-medium text-gray-700">Category</label
				>
				<select
					id="category-filter"
					bind:value={filters.category}
					class="mt-1 block w-full rounded-md border-gray-300 py-2 pr-10 pl-3 text-base focus:border-blue-500 focus:ring-blue-500 focus:outline-none sm:text-sm"
				>
					<option value="">All Categories</option>
					{#each categories as category}
						<option value={category.id}>{category.name}</option>
					{/each}
				</select>
			</div>

			<div>
				<label for="payment-method-filter" class="block text-sm font-medium text-gray-700"
					>Payment Method</label
				>
				<select
					id="payment-method-filter"
					bind:value={filters.payment_method}
					class="mt-1 block w-full rounded-md border-gray-300 py-2 pr-10 pl-3 text-base focus:border-blue-500 focus:ring-blue-500 focus:outline-none sm:text-sm"
				>
					<option value="">All Methods</option>
					{#each paymentMethods as method}
						<option value={method.value}>{method.label}</option>
					{/each}
				</select>
			</div>

			<div>
				<label for="search" class="block text-sm font-medium text-gray-700">Search</label>
				<input
					type="text"
					id="search"
					bind:value={searchTerm}
					placeholder="Search expenses..."
					class="mt-1 block w-full rounded-md border-gray-300 py-2 pr-10 pl-3 text-base focus:border-blue-500 focus:ring-blue-500 focus:outline-none sm:text-sm"
				/>
			</div>
		</div>

		<div class="flex justify-end space-x-2">
			<Button variant="outline" on:click={clearFilters} size="sm">Clear Filters</Button>
			<Button variant="primary" on:click={applyFilters} size="sm">Apply Filters</Button>
		</div>
	</div>

	<!-- Expenses Table -->
	{#if loading}
		<div class="flex h-64 items-center justify-center rounded-lg bg-white shadow">
			<div class="h-12 w-12 animate-spin rounded-full border-t-2 border-b-2 border-blue-500"></div>
		</div>
	{:else if filteredExpenses.length === 0}
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
						{#each filteredExpenses as expense (expense.id)}
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
									{paymentMethods.find((m) => m.value === expense.payment_method)?.label ||
										expense.payment_method}
								</td>
								<td class="px-6 py-4 text-right text-sm font-medium whitespace-nowrap">
									<a
										href={`/expenses/${expense.id}/edit`}
										class="mr-3 text-blue-600 hover:text-blue-900"
									>
										Edit
									</a>
									<button
										on:click={() => deleteExpense(expense.id)}
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
</AppLayout>
