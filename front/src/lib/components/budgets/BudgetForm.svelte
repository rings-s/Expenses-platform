<!--
  BudgetForm Component

  A form for creating and editing budgets:
  - Amount, period, and currency inputs
  - Category selection with color indicators
  - Date selector
  - Real-time validation
  - Responsive design
-->
<script lang="ts">
	import { createEventDispatcher, onMount } from 'svelte';
	import { fade, scale } from 'svelte/transition';
	import { categories } from '$lib/stores/categories';
	import { BUDGET_PERIOD_LABELS, CURRENCY_SYMBOLS } from '$lib/types/expenses';
	import { formatCurrency } from '$lib/utils/format';
	import { validateNumber, validateDate } from '$lib/utils/validation';
	import Button from '$lib/components/ui/Button.svelte';
	import Input from '$lib/components/ui/Input.svelte';
	import Select from '$lib/components/ui/Select.svelte';
	import Alert from '$lib/components/ui/Alert.svelte';
	import type {
		Budget,
		BudgetFormData,
		BudgetPeriod,
		Currency,
		Category
	} from '$lib/types/expenses';

	// Props with Svelte 5 runes
	const { budget = null, submitButtonText = 'Save Budget', showCancelButton = true } = $props();

	// Form data state
	let formData = $state<BudgetFormData>({
		amount: 0,
		currency: 'USD',
		period: 'monthly',
		start_date: new Date().toISOString().split('T')[0],
		category: undefined
	});

	// UI State
	let isSubmitting = $state(false);
	let error = $state('');
	let amountError = $state('');
	let dateError = $state('');
	let isEditMode = $state(false);
	let periodOptions = $state<{ value: string; label: string }[]>([]);
	let currencyOptions = $state<{ value: string; label: string }[]>([]);
	let categoryOptions = $state<{ value: string; label: string; color: string }[]>([]);

	// Monetary formatting
	let displayAmount = $state('');

	// Event dispatcher for form events
	const dispatch = createEventDispatcher<{
		save: { data: BudgetFormData; id?: string };
		cancel: void;
	}>();

	// Initialize form when component mounts
	onMount(() => {
		initializeFormOptions();

		if (budget) {
			// Edit mode
			isEditMode = true;
			formData = {
				amount: budget.amount,
				currency: budget.currency,
				period: budget.period,
				start_date: new Date(budget.start_date).toISOString().split('T')[0],
				category: budget.category ? String(budget.category) : undefined
			};

			// Format display amount
			updateDisplayAmount();
		}
	});

	// Initialize dropdown options
	function initializeFormOptions() {
		// Period options
		periodOptions = Object.entries(BUDGET_PERIOD_LABELS).map(([value, label]) => ({
			value,
			label
		}));

		// Currency options
		currencyOptions = Object.entries(CURRENCY_SYMBOLS).map(([code, symbol]) => ({
			value: code,
			label: `${code} (${symbol})`
		}));

		// Category options with "All Categories" option
		categoryOptions = [
			{ value: '', label: 'All Categories (Uncategorized)', color: '#CCCCCC' },
			...$categories.map((category) => ({
				value: category.id,
				label: category.name,
				color: category.color
			}))
		];

		// Set initial values if not editing
		if (!isEditMode) {
			updateDisplayAmount();
		}
	}

	// Update display amount based on formData.amount
	function updateDisplayAmount() {
		try {
			displayAmount = formData.amount.toString();
		} catch (err) {
			displayAmount = '0';
		}
	}

	// Handle amount input changes
	function handleAmountChange(e: Event) {
		const target = e.target as HTMLInputElement;
		const value = target.value.replace(/[^\d.]/g, '');

		// Update display value
		displayAmount = value;

		// Parse numeric value
		formData.amount = value ? parseFloat(value) : 0;

		// Validate
		validateAmount();
	}

	// Amount validation
	function validateAmount() {
		const result = validateNumber(formData.amount, {
			required: true,
			min: 0,
			positive: true
		});

		amountError = result.error || '';
		return result.valid;
	}

	// Date validation
	function validateStartDate() {
		const result = validateDate(formData.start_date, {
			required: true
		});

		dateError = result.error || '';
		return result.valid;
	}

	// Get selected category object
	function getSelectedCategory(): Category | undefined {
		if (!formData.category) return undefined;
		return $categories.find((c) => c.id === formData.category);
	}

	// Form submission
	async function handleSubmit() {
		// Validate required fields
		if (!validateAmount() || !validateStartDate()) {
			return;
		}

		isSubmitting = true;
		error = '';

		try {
			// Dispatch save event with form data
			dispatch('save', {
				data: formData,
				id: budget?.id
			});
		} catch (err) {
			console.error('Error saving budget:', err);
			error = err instanceof Error ? err.message : 'Failed to save budget';
		} finally {
			isSubmitting = false;
		}
	}

	// Cancel form
	function handleCancel() {
		dispatch('cancel');
	}

	// Reset form
	function resetForm() {
		formData = {
			amount: 0,
			currency: 'USD',
			period: 'monthly',
			start_date: new Date().toISOString().split('T')[0],
			category: undefined
		};

		updateDisplayAmount();
		error = '';
		amountError = '';
		dateError = '';
	}
