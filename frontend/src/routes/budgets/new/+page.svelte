<script>
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import AppLayout from '$lib/components/layout/AppLayout.svelte';
	import { budgetStore } from '$lib/stores/budgetStore';
	import { categoryStore } from '$lib/stores/categoryStore';
	import FormField from '$lib/components/ui/FormField.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Alert from '$lib/components/ui/Alert.svelte';

	// Form data
	let budgetForm = {
		amount: '',
		currency: 'EUR',
		period: 'monthly',
		start_date: new Date().toISOString().split('T')[0],
		category: ''
	};

	// State
	let categories = [];
	let loading = false;
	let error = null;
	let success = false;

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
		{ value: 'EUR', label: 'Euro' },
		{ value: 'USD', label: 'US Dollar' },
		{ value: 'GBP', label: 'British Pound' },
		{ value: 'SAR', label: 'Saudi Riyal' },
		{ value: 'CAD', label: 'Canadian Dollar' },
		{ value: 'AUD', label: 'Australian Dollar' }
	];

	onMount(async () => {
		try {
			// Load categories
			await categoryStore.loadCategories();
			categories = $categoryStore.categories;
		} catch (err) {
			error = err.message;
		}
	});

	async function handleSubmit() {
		try {
			loading = true;
			error = null;
			success = false;

			// Basic validation
			if (
				!budgetForm.amount ||
				isNaN(parseFloat(budgetForm.amount)) ||
				parseFloat(budgetForm.amount) <= 0
			) {
				error = 'Please enter a valid amount greater than zero';
				loading = false;
				return;
			}

			if (!budgetForm.category) {
				error = 'Please select a category for this budget';
				loading = false;
				return;
			}

			// Ensure amount is parsed as a number
			const formData = {
				...budgetForm,
				amount: parseFloat(budgetForm.amount)
			};

			console.log('Submitting budget:', formData);

			// Create budget - this is the critical line that saves to the database
			const result = await budgetStore.createBudget(formData);

			success = true;

			// Reset form after successful submission
			budgetForm = {
				amount: '',
				currency: 'EUR',
				period: 'monthly',
				start_date: new Date().toISOString().split('T')[0],
				category: ''
			};

			// Wait a moment to show success message before redirecting
			setTimeout(() => {
				goto('/budgets');
			}, 1500);
		} catch (err) {
			console.error('Error creating budget:', err);
			error = err.message || 'Failed to create budget. Please try again.';
		} finally {
			loading = false;
		}
	}
</script>

<svelte:head>
	<title>Add Budget - Expensis</title>
</svelte:head>

<AppLayout title="Add Budget">
	<div class="overflow-hidden rounded-lg bg-white shadow">
		<div class="border-b border-gray-200 px-6 py-4">
			<h2 class="text-xl font-semibold text-gray-800">Create New Budget</h2>
		</div>

		<div class="p-6">
			{#if error}
				<Alert type="error">{error}</Alert>
			{/if}

			{#if success}
				<Alert type="success">Budget created successfully!</Alert>
			{/if}

			<form on:submit|preventDefault={handleSubmit} class="space-y-6">
				<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
					<div class="grid grid-cols-2 gap-4">
						<FormField
							label="Amount"
							name="amount"
							type="number"
							step="0.01"
							required={true}
							bind:value={budgetForm.amount}
							placeholder="0.00"
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

					<div>
						<label for="category" class="block text-sm font-medium text-gray-700">Category</label>
						<select
							id="category"
							bind:value={budgetForm.category}
							class="mt-1 block w-full rounded-md border-gray-300 py-2 pr-10 pl-3 text-base focus:border-blue-500 focus:ring-blue-500 focus:outline-none sm:text-sm"
							required
						>
							<option value="">Select Category</option>
							{#each categories as category}
								<option value={category.id}>{category.name}</option>
							{/each}
						</select>
						<p class="mt-1 text-sm text-gray-500">
							This budget will track expenses for the selected category.
						</p>
					</div>
				</div>

				<div class="flex justify-end space-x-3 border-t pt-4">
					<Button type="button" variant="outline" on:click={() => goto('/budgets')}>Cancel</Button>
					<Button type="submit" variant="primary" {loading}>Create Budget</Button>
				</div>
			</form>
		</div>
	</div>
</AppLayout>
