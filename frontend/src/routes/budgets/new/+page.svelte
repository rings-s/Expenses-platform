<script>
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import AppLayout from '$lib/components/layout/AppLayout.svelte';
	import { budgetStore } from '$lib/stores/budgetStore';
	import { categoryStore } from '$lib/stores/categoryStore';
	import Alert from '$lib/components/ui/Alert.svelte';
	import BudgetForm from '$lib/components/budgets/BudgetForm.svelte';

	// State
	let categories = [];
	let loading = false;
	let error = null;
	let success = false;

	// Default budget form data
	let budgetData = {
		amount: '',
		currency: 'USD',
		period: 'monthly',
		start_date: new Date().toISOString().split('T')[0],
		category: ''
	};

	onMount(async () => {
		try {
			// Load categories
			await categoryStore.loadCategories();
			categories = $categoryStore.categories;
		} catch (err) {
			error = err.message;
		}
	});

	async function handleSubmit(event) {
		try {
			loading = true;
			error = null;
			success = false;

			const formData = event.detail;
			console.log('Submitting budget:', formData);

			// Create budget
			const result = await budgetStore.createBudget(formData);

			success = true;

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

	function handleError(event) {
		error = event.detail;
	}

	function handleCancel() {
		goto('/budgets');
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

			<BudgetForm
				{categories}
				budget={budgetData}
				{loading}
				on:submit={handleSubmit}
				on:error={handleError}
				on:cancel={handleCancel}
			/>
		</div>
	</div>
</AppLayout>
