<script>
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import AppLayout from '$lib/components/layout/AppLayout.svelte';
	import { expenseStore } from '$lib/stores/expenseStore';
	import { categoryStore } from '$lib/stores/categoryStore';
	import { formatCurrency, formatDate } from '$lib/utils/formatters';
	import Button from '$lib/components/ui/Button.svelte';
	import Alert from '$lib/components/ui/Alert.svelte';

	// Get the expense ID from the URL
	const expenseId = $page.params.id;

	// State variables
	let expense = null;
	let loading = true;
	let error = null;
	let categories = [];

	onMount(async () => {
		try {
			loading = true;

			// Load categories
			await categoryStore.loadCategories();
			categories = $categoryStore.categories;

			// Load expense details
			await loadExpenseDetails();
		} catch (err) {
			error = err.message;
		} finally {
			loading = false;
		}
	});

	async function loadExpenseDetails() {
		try {
			// This would typically be retrieved from a direct API call
			// but for now we'll simulate by filtering the expenses we have
			await expenseStore.loadExpenses({});
			expense = $expenseStore.expenses.find((e) => e.id === expenseId);

			if (!expense) {
				error = 'Expense not found';
			}
		} catch (err) {
			error = err.message;
		}
	}

	async function handleDelete() {
		if (confirm('Are you sure you want to delete this expense?')) {
			try {
				loading = true;
				await expenseStore.deleteExpense(expenseId);
				goto('/expenses');
			} catch (err) {
				error = err.message;
				loading = false;
			}
		}
	}

	function getPaymentMethodLabel(method) {
		const methods = {
			cash: 'Cash',
			credit_card: 'Credit Card',
			debit_card: 'Debit Card',
			bank_transfer: 'Bank Transfer',
			mobile_payment: 'Mobile Payment',
			other: 'Other'
		};
		return methods[method] || method;
	}
</script>

<svelte:head>
	<title>{expense ? expense.description : 'Expense Details'} - Expensis</title>
</svelte:head>

<AppLayout title="Expense Details">
	{#if error}
		<Alert type="error">{error}</Alert>
		<div class="mt-4">
			<Button variant="outline" on:click={() => goto('/expenses')}>Back to Expenses</Button>
		</div>
	{:else if loading}
		<div class="flex h-64 items-center justify-center rounded-lg bg-white shadow">
			<div class="h-12 w-12 animate-spin rounded-full border-t-2 border-b-2 border-blue-500"></div>
		</div>
	{:else if expense}
		<div class="overflow-hidden rounded-lg bg-white shadow">
			<!-- Header with actions -->
			<div class="flex items-center justify-between border-b border-gray-200 px-6 py-4">
				<h2 class="text-xl font-semibold text-gray-800">{expense.description}</h2>
				<div class="flex space-x-2">
					<Button variant="outline" on:click={() => goto('/expenses')}>Back</Button>
					<Button variant="primary" on:click={() => goto(`/expenses/${expenseId}/edit`)}>
						Edit
					</Button>
					<Button variant="danger" on:click={handleDelete}>Delete</Button>
				</div>
			</div>

			<!-- Expense details -->
			<div class="p-6">
				<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
					<!-- Left column -->
					<div>
						<div class="mb-6">
							<h3 class="mb-2 text-lg font-medium text-gray-900">Basic Information</h3>
							<div class="rounded-lg bg-gray-50 p-4">
								<div class="grid grid-cols-2 gap-4">
									<div>
										<p class="text-sm font-medium text-gray-500">Amount</p>
										<p class="mt-1 text-lg font-semibold text-gray-900">
											{formatCurrency(expense.amount, expense.currency)}
										</p>
									</div>
									<div>
										<p class="text-sm font-medium text-gray-500">Date</p>
										<p class="mt-1 text-sm text-gray-900">
											{formatDate(expense.date, 'long')}
										</p>
									</div>
									<div>
										<p class="text-sm font-medium text-gray-500">Category</p>
										<p class="mt-1 flex items-center text-sm text-gray-900">
											{#if expense.category_color}
												<span
													class="mr-1.5 inline-block h-3 w-3 rounded-full"
													style="background-color: {expense.category_color};"
												></span>
											{/if}
											{expense.category_name || 'Uncategorized'}
										</p>
									</div>
									<div>
										<p class="text-sm font-medium text-gray-500">Payment Method</p>
										<p class="mt-1 text-sm text-gray-900">
											{getPaymentMethodLabel(expense.payment_method)}
										</p>
									</div>
								</div>
							</div>
						</div>

						{#if expense.notes}
							<div class="mb-6">
								<h3 class="mb-2 text-lg font-medium text-gray-900">Notes</h3>
								<div class="rounded-lg bg-gray-50 p-4">
									<p class="text-sm whitespace-pre-wrap text-gray-700">{expense.notes}</p>
								</div>
							</div>
						{/if}
					</div>

					<!-- Right column -->
					<div>
						{#if expense.receipt_image}
							<div class="mb-6">
								<h3 class="mb-2 text-lg font-medium text-gray-900">Receipt</h3>
								<div class="flex justify-center rounded-lg bg-gray-50 p-4">
									<img
										src={expense.receipt_image}
										alt="Receipt"
										class="h-auto max-w-full rounded shadow-sm"
									/>
								</div>
							</div>
						{/if}

						{#if expense.location && Object.keys(expense.location).length > 0}
							<div class="mb-6">
								<h3 class="mb-2 text-lg font-medium text-gray-900">Location</h3>
								<div class="rounded-lg bg-gray-50 p-4">
									<p class="text-sm text-gray-700">
										{expense.location.name || 'Location information'}
									</p>
								</div>
							</div>
						{/if}

						<div class="mb-6">
							<h3 class="mb-2 text-lg font-medium text-gray-900">Metadata</h3>
							<div class="rounded-lg bg-gray-50 p-4">
								<div class="grid grid-cols-2 gap-4">
									<div>
										<p class="text-sm font-medium text-gray-500">Created</p>
										<p class="mt-1 text-sm text-gray-900">
											{formatDate(expense.created_at, 'medium')}
										</p>
									</div>
									<div>
										<p class="text-sm font-medium text-gray-500">Last Updated</p>
										<p class="mt-1 text-sm text-gray-900">
											{formatDate(expense.updated_at, 'medium')}
										</p>
									</div>
									<div>
										<p class="text-sm font-medium text-gray-500">ID</p>
										<p class="mt-1 truncate text-sm text-gray-900">
											{expense.id}
										</p>
									</div>
									<div>
										<p class="text-sm font-medium text-gray-500">Recurring</p>
										<p class="mt-1 text-sm text-gray-900">
											{expense.is_recurring ? 'Yes' : 'No'}
										</p>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	{:else}
		<div class="rounded-lg bg-white p-6 text-center shadow">
			<p class="text-gray-500">Expense not found.</p>
			<div class="mt-4">
				<Button variant="outline" on:click={() => goto('/expenses')}>Back to Expenses</Button>
			</div>
		</div>
	{/if}
</AppLayout>
