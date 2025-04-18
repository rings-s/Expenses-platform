<!-- frontend/src/lib/components/expenses/ExpenseFilter.svelte -->
<script>
	import { getDateRangeOptions } from '$lib/utils/dateUtils';
	import Button from '$lib/components/ui/Button.svelte';

	export let categories = [];
	export let filters = {
		start_date: null,
		end_date: null,
		category: '',
		payment_method: ''
	};
	export let searchTerm = '';
	export let onApplyFilters = () => {};
	export let onClearFilters = () => {};

	let dateRanges = getDateRangeOptions();
	let currentPeriod = 'this_month';

	// Payment methods for dropdown
	const paymentMethods = [
		{ value: 'cash', label: 'Cash' },
		{ value: 'credit_card', label: 'Credit Card' },
		{ value: 'debit_card', label: 'Debit Card' },
		{ value: 'bank_transfer', label: 'Bank Transfer' },
		{ value: 'mobile_payment', label: 'Mobile Payment' },
		{ value: 'other', label: 'Other' }
	];

	function handlePeriodChange(event) {
		currentPeriod = event.target.value;
		const range = dateRanges.find((r) => r.value === currentPeriod);
		if (range) {
			filters.start_date = range.start;
			filters.end_date = range.end;
		}
	}
</script>

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
		<label for="category-filter" class="block text-sm font-medium text-gray-700">Category</label>
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
	<Button variant="outline" on:click={onClearFilters} size="sm">Clear Filters</Button>
	<Button variant="primary" on:click={onApplyFilters} size="sm">Apply Filters</Button>
</div>
