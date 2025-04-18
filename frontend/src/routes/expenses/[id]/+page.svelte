<!-- frontend/src/routes/expenses/[id]/+page.svelte -->
<script>
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import AppLayout from '$lib/components/layout/AppLayout.svelte';
	import { expenseStore } from '$lib/stores/expenseStore';
	import { categoryStore } from '$lib/stores/categoryStore';
	import Alert from '$lib/components/ui/Alert.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import ExpenseDetail from '$lib/components/expenses/ExpenseDetail.svelte';

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

	function handleEdit() {
		goto(`/expenses/${expenseId}/edit`);
	}

	function handleBack() {
		goto('/expenses');
	}
</script>

<svelte:head>
	<title>{expense ? expense.description : 'Expense Details'} - Expensis</title>
</svelte:head>

<AppLayout title="Expense Details">
	{#if error}
		<Alert type="error">{error}</Alert>
		<div class="mt-4">
			<Button variant="outline" on:click={handleBack}>Back to Expenses</Button>
		</div>
	{:else if loading}
		<div class="flex h-64 items-center justify-center rounded-lg bg-white shadow">
			<div class="h-12 w-12 animate-spin rounded-full border-t-2 border-b-2 border-blue-500"></div>
		</div>
	{:else if expense}
		<ExpenseDetail
			{expense}
			{loading}
			onEdit={handleEdit}
			onDelete={handleDelete}
			onBack={handleBack}
		/>
	{:else}
		<div class="rounded-lg bg-white p-6 text-center shadow">
			<p class="text-gray-500">Expense not found.</p>
			<div class="mt-4">
				<Button variant="outline" on:click={handleBack}>Back to Expenses</Button>
			</div>
		</div>
	{/if}
</AppLayout>
