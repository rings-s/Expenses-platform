<script>
	import { createEventDispatcher } from 'svelte';
	import FormField from '$lib/components/ui/FormField.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Alert from '$lib/components/ui/Alert.svelte';

	export let reportType = 'expenses_by_category';
	export let chartType = 'bar';
	export let isOpen = false;

	const dispatch = createEventDispatcher();

	// State variables
	let reportData = {
		name: '',
		description: '',
		report_type: reportType,
		chart_type: chartType,
		is_favorite: false
	};

	let error = '';
	let isSubmitting = false;

	// Reset form to initial state
	function resetForm() {
		reportData = {
			name: '',
			description: '',
			report_type: reportType,
			chart_type: chartType,
			is_favorite: false
		};
		error = '';
		isSubmitting = false;
	}

	// Handle form submission
	async function handleSubmit() {
		// Clear previous errors
		error = '';

		// Validate report name
		if (!reportData.name.trim()) {
			error = 'Report name is required';
			return;
		}

		try {
			// Set submitting state
			isSubmitting = true;

			// Dispatch save event with report data
			dispatch('save', reportData);
		} catch (err) {
			// Handle any unexpected errors during save
			error = err.message || 'Failed to save report';
			console.error('Save report error:', err);
		} finally {
			// Reset submitting state
			isSubmitting = false;
		}
	}

	// Handle modal cancellation
	function handleCancel() {
		// Reset form and close modal
		resetForm();
		dispatch('close');
	}

	// Reactive statement to reset form when modal opens
	$: if (isOpen) {
		resetForm();
	}
</script>

{#if isOpen}
	<div class="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black">
		<div class="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
			<h2 class="mb-4 text-xl font-semibold text-gray-900">Save Report</h2>

			{#if error}
				<Alert type="error">{error}</Alert>
			{/if}

			<form on:submit|preventDefault={handleSubmit} class="space-y-4">
				<FormField
					label="Report Name"
					name="report_name"
					bind:value={reportData.name}
					required={true}
					placeholder="Enter a descriptive name for your report"
					error={!reportData.name.trim() ? 'Report name is required' : ''}
				/>

				<div>
					<label for="description" class="block text-sm font-medium text-gray-700">
						Description (Optional)
					</label>
					<textarea
						id="description"
						bind:value={reportData.description}
						rows="3"
						class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
						placeholder="Add additional context or notes about the report"
					></textarea>
				</div>

				<div class="flex items-center">
					<input
						type="checkbox"
						id="is_favorite"
						bind:checked={reportData.is_favorite}
						class="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
					/>
					<label for="is_favorite" class="ml-2 block text-sm text-gray-900">
						Add to favorites
					</label>
				</div>

				<div class="flex justify-end space-x-2 pt-4">
					<Button variant="outline" type="button" on:click={handleCancel} disabled={isSubmitting}>
						Cancel
					</Button>
					<Button variant="primary" type="submit" loading={isSubmitting}>Save Report</Button>
				</div>
			</form>
		</div>
	</div>
{/if}
