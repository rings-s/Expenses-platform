<!-- frontend/src/routes/expenses/[id]/edit/+page.svelte -->
<script>
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import AppLayout from '$lib/components/layout/AppLayout.svelte';
	import { expenseStore } from '$lib/stores/expenseStore';
	import { categoryStore } from '$lib/stores/categoryStore';
	import Alert from '$lib/components/ui/Alert.svelte';
	import ExpenseForm from '$lib/components/expenses/ExpenseForm.svelte';

	// Get the expense ID from the URL
	const expenseId = $page.params.id;

	// State
	let expense = null;
	let categories = [];
	let loading = true;
	let error = null;

	onMount(async () => {
		try {
			loading = true;

			// Load categories
			await categoryStore.loadCategories();
			categories = $categoryStore.categories;

			// Load current expense data
			await loadExpense();
		} catch (err) {
			error = err.message;
		} finally {
			loading = false;
		}
	});

	async function loadExpense() {
		try {
			// Simulate an API call to get a specific expense
			await expenseStore.loadExpenses({});
			const currentExpense = $expenseStore.expenses.find((e) => e.id === expenseId);

			if (!currentExpense) {
				error = 'Expense not found';
				return;
			}

			// Set the form data
			expense = { ...currentExpense };
		} catch (err) {
			error = err.message;
		}
	}

	async function handleSubmit(event) {
		try {
			loading = true;
			error = null;

			// Update expense with the form data
			const formData = event.detail;
			console.log('Updating expense:', formData);

			const result = await expenseStore.updateExpense(expenseId, formData);
			console.log('Expense updated successfully:', result);

			// Redirect to expense details
			goto(`/expenses/${expenseId}`);
		} catch (err) {
			console.error('Error updating expense:', err);
			error = err.message || 'Failed to update expense';
		} finally {
			loading = false;
		}
	}

	function handleError(event) {
		error = event.detail;
	}

	function handleCancel() {
		goto(`/expenses/${expenseId}`);
	}
</script>

<svelte:head>
	<title>Edit Expense - Expensis</title>
</svelte:head>

<AppLayout title="Edit Expense">
	{#if loading && !expense}
		<div class="flex h-64 items-center justify-center rounded-lg bg-white shadow">
			<div class="h-12 w-12 animate-spin rounded-full border-t-2 border-b-2 border-blue-500"></div>
		</div>
	{:else if error && !expense}
		<Alert type="error">{error}</Alert>
		<div class="mt-4">
			<button
				class="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
				on:click={() => goto('/expenses')}
			>
				Back to Expenses
			</button>
		</div>
	{:else if expense}
		<div class="overflow-hidden rounded-lg bg-white shadow">
			<div class="border-b border-gray-200 px-6 py-4">
				<h2 class="text-xl font-semibold text-gray-800">Edit Expense</h2>
			</div>

			<div class="p-6">
				{#if error}
					<Alert type="error">{error}</Alert>
				{/if}

				<ExpenseForm
					{categories}
					{expense}
					{loading}
					isEditing={true}
					on:submit={handleSubmit}
					on:error={handleError}
					on:cancel={handleCancel}
				/>
			</div>
		</div>
	{/if}
</AppLayout>
