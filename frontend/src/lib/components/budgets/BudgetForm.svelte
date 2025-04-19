<script>
	import { createEventDispatcher } from 'svelte';
	import FormField from '$lib/components/ui/FormField.svelte';
	import Button from '$lib/components/ui/Button.svelte';

	export let categories = [];
	export let loading = false;
	export let budget = {
		amount: '',
		currency: 'USD',
		period: 'monthly',
		start_date: new Date().toISOString().split('T')[0],
		category: ''
	};
	export let isEditing = false;

	const dispatch = createEventDispatcher();

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

	function handleSubmit() {
		// Basic validation
		if (!budget.amount || isNaN(parseFloat(budget.amount)) || parseFloat(budget.amount) <= 0) {
			dispatch('error', 'Please enter a valid amount greater than zero');
			return;
		}

		if (!budget.start_date) {
			dispatch('error', 'Start date is required');
			return;
		}

		// Prepare form data with parsed amount
		const formData = {
			...budget,
			amount: parseFloat(budget.amount)
		};

		console.log('Budget form submitting:', formData);
		dispatch('submit', formData);
	}

	function handleCancel() {
		dispatch('cancel');
	}
</script>

<form on:submit|preventDefault={handleSubmit} class="space-y-6">
	<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
		<FormField
			label="Amount"
			name="amount"
			type="number"
			step="0.01"
			required={true}
			bind:value={budget.amount}
			placeholder="0.00"
		/>

		<div>
			<label for="currency" class="block text-sm font-medium text-gray-700">Currency</label>
			<select
				id="currency"
				bind:value={budget.currency}
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
				bind:value={budget.period}
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
			bind:value={budget.start_date}
		/>

		<div class="md:col-span-2">
			<label for="category" class="block text-sm font-medium text-gray-700">Category</label>
			<select
				id="category"
				bind:value={budget.category}
				class="mt-1 block w-full rounded-md border-gray-300 py-2 pr-10 pl-3 text-base focus:border-blue-500 focus:ring-blue-500 focus:outline-none sm:text-sm"
			>
				<option value="">All Categories (Overall Budget)</option>
				{#each categories as category}
					<option value={category.id}>{category.name}</option>
				{/each}
			</select>
			<p class="mt-1 text-sm text-gray-500">
				Select a category to create a budget for specific expenses, or leave blank for an overall
				budget.
			</p>
		</div>
	</div>

	<div class="flex justify-end space-x-3 border-t pt-4">
		<Button type="button" variant="outline" on:click={handleCancel}>Cancel</Button>
		<Button type="submit" variant="primary" {loading}>
			{isEditing ? 'Update' : 'Create'} Budget
		</Button>
	</div>
</form>