</script>

<form
	on:submit|preventDefault={handleSubmit}
	class="w-full space-y-4 rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800"
	in:fade={{ duration: 300 }}
>
	<h2 class="mb-4 text-xl font-bold text-gray-900 dark:text-white">
		{isEditMode ? 'Edit Budget' : 'New Budget'}
	</h2>

	{#if error}
		<Alert type="error" class="mb-4">
			{error}
		</Alert>
	{/if}

	<!-- Amount and Currency Row -->
	<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
		<!-- Amount Field -->
		<div>
			<label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
				Budget Amount <span class="text-red-500">*</span>
			</label>
			<div class="relative mt-1 rounded-md shadow-sm">
				<div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
					<span class="text-gray-500 sm:text-sm">
						{CURRENCY_SYMBOLS[formData.currency]}
					</span>
				</div>
				<input
					type="text"
					value={displayAmount}
					on:input={handleAmountChange}
					class={`block w-full rounded-md border px-8 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:bg-gray-700 dark:text-white
            ${amountError ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 dark:border-gray-600'}`}
					placeholder="0.00"
					aria-invalid={!!amountError}
					disabled={isSubmitting}
				/>
				{#if amountError}
					<p class="mt-1 text-sm text-red-600 dark:text-red-500">{amountError}</p>
				{/if}
			</div>
		</div>

		<!-- Currency Selector -->
		<div>
			<Select
				label="Currency"
				options={currencyOptions}
				bind:value={formData.currency}
				required={true}
				disabled={isSubmitting}
			/>
		</div>
	</div>

	<!-- Period and Category Row -->
	<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
		<!-- Period Selector -->
		<div>
			<Select
				label="Budget Period"
				options={periodOptions}
				bind:value={formData.period}
				required={true}
				disabled={isSubmitting}
			/>
		</div>

		<!-- Category Selector -->
		<div>
			<label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
				Category
			</label>
			<div class="relative mt-1">
				<select
					bind:value={formData.category}
					class="block w-full rounded-md border border-gray-300 py-2 pr-10 pl-3 text-gray-900 focus:border-blue-500 focus:ring-blue-500 focus:outline-none sm:text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
					disabled={isSubmitting}
				>
					<option value="">All Categories (Uncategorized)</option>
					{#each $categories as category}
						<option value={category.id}>
							{category.name}
						</option>
					{/each}
				</select>

				{#if formData.category}
					{#if getSelectedCategory()}
						<div
							class="absolute top-0 right-10 mt-2 mr-2 h-5 w-5 rounded-full border border-gray-200 shadow-sm dark:border-gray-600"
							style="background-color: {getSelectedCategory()?.color};"
						></div>
					{/if}
				{/if}
			</div>
		</div>
	</div>

	<!-- Start Date -->
	<div>
		<Input
			type="date"
			label="Start Date"
			bind:value={formData.start_date}
			error={dateError}
			required={true}
			on:blur={validateStartDate}
			disabled={isSubmitting}
		/>
	</div>

	<!-- Budget Summary -->
	<div class="mt-6 rounded-md bg-gray-50 p-4 dark:bg-gray-700">
		<h3 class="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Budget Summary</h3>
		<p class="text-gray-600 dark:text-gray-300">
			You are budgeting <strong>{formatCurrency(formData.amount, formData.currency)}</strong>
			for {BUDGET_PERIOD_LABELS[formData.period as BudgetPeriod].toLowerCase()}
			expenses
			{#if formData.category && getSelectedCategory()}
				in the <span class="font-medium" style="color: {getSelectedCategory()?.color};"
					>{getSelectedCategory()?.name}</span
				> category
			{:else}
				across all categories
			{/if}
			starting from {new Date(formData.start_date).toLocaleDateString()}.
		</p>
	</div>

	<!-- Buttons -->
	<div class="mt-6 flex justify-end space-x-3">
		{#if showCancelButton}
			<Button type="button" variant="secondary" on:click={handleCancel} disabled={isSubmitting}>
				Cancel
			</Button>
		{/if}
		<Button
			type="submit"
			variant="primary"
			loading={isSubmitting}
			disabled={isSubmitting || !!amountError || !!dateError}
		>
			{submitButtonText}
		</Button>
	</div>
</form>

<style>
	/* Custom styling for the amount input */
	input[type='text'] {
		transition: all 0.2s ease;
	}

	input[type='text']:focus {
		transform: translateY(-1px);
	}
</style>
