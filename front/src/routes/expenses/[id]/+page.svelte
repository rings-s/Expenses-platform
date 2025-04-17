<!-- /routes/expenses/[id]/+page.svelte -->
<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { expensesService } from '$lib/services/expenses_services';
	import { expenseStore } from '$lib/stores/expenses';
	import ExpenseForm from '$lib/components/expenses/ExpenseForm.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Alert from '$lib/components/ui/Alert.svelte';
	import { toastStore } from '$lib/stores/toast';
	import { goto } from '$app/navigation';
	import type { ExpenseFormData } from '$lib/types/expenses';

	const expenseId = $page.params.id;
	let expense = $state(null);
	let loading = $state(true);
	let updating = $state(false);
	let error = $state<string | null>(null);

	// Load expense data on mount
	onMount(async () => {
		if (!expenseId) return;

		try {
			expense = await expensesService.getExpense(expenseId);
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to load expense';
			console.error('Error loading expense:', err);
		} finally {
			loading = false;
		}
	});

	// Handle form submission
	async function handleSubmit(event) {
		const formData = event.detail;
		updating = true;

		try {
			const updatedExpense = await expensesService.updateExpense(expenseId, formData);
			toastStore.success('Expense updated successfully');
			goto('/expenses');
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to update expense';
		} finally {
			updating = false;
		}
	}

	// Handle cancellation
	function handleCancel() {
		goto('/expenses');
	}
</script>

<div>
	<div class="mb-6 flex items-center justify-between">
		<h1 class="text-2xl font-bold">Edit Expense</h1>

		<Button
			variant="ghost"
			href="/expenses"
			icon="<svg xmlns='http://www.w3.org/2000/svg' class='h-5 w-5' viewBox='0 0 20 20' fill='currentColor'><path fill-rule='evenodd' d='M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z' clip-rule='evenodd' /></svg>"
		>
			Back to Expenses
		</Button>
	</div>

	<!-- Error display -->
	{#if error}
		<Alert type="error" dismissible={true} class="mb-6">
			{error}
		</Alert>
	{/if}

	{#if loading}
		<div class="flex h-64 items-center justify-center">
			<div
				class="border-primary h-8 w-8 animate-spin rounded-full border-4 border-t-transparent"
			></div>
		</div>
	{:else if expense}
		<Card>
			<svelte:fragment slot="header">
				<h2 class="text-lg font-medium">Expense Details</h2>
			</svelte:fragment>

			<ExpenseForm {expense} loading={updating} on:submit={handleSubmit} on:cancel={handleCancel} />
		</Card>
	{:else}
		<Alert type="error" class="mb-6">Expense not found</Alert>
	{/if}
</div>
