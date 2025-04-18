<script>
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import AppLayout from '$lib/components/layout/AppLayout.svelte';
	import { expenseStore } from '$lib/stores/expenseStore';
	import { categoryStore } from '$lib/stores/categoryStore';
	import FormField from '$lib/components/ui/FormField.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Alert from '$lib/components/ui/Alert.svelte';

	// Get the expense ID from the URL
	const expenseId = $page.params.id;

	// Form data
	let expenseForm = {
		description: '',
		amount: '',
		date: '',
		category: '',
		payment_method: 'cash',
		currency: 'USD',
		notes: '',
		is_recurring: false,
		location: {}
	};

	// State
	let categories = [];
	let loading = true;
	let error = null;
	let receiptFile = null;
	let receiptPreview = null;

	// Payment methods for dropdown
	const paymentMethods = [
		{ value: 'cash', label: 'Cash' },
		{ value: 'credit_card', label: 'Credit Card' },
		{ value: 'debit_card', label: 'Debit Card' },
		{ value: 'bank_transfer', label: 'Bank Transfer' },
		{ value: 'mobile_payment', label: 'Mobile Payment' },
		{ value: 'other', label: 'Other' }
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
			// This would typically be a direct API call to get a specific expense
			// but for now we'll simulate by loading all expenses and filtering
			await expenseStore.loadExpenses({});
			const expense = $expenseStore.expenses.find((e) => e.id === expenseId);

			if (!expense) {
				error = 'Expense not found';
				return;
			}

			// Populate form with expense data
			expenseForm = {
				description: expense.description,
				amount: expense.amount,
				date: expense.date,
				category: expense.category,
				payment_method: expense.payment_method,
				currency: expense.currency,
				notes: expense.notes || '',
				is_recurring: expense.is_recurring,
				location: expense.location || {}
			};

			// Set receipt preview if exists
			if (expense.receipt_image) {
				receiptPreview = expense.receipt_image;
			}
		} catch (err) {
			error = err.message;
		}
	}

	async function handleSubmit() {
		try {
			loading = true;
			error = null;

			// Basic validation
			if (!expenseForm.description) {
				error = 'Description is required';
				loading = false;
				return;
			}

			if (!expenseForm.amount || isNaN(parseFloat(expenseForm.amount))) {
				error = 'Valid amount is required';
				loading = false;
				return;
			}

			if (!expenseForm.date) {
				error = 'Date is required';
				loading = false;
				return;
			}

			// Update expense
			const result = await expenseStore.updateExpense(expenseId, expenseForm);

			// Redirect to expense details
			goto(`/expenses/${expenseId}`);
		} catch (err) {
			error = err.message;
		} finally {
			loading = false;
		}
	}

	function handleReceiptChange(event) {
		const file = event.target.files[0];
		if (!file) return;

		// Check file type
		if (!file.type.match('image.*')) {
			error = 'Please select an image file';
			return;
		}

		// Preview image
		const reader = new FileReader();
		reader.onload = (e) => {
			receiptPreview = e.target.result;
		};
		reader.readAsDataURL(file);

		// Add to form data
		receiptFile = file;
	}
</script>

<svelte:head>
	<title>Edit Expense - Expensis</title>
</svelte:head>

