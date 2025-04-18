<!-- frontend/src/routes/expenses/+page.svelte -->
<script>
	import { onMount } from 'svelte';
	import AppLayout from '$lib/components/layout/AppLayout.svelte';
	import { expenseStore } from '$lib/stores/expenseStore';
	import { categoryStore } from '$lib/stores/categoryStore';
	import Button from '$lib/components/ui/Button.svelte';
	import Alert from '$lib/components/ui/Alert.svelte';
	import ExpenseList from '$lib/components/expenses/ExpenseList.svelte';
	import ExpenseFilter from '$lib/components/expenses/ExpenseFilter.svelte';

	// State
	let expenses = [];
	let categories = [];
	let loading = true;
	let error = null;
	let searchTerm = '';

	// Filters
	let filters = {
		start_date: null,
		end_date: null,
		category: '',
		payment_method: ''
	};

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
			start_date: null,
			end_date: null,
			category: '',
			payment_method: ''
		};
		searchTerm = '';
		loading = true;
		await loadExpenses();
		loading = false;
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

		<ExpenseFilter
			{categories}
			bind:filters
			bind:searchTerm
			onApplyFilters={applyFilters}
			onClearFilters={clearFilters}
		/>
	</div>

	<!-- Expenses Table -->
	<ExpenseList expenses={filteredExpenses} {loading} onDelete={deleteExpense} />
</AppLayout>
