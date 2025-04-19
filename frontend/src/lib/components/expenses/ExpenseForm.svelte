<script>
	import { createEventDispatcher } from 'svelte';
	import FormField from '$lib/components/ui/FormField.svelte';
	import Button from '$lib/components/ui/Button.svelte';

	export let categories = [];
	export let expense = {
		description: '',
		amount: '',
		date: new Date().toISOString().split('T')[0],
		category: '',
		payment_method: 'cash',
		currency: 'USD',
		notes: '',
		is_recurring: false,
		location: {}
	};
	export let loading = false;
	export let isEditing = false;

	const dispatch = createEventDispatcher();

	let receiptFile = null;
	let receiptPreview = expense.receipt_image || null;

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

	function handleSubmit() {
		// Validate form
		if (!expense.description) {
			dispatch('error', 'Description is required');
			return;
		}

		if (!expense.amount || isNaN(parseFloat(expense.amount))) {
			dispatch('error', 'Valid amount is required');
			return;
		}

		if (!expense.date) {
			dispatch('error', 'Date is required');
			return;
		}

		// Create form data with receipt if needed
		const formData = {
			...expense,
			amount: parseFloat(expense.amount),
			receipt_file: receiptFile
		};

		dispatch('submit', formData);
	}

	function handleCancel() {
		dispatch('cancel');
	}

	function handleReceiptChange(event) {
		const file = event.target.files[0];
		if (!file) return;

		// Check file type
		if (!file.type.match('image.*')) {
			dispatch('error', 'Please select an image file');
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

<form on:submit|preventDefault={handleSubmit} class="space-y-6">
	<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
		<FormField
			label="Description"
			name="description"
			required={true}
			bind:value={expense.description}
			placeholder="What did you spend on?"
		/>

		<div class="grid grid-cols-2 gap-4">
			<FormField
				label="Amount"
				name="amount"
				type="number"
				required={true}
				bind:value={expense.amount}
				placeholder="0.00"
			/>

			<div>
				<label for="currency" class="block text-sm font-medium text-gray-700">Currency</label>
				<select
					id="currency"
					bind:value={expense.currency}
					class="mt-1 block w-full rounded-md border-gray-300 py-2 pr-10 pl-3 text-base focus:border-blue-500 focus:ring-blue-500 focus:outline-none sm:text-sm"
					required
				>
					{#each currencies as currency}
						<option value={currency.value}>{currency.label}</option>
					{/each}
				</select>
			</div>
		</div>

		<FormField label="Date" name="date" type="date" required={true} bind:value={expense.date} />

		<div>
			<label for="category" class="block text-sm font-medium text-gray-700">Category</label>
			<select
				id="category"
				bind:value={expense.category}
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
				bind:value={expense.payment_method}
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
				bind:value={expense.notes}
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
					<input type="file" accept="image/*" class="sr-only" on:change={handleReceiptChange} />
				</label>
				<p class="pl-1 text-sm text-gray-500">or drag and drop</p>
			</div>
			<p class="mt-1 text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>

			{#if receiptPreview}
				<div class="mt-2">
					<img
						src={receiptPreview}
						alt="Receipt preview"
						class="h-32 w-auto rounded border object-cover"
					/>
				</div>
			{/if}
		</div>

		<div class="flex items-center">
			<input
				type="checkbox"
				id="is_recurring"
				bind:checked={expense.is_recurring}
				class="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
			/>
			<label for="is_recurring" class="ml-2 block text-sm text-gray-900">
				This is a recurring expense
			</label>
		</div>
	</div>

	<div class="flex justify-end space-x-3 border-t pt-4">
		<Button type="button" variant="outline" on:click={handleCancel}>Cancel</Button>
		<Button type="submit" variant="primary" {loading}>
			{isEditing ? 'Update' : 'Add'} Expense
		</Button>
	</div>
</form>