<AppLayout title="Edit Expense">
	{#if loading}
		<div class="flex h-64 items-center justify-center rounded-lg bg-white shadow">
			<div class="h-12 w-12 animate-spin rounded-full border-t-2 border-b-2 border-blue-500"></div>
		</div>
	{:else}
		<div class="overflow-hidden rounded-lg bg-white shadow">
			<div class="border-b border-gray-200 px-6 py-4">
				<h2 class="text-xl font-semibold text-gray-800">Edit Expense</h2>
			</div>

			<div class="p-6">
				{#if error}
					<Alert type="error">{error}</Alert>

					{#if error === 'Expense not found'}
						<div class="mt-4">
							<Button variant="outline" on:click={() => goto('/expenses')}>Back to Expenses</Button>
						</div>
					{/if}
				{:else}
					<form on:submit|preventDefault={handleSubmit} class="space-y-6">
						<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
							<FormField
								label="Description"
								name="description"
								required={true}
								bind:value={expenseForm.description}
								placeholder="What did you spend on?"
							/>

							<div class="grid grid-cols-2 gap-4">
								<FormField
									label="Amount"
									name="amount"
									type="number"
									required={true}
									bind:value={expenseForm.amount}
									placeholder="0.00"
								/>

								<div>
									<label for="currency" class="block text-sm font-medium text-gray-700"
										>Currency</label
									>
									<select
										id="currency"
										bind:value={expenseForm.currency}
										class="mt-1 block w-full rounded-md border-gray-300 py-2 pr-10 pl-3 text-base focus:border-blue-500 focus:ring-blue-500 focus:outline-none sm:text-sm"
										required
									>
										{#each currencies as currency}
											<option value={currency.value}>{currency.label}</option>
										{/each}
									</select>
								</div>
							</div>

							<FormField
								label="Date"
								name="date"
								type="date"
								required={true}
								bind:value={expenseForm.date}
							/>

							<div>
								<label for="category" class="block text-sm font-medium text-gray-700"
									>Category</label
								>
								<select
									id="category"
									bind:value={expenseForm.category}
									class="mt-1 block w-full rounded-md border-gray-300 py-2 pr-10 pl-3 text-base focus:border-blue-500 focus:ring-blue-500 focus:outline-none sm:text-sm"
								>
									<option value="">Select Category</option>
									{#each categories as category}
										<option value={category.id}>{category.name}</option>
									{/each}
								</select>
							</div>

							<div>
								<label for="payment_method" class="block text-sm font-medium text-gray-700"
									>Payment Method</label
								>
								<select
									id="payment_method"
									bind:value={expenseForm.payment_method}
									class="mt-1 block w-full rounded-md border-gray-300 py-2 pr-10 pl-3 text-base focus:border-blue-500 focus:ring-blue-500 focus:outline-none sm:text-sm"
									required
								>
									{#each paymentMethods as method}
										<option value={method.value}>{method.label}</option>
									{/each}
								</select>
							</div>

							<div class="md:col-span-2">
								<label for="notes" class="block text-sm font-medium text-gray-700">Notes</label>
								<textarea
									id="notes"
									bind:value={expenseForm.notes}
									rows="3"
									class="mt-1 block w-full rounded-md border-gray-300 py-2 pr-10 pl-3 text-base focus:border-blue-500 focus:ring-blue-500 focus:outline-none sm:text-sm"
									placeholder="Add any additional details..."
								></textarea>
							</div>

							<div>
								<label class="block text-sm font-medium text-gray-700">Receipt Image</label>
								<div class="mt-1 flex items-center">
									<label
										class="relative cursor-pointer rounded-md bg-white font-medium text-blue-600 focus-within:outline-none hover:text-blue-500"
									>
										<span>Upload a file</span>
										<input
											type="file"
											accept="image/*"
											class="sr-only"
											on:change={handleReceiptChange}
										/>
									</label>
									<p class="pl-1 text-sm text-gray-500">or drag and drop</p>
								</div>
								<p class="mt-1 text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>

								{#if receiptPreview}
									<div class="mt-2">
										<img
											src={receiptPreview}
											alt="Receipt preview"
											class="h-32 w-auto rounded border"
										/>
									</div>
								{/if}
							</div>

							<div class="flex items-center">
								<input
									type="checkbox"
									id="is_recurring"
									bind:checked={expenseForm.is_recurring}
									class="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
								/>
								<label for="is_recurring" class="ml-2 block text-sm text-gray-900">
									This is a recurring expense
								</label>
							</div>
						</div>

						<div class="flex justify-end space-x-3 border-t pt-4">
							<Button
								type="button"
								variant="outline"
								on:click={() => goto(`/expenses/${expenseId}`)}
							>
								Cancel
							</Button>
							<Button type="submit" variant="primary" {loading}>Update Expense</Button>
						</div>
					</form>
				{/if}
			</div>
		</div>
	{/if}
</AppLayout>
