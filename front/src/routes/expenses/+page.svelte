<!-- /routes/expenses/+page.svelte -->
<script lang="ts">
	import { onMount } from 'svelte';
	import { expensesService } from '$lib/services/expenses_services';
	import {
		expenseStore,
		expenseFilter,
		expenses,
		expenseError,
		expenseIsLoading,
		currentPage,
		totalPages
	} from '$lib/stores/expenses';
	import ExpenseList from '$lib/components/expenses/ExpenseList.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Alert from '$lib/components/ui/Alert.svelte';
	import Modal from '$lib/components/ui/Modal.svelte';
	import { toastStore } from '$lib/stores/toast';
	import { goto } from '$app/navigation';
	import type { Expense } from '$lib/types/expenses';

	// State
	let selectedExpenseId = $state<string | null>(null);
	let deleteModalOpen = $state(false);
	let expenseToDelete = $state<Expense | null>(null);
	let sortField = $state('date');
	let sortDirection = $state<'asc' | 'desc'>('desc');

	// Load expenses on mount
	onMount(async () => {
		await loadExpenses();
	});

	// Load expenses with filters, pagination, and sorting
	async function loadExpenses() {
		try {
			await expensesService.getExpenses(
				$expenseFilter,
				$currentPage,
				10, // pageSize
				sortField,
				sortDirection
			);
		} catch (error) {
			console.error('Error loading expenses:', error);
		}
	}

	// Handle expense selection
	function handleSelectExpense(event) {
		const expense = event.detail;
		selectedExpenseId = expense.id;
		expenseStore.selectExpense(expense);
	}

	// Handle expense editing
	function handleEditExpense(event) {
		const expense = event.detail;
		goto(`/expenses/${expense.id}`);
	}

	// Handle expense deletion
	function handleDeleteExpense(event) {
		expenseToDelete = event.detail;
		deleteModalOpen = true;
	}

	// Confirm expense deletion
	async function confirmDeleteExpense() {
		if (!expenseToDelete) return;

		try {
			const success = await expensesService.deleteExpense(expenseToDelete.id);
			if (success) {
				toastStore.success('Expense deleted successfully');
				if (selectedExpenseId === expenseToDelete.id) {
					selectedExpenseId = null;
				}
			}
		} catch (error) {
			console.error('Error deleting expense:', error);
		} finally {
			deleteModalOpen = false;
			expenseToDelete = null;
		}
	}

	// Handle pagination
	function handlePaginate(event) {
		const page = event.detail;
		expenseStore.setPage(page);
		loadExpenses();
	}

	// Handle sorting
	function handleSort(event) {
		const { field, direction } = event.detail;
		sortField = field;
		sortDirection = direction;
		expenseStore.setSorting(field, direction);
		loadExpenses();
	}

	// Create filter component for the page
	function handleFilterChange() {
		expenseStore.setPage(1); // Reset to first page when filters change
		loadExpenses();
	}

	function handleFilterReset() {
		expenseStore.resetFilter();
		loadExpenses();
	}
</script>

<div class="space-y-6">
	<div class="flex flex-col items-center justify-between gap-4 sm:flex-row">
		<h1 class="text-2xl font-bold">Expenses</h1>

		<Button
			href="/expenses/new"
			variant="primary"
			icon="<svg xmlns='http://www.w3.org/2000/svg' class='h-5 w-5' viewBox='0 0 20 20' fill='currentColor'><path fill-rule='evenodd' d='M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z' clip-rule='evenodd' /></svg>"
		>
			New Expense
		</Button>
	</div>

	<!-- Filters -->
	<Card>
		<svelte:fragment slot="header">
			<div class="flex items-center justify-between">
				<h2 class="text-lg font-medium">Filters</h2>
				<Button variant="ghost" size="sm" on:click={handleFilterReset}>Reset</Button>
			</div>
		</svelte:fragment>

		<div class="grid grid-cols-1 gap-4 md:grid-cols-3">
			<!-- Simple filters implementation - replace with ExpenseFilters component if available -->
			<div>
				<label for="date-filter" class="mb-1 block text-sm font-medium text-gray-700"
					>Date Range</label
				>
				<div class="grid grid-cols-2 gap-2">
					<input
						type="date"
						id="date-filter-start"
						class="focus:border-primary focus:ring-primary-500 focus:ring-opacity-50 w-full rounded-md border-gray-300 shadow-sm focus:ring"
						bind:value={$expenseFilter.start_date}
					/>
					<input
						type="date"
						id="date-filter-end"
						class="focus:border-primary focus:ring-primary-500 focus:ring-opacity-50 w-full rounded-md border-gray-300 shadow-sm focus:ring"
						bind:value={$expenseFilter.end_date}
					/>
				</div>
			</div>

			<div>
				<label for="search-filter" class="mb-1 block text-sm font-medium text-gray-700"
					>Search</label
				>
				<input
					type="text"
					id="search-filter"
					class="focus:border-primary focus:ring-primary-500 focus:ring-opacity-50 w-full rounded-md border-gray-300 shadow-sm focus:ring"
					placeholder="Search expenses..."
					bind:value={$expenseFilter.search}
				/>
			</div>

			<div class="flex items-end">
				<Button variant="primary" on:click={handleFilterChange}>Apply Filters</Button>
			</div>
		</div>
	</Card>

	<!-- Error display -->
	{#if $expenseError}
		<Alert type="error" dismissible>
			{$expenseError}
		</Alert>
	{/if}

	<!-- Expense List -->
	<ExpenseList
		expenses={$expenses}
		loading={$expenseIsLoading}
		error={$expenseError}
		currentPage={$currentPage}
		totalPages={$totalPages}
		{selectedExpenseId}
		on:select={handleSelectExpense}
		on:edit={handleEditExpense}
		on:delete={handleDeleteExpense}
		on:paginate={handlePaginate}
		on:sort={handleSort}
	/>

	<!-- Delete Confirmation Modal -->
	{#if deleteModalOpen}
		<Modal open={deleteModalOpen} title="Delete Expense" on:close={() => (deleteModalOpen = false)}>
			<p class="mb-6">
				Are you sure you want to delete this expense? This action cannot be undone.
			</p>

			<svelte:fragment slot="footer">
				<div class="flex justify-end space-x-3">
					<Button variant="ghost" on:click={() => (deleteModalOpen = false)}>Cancel</Button>

					<Button variant="danger" on:click={confirmDeleteExpense} loading={$expenseIsLoading}>
						Delete
					</Button>
				</div>
			</svelte:fragment>
		</Modal>
	{/if}
</div>
