<script>
	import { onMount } from 'svelte';
	import AppLayout from '$lib/components/layout/AppLayout.svelte';
	import { budgetStore } from '$lib/stores/budgetStore';
	import { categoryStore } from '$lib/stores/categoryStore';
	import { formatCurrency, formatPercentage } from '$lib/utils/formatters';
	import Button from '$lib/components/ui/Button.svelte';
	import Alert from '$lib/components/ui/Alert.svelte';
	import FormField from '$lib/components/ui/FormField.svelte';

	// State
	let budgets = [];
	let categories = [];
	let loading = true;
	let error = null;
	let showAddForm = false;
	let editingBudget = null;

	// Form data
	let budgetForm = {
		amount: '',
		currency: 'USD',
		period: 'monthly',
		start_date: new Date().toISOString().split('T')[0],
		category: ''
	};

	// Period options
	const periodOptions = [
		{ value: 'daily', label: 'Daily' },
		{ value: 'weekly', label: 'Weekly' },
		{ value: 'monthly', label: 'Monthly' },
		{ value: 'quarterly', label: 'Quarterly' },
		{ value: 'yearly', label: 'Yearly' }
	];

	// Currency options
	const currencies = [
		{ value: 'USD', label: 'US Dollar' },
		{ value: 'EUR', label: 'Euro' },
		{ value: 'GBP', label: 'British Pound' },
		{ value: 'SAR', label: 'Saudi Riyal' },
		{ value: 'CAD', label: 'Canadian Dollar' },
		{ value: 'AUD', label: 'Australian Dollar' }
	];

	onMount(async () => {
		try {
			loading = true;
			// Load categories first, then budgets
			await categoryStore.loadCategories();
			categories = $categoryStore.categories;

			await loadBudgets();
		} catch (err) {
			error = err.message;
		} finally {
			loading = false;
		}
	});

	async function loadBudgets() {
		try {
			await budgetStore.loadBudgets();
			budgets = $budgetStore.budgets;
		} catch (err) {
			error = err.message;
		}
	}

	function resetForm() {
		budgetForm = {
			amount: '',
			currency: 'USD',
			period: 'monthly',
			start_date: new Date().toISOString().split('T')[0],
			category: ''
		};
		editingBudget = null;
	}

	function startAddBudget() {
		resetForm();
		showAddForm = true;
	}

	function startEditBudget(budget) {
		editingBudget = budget;
		budgetForm = {
			amount: budget.amount,
			currency: budget.currency,
			period: budget.period,
			start_date: budget.start_date,
			category: budget.category
		};
		showAddForm = true;
	}

	function cancelForm() {
		showAddForm = false;
		resetForm();
	}

	async function submitBudget() {
		try {
			loading = true;
			error = null;

			if (editingBudget) {
				await budgetStore.updateBudget(editingBudget.id, budgetForm);
			} else {
				await budgetStore.createBudget(budgetForm);
			}

			showAddForm = false;
			resetForm();
			await loadBudgets();
		} catch (err) {
			error = err.message;
		} finally {
			loading = false;
		}
	}

	async function deleteBudget(id) {
		if (confirm('Are you sure you want to delete this budget?')) {
			try {
				loading = true;
				error = null;
				await budgetStore.deleteBudget(id);
				await loadBudgets();
			} catch (err) {
				error = err.message;
			} finally {
				loading = false;
			}
		}
	}

	// Get progress bar color based on percentage
	function getProgressColor(percentage, isOverBudget) {
		if (isOverBudget) return 'bg-red-500';
		if (percentage > 90) return 'bg-yellow-500';
		if (percentage > 75) return 'bg-yellow-400';
		return 'bg-green-500';
	}

	// Group budgets by period
	$: groupedBudgets = budgets.reduce((groups, budget) => {
		const group = groups[budget.period] || [];
		group.push(budget);
		groups[budget.period] = group;
		return groups;
	}, {});
</script>

<svelte:head>
	<title>Budgets - Expensis</title>
</svelte:head>

