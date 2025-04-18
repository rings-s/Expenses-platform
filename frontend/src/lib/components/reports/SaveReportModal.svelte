<!-- frontend/src/lib/components/reports/SaveReportModal.svelte -->
<script>
	import { createEventDispatcher } from 'svelte';
	import FormField from '$lib/components/ui/FormField.svelte';
	import Button from '$lib/components/ui/Button.svelte';

	export let reportType = 'expenses_by_category';
	export let chartType = 'bar';
	export let isOpen = false;

	const dispatch = createEventDispatcher();

	let reportData = {
		name: '',
		description: '',
		report_type: reportType,
		chart_type: chartType,
		is_favorite: false
	};

	function handleSubmit() {
		if (!reportData.name) {
			dispatch('error', 'Report name is required');
			return;
		}

		dispatch('save', reportData);
		resetForm();
	}

	function handleCancel() {
		resetForm();
		dispatch('close');
	}

	function resetForm() {
		reportData = {
			name: '',
			description: '',
			report_type: reportType,
			chart_type: chartType,
			is_favorite: false
		};
	}
</script>

{#if isOpen}
	<div class="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black">
		<div class="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
			<h2 class="mb-4 text-xl font-semibold text-gray-900">Save Report</h2>

			<form on:submit|preventDefault={handleSubmit} class="space-y-4">
				<FormField
					label="Report Name"
					name="report_name"
					bind:value={reportData.name}
					required={true}
				/>

				<div>
					<label for="description" class="block text-sm font-medium text-gray-700"
						>Description</label
					>
					<textarea
						id="description"
						bind:value={reportData.description}
						class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
						rows="3"
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
					<Button variant="outline" on:click={handleCancel} type="button">Cancel</Button>
					<Button variant="primary" type="submit">Save Report</Button>
				</div>
			</form>
		</div>
	</div>
{/if}