<AppLayout title="Budgets">
	{#if error}
		<Alert type="error">{error}</Alert>
	{/if}

	<!-- Header and Actions -->
	<div class="mb-6 rounded-lg bg-white p-4 shadow">
		<div class="flex flex-col items-center justify-between sm:flex-row">
			<h2 class="text-lg font-medium">Budget Management</h2>
			<div class="mt-2 sm:mt-0">
				<Button variant="primary" on:click={startAddBudget}>
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
					Add Budget
				</Button>
			</div>
		</div>
	</div>

	<!-- Add/Edit Budget Form -->
	{#if showAddForm}
		<div class="mb-6 rounded-lg bg-white p-4 shadow">
			<h2 class="mb-4 text-lg font-medium">{editingBudget ? 'Edit Budget' : 'Add New Budget'}</h2>

			<form on:submit|preventDefault={submitBudget} class="grid grid-cols-1 gap-4 md:grid-cols-2">
				<FormField
					label="Amount"
					name="amount"
					type="number"
					required={true}
					bind:value={budgetForm.amount}
				/>

				<div>
					<label for="currency" class="block text-sm font-medium text-gray-700">Currency</label>
					<select
						id="currency"
						bind:value={budgetForm.currency}
						class="mt-1 block w-full rounded-md border-gray-300 py-2 pr-10 pl-3 text-base focus:border-blue-500 focus:ring-blue-500 focus:outline-none sm:text-sm"
						required
					>
						{#each currencies as currency}
							<option value={currency.value}>{currency.label}</option>
						{/each}
					</select>
				</div>

				<div>
					<label for="period" class="block text-sm font-medium text-gray-700">Period</label>
					<select
						id="period"
						bind:value={budgetForm.period}
						class="mt-1 block w-full rounded-md border-gray-300 py-2 pr-10 pl-3 text-base focus:border-blue-500 focus:ring-blue-500 focus:outline-none sm:text-sm"
						required
					>
						{#each periodOptions as period}
							<option value={period.value}>{period.label}</option>
						{/each}
					</select>
				</div>

				<FormField
					label="Start Date"
					name="start_date"
					type="date"
					required={true}
					bind:value={budgetForm.start_date}
				/>

				<div class="md:col-span-2">
					<label for="category" class="block text-sm font-medium text-gray-700">Category</label>
					<select
						id="category"
						bind:value={budgetForm.category}
						class="mt-1 block w-full rounded-md border-gray-300 py-2 pr-10 pl-3 text-base focus:border-blue-500 focus:ring-blue-500 focus:outline-none sm:text-sm"
					>
						<option value="">All Categories (Overall Budget)</option>
						{#each categories as category}
							<option value={category.id}>{category.name}</option>
						{/each}
					</select>
				</div>

				<div class="flex justify-end space-x-2 md:col-span-2">
					<Button variant="outline" on:click={cancelForm} type="button">Cancel</Button>
					<Button variant="primary" type="submit" {loading}>
						{editingBudget ? 'Update Budget' : 'Add Budget'}
					</Button>
				</div>
			</form>
		</div>
	{/if}

	<!-- Budgets Display -->
	{#if loading && budgets.length === 0}
		<div class="flex h-64 items-center justify-center">
			<div class="h-12 w-12 animate-spin rounded-full border-t-2 border-b-2 border-blue-500"></div>
		</div>
	{:else if budgets.length === 0}
		<div class="rounded-lg bg-white p-6 text-center shadow">
			<p class="text-gray-500">
				No budgets found. Create your first budget by clicking the "Add Budget" button.
			</p>
		</div>
	{:else}
		<!-- Group budgets by period -->
		{#each Object.entries(groupedBudgets) as [period, periodBudgets]}
			<div class="mb-8">
				<h3 class="mb-4 text-lg font-medium text-gray-900 capitalize">{period} Budgets</h3>
				<div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
					{#each periodBudgets as budget (budget.id)}
						<div class="overflow-hidden rounded-lg bg-white shadow">
							<div class="p-4">
								<div class="mb-4 flex items-start justify-between">
									<div>
										<h4 class="text-lg font-medium text-gray-900">
											{budget.category_name || 'Overall Budget'}
										</h4>
										<p class="mt-1 text-sm text-gray-500">
											{formatCurrency(budget.amount, budget.currency)}
											{budget.period}
										</p>
									</div>
									<div class="flex space-x-2">
										<button
											on:click={() => startEditBudget(budget)}
											class="rounded-md p-1 text-gray-400 hover:text-gray-500 focus:outline-none"
										>
											<svg
												xmlns="http://www.w3.org/2000/svg"
												class="h-5 w-5"
												fill="none"
												viewBox="0 0 24 24"
												stroke="currentColor"
											>
												<path
													stroke-linecap="round"
													stroke-linejoin="round"
													stroke-width="2"
													d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
												/>
											</svg>
										</button>
										<button
											on:click={() => deleteBudget(budget.id)}
											class="rounded-md p-1 text-gray-400 hover:text-gray-500 focus:outline-none"
										>
											<svg
												xmlns="http://www.w3.org/2000/svg"
												class="h-5 w-5"
												fill="none"
												viewBox="0 0 24 24"
												stroke="currentColor"
											>
												<path
													stroke-linecap="round"
													stroke-linejoin="round"
													stroke-width="2"
													d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
												/>
											</svg>
										</button>
									</div>
								</div>

								<!-- Budget progress bar -->
								<div class="mb-2">
									<div class="h-2.5 w-full rounded-full bg-gray-200">
										<div
											class={`h-2.5 rounded-full ${getProgressColor(budget.percentage_used, budget.is_over_budget)}`}
											style="width: {Math.min(budget.percentage_used, 100)}%"
										></div>
									</div>
								</div>

								<div class="mb-1 flex justify-between text-sm">
									<span class="text-gray-500">Spent</span>
									<span class="font-medium"
										>{formatCurrency(budget.spent_amount, budget.currency)}</span
									>
								</div>

								<div class="mb-1 flex justify-between text-sm">
									<span class="text-gray-500">Remaining</span>
									<span class="font-medium"
										>{formatCurrency(budget.remaining_amount, budget.currency)}</span
									>
								</div>

								<div class="flex justify-between text-sm">
									<span class="text-gray-500">Progress</span>
									<span class={`font-medium ${budget.is_over_budget ? 'text-red-500' : ''}`}>
										{formatPercentage(budget.percentage_used)}
									</span>
								</div>

								{#if budget.is_over_budget}
									<div class="mt-2 text-xs font-medium text-red-500">
										<svg
											xmlns="http://www.w3.org/2000/svg"
											class="mr-1 inline h-4 w-4"
											fill="none"
											viewBox="0 0 24 24"
											stroke="currentColor"
										>
											<path
												stroke-linecap="round"
												stroke-linejoin="round"
												stroke-width="2"
												d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
											/>
										</svg>
										Over budget
									</div>
								{/if}
							</div>
						</div>
					{/each}
				</div>
			</div>
		{/each}
	{/if}
</AppLayout>
