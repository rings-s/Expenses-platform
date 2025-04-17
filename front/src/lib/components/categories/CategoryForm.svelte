<script context="module">
	// Click outside directive
	export function clickOutside(node: HTMLElement, callback: () => void) {
		const handleClick = (event: MouseEvent) => {
			if (node && !node.contains(event.target as Node) && !event.defaultPrevented) {
				callback();
			}
		};

		document.addEventListener('click', handleClick, true);

		return {
			destroy() {
				document.removeEventListener('click', handleClick, true);
			}
		};
	}
</script>

<!--
  CategoryForm Component

  A form for creating and editing expense categories:
  - Name, description, color picker
  - Icon selection
  - Default category option
  - Real-time validation
  - Color contrast preview
-->
<script lang="ts">
	import { createEventDispatcher, onMount } from 'svelte';
	import { fade, scale } from 'svelte/transition';
	import { categoriesStore } from '$lib/stores/categories';
	import { validateInput } from '$lib/utils/validation';
	import { isLightColor, getContrastTextColor } from '$lib/utils/helpers';
	import Button from '$lib/components/ui/Button.svelte';
	import Input from '$lib/components/ui/Input.svelte';
	import Textarea from '$lib/components/ui/Textarea.svelte';
	import Alert from '$lib/components/ui/Alert.svelte';
	import type { Category, CategoryFormData } from '$lib/types/expenses';

	// Props with Svelte 5 runes
	const { category = null, submitButtonText = 'Save Category', showCancelButton = true } = $props();

	// Form data state
	let formData = $state<CategoryFormData>({
		name: '',
		description: '',
		color: '#0066cc', // Default blue
		icon: '',
		is_default: false
	});

	// UI State
	let isSubmitting = $state(false);
	let error = $state('');
	let nameError = $state('');
	let isEditMode = $state(false);
	let colorPickerOpen = $state(false);
	let iconSelectorOpen = $state(false);
	let textPreviewColor = $state('#ffffff');

	// Available color options
	const colorOptions = [
		// Blues
		'#0066cc',
		'#3b82f6',
		'#1e40af',
		'#60a5fa',
		'#0ea5e9',
		// Greens
		'#059669',
		'#10b981',
		'#047857',
		'#22c55e',
		'#15803d',
		// Reds
		'#dc2626',
		'#ef4444',
		'#b91c1c',
		'#f87171',
		'#991b1b',
		// Purples
		'#7c3aed',
		'#8b5cf6',
		'#6d28d9',
		'#a855f7',
		'#9333ea',
		// Yellows/Oranges
		'#f59e0b',
		'#fbbf24',
		'#d97706',
		'#fb923c',
		'#ea580c',
		// Teals/Cyans
		'#06b6d4',
		'#0891b2',
		'#14b8a6',
		'#0d9488',
		'#2dd4bf',
		// Pinks
		'#db2777',
		'#ec4899',
		'#be185d',
		'#f472b6',
		'#9d174d',
		// Grays
		'#6b7280',
		'#4b5563',
		'#9ca3af',
		'#1f2937',
		'#374151'
	];

	// Popular icons (SVG paths)
	const iconOptions = [
		// Home
		'<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>',
		// Food
		'<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>',
		// Transport
		'<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>',
		// Shopping
		'<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>',
		// Entertainment
		'<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" /></svg>',
		// Education
		'<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>',
		// Health
		'<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>',
		// Bills
		'<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>',
		// Travel
		'<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>',
		// Gifts
		'<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v13m0-13V6a2 2 0 112.83 1.83l-1.415 1.415a2 2 0 01-2.83 0l-1.415-1.415A2 2 0 1112 6v2zm-8 2v10a2 2 0 002 2h8a2 2 0 002-2V10M6 10h12" /></svg>',
		// Pets
		'<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.121 14.121L19 19m-7-7l7-7m-7 7l-2.879 2.879M12 12L9.121 9.121m0 5.758a3 3 0 10-4.243 4.243 3 3 0 004.243-4.243zm0-5.758a3 3 0 10-4.243-4.243 3 3 0 004.243 4.243z" /></svg>',
		// Taxes
		'<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>'
	];

	// Event dispatcher for form events
	const dispatch = createEventDispatcher<{
		save: { data: CategoryFormData; id?: string };
		cancel: void;
	}>();

	// Initialize form when component mounts
	onMount(() => {
		if (category) {
			// Edit mode
			isEditMode = true;
			formData = {
				name: category.name,
				description: category.description,
				color: category.color,
				icon: category.icon,
				is_default: category.is_default
			};
		}

		// Set initial text preview color
		updateTextPreviewColor();
	});

	// Update text preview color based on background
	function updateTextPreviewColor() {
		textPreviewColor = isLightColor(formData.color) ? '#000000' : '#ffffff';
	}

	// Color selection changed
	function handleColorChange(color: string) {
		formData.color = color;
		colorPickerOpen = false;
		updateTextPreviewColor();
	}

	// Icon selection changed
	function handleIconSelect(icon: string) {
		formData.icon = icon;
		iconSelectorOpen = false;
	}

	// Name validation
	function validateName() {
		const result = validateInput(formData.name, {
			required: true,
			minLength: 2,
			maxLength: 50
		});

		nameError = result.error || '';
		return result.valid;
	}

	// Form submission
	async function handleSubmit() {
		// Validate required fields
		if (!validateName()) {
			return;
		}

		isSubmitting = true;
		error = '';

		try {
			// Dispatch save event with form data
			dispatch('save', {
				data: formData,
				id: category?.id
			});
		} catch (err) {
			console.error('Error saving category:', err);
			error = err instanceof Error ? err.message : 'Failed to save category';
		} finally {
			isSubmitting = false;
		}
	}

	// Cancel form
	function handleCancel() {
		dispatch('cancel');
	}
</script>

<form
	on:submit|preventDefault={handleSubmit}
	class="w-full space-y-4 rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800"
>
	<h2 class="mb-4 text-xl font-bold text-gray-900 dark:text-white">
		{isEditMode ? 'Edit Category' : 'New Category'}
	</h2>

	{#if error}
		<Alert type="error" class="mb-4">
			{error}
		</Alert>
	{/if}

	<!-- Name -->
	<div>
		<Input
			type="text"
			label="Category Name"
			bind:value={formData.name}
			error={nameError}
			placeholder="e.g., Groceries, Rent, Entertainment"
			required
			on:blur={validateName}
			disabled={isSubmitting}
		/>
	</div>

	<!-- Description -->
	<div>
		<Textarea
			label="Description"
			bind:value={formData.description}
			placeholder="Add a brief description of this category"
			rows={2}
			disabled={isSubmitting}
		/>
	</div>

	<!-- Color -->
	<div>
		<label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
			Category Color
		</label>
		<div class="relative">
			<button
				type="button"
				class="flex w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
				on:click={() => (colorPickerOpen = !colorPickerOpen)}
			>
				<div class="flex items-center">
					<div
						class="mr-2 h-6 w-6 rounded-full border border-gray-200 shadow-sm dark:border-gray-600"
						style="background-color: {formData.color};"
					></div>
					<span>{formData.color}</span>
				</div>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					class="h-5 w-5 text-gray-400"
					viewBox="0 0 20 20"
					fill="currentColor"
				>
					<path
						fill-rule="evenodd"
						d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
						clip-rule="evenodd"
					/>
				</svg>
			</button>

			{#if colorPickerOpen}
				<div
					class="absolute z-10 mt-1 w-full rounded-md border border-gray-200 bg-white p-3 shadow-lg dark:border-gray-700 dark:bg-gray-800"
					transition:scale={{ duration: 200, start: 0.95 }}
					use:clickOutside={() => (colorPickerOpen = false)}
				>
					<div class="grid grid-cols-5 gap-2 sm:grid-cols-8">
						{#each colorOptions as color}
							<button
								type="button"
								class="h-8 w-8 rounded-full border hover:opacity-80 focus:ring-2 focus:ring-offset-2 focus:outline-none {formData.color ===
								color
									? 'ring-2 ring-gray-400 ring-offset-2'
									: ''}"
								style="background-color: {color};"
								on:click={() => handleColorChange(color)}
								title={color}
							></button>
						{/each}
					</div>
				</div>
			{/if}
		</div>
	</div>

	<!-- Icon -->
	<div>
		<label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
			Category Icon (Optional)
		</label>
		<div class="relative">
			<button
				type="button"
				class="flex w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
				on:click={() => (iconSelectorOpen = !iconSelectorOpen)}
			>
				<div class="flex items-center">
					{#if formData.icon}
						<div
							class="mr-2 flex h-6 w-6 items-center justify-center rounded-full text-white"
							style="background-color: {formData.color};"
						>
							{@html formData.icon}
						</div>
						<span>Selected Icon</span>
					{:else}
						<span>Select an icon</span>
					{/if}
				</div>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					class="h-5 w-5 text-gray-400"
					viewBox="0 0 20 20"
					fill="currentColor"
				>
					<path
						fill-rule="evenodd"
						d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
						clip-rule="evenodd"
					/>
				</svg>
			</button>

			{#if iconSelectorOpen}
				<div
					class="absolute z-10 mt-1 w-full overflow-x-hidden overflow-y-auto rounded-md border border-gray-200 bg-white p-3 shadow-lg dark:border-gray-700 dark:bg-gray-800"
					style="max-height: 200px;"
					transition:scale={{ duration: 200, start: 0.95 }}
					use:clickOutside={() => (iconSelectorOpen = false)}
				>
					<div class="grid grid-cols-4 gap-2 sm:grid-cols-6">
						<button
							type="button"
							class="flex h-10 w-10 items-center justify-center rounded-md border border-gray-200 hover:bg-gray-100 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-gray-700 dark:hover:bg-gray-700 {!formData.icon
								? 'bg-blue-50 ring-2 ring-blue-500 dark:bg-blue-900/30'
								: ''}"
							on:click={() => handleIconSelect('')}
							title="No icon"
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								class="h-6 w-6 text-gray-400"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M6 18L18 6M6 6l12 12"
								/>
							</svg>
						</button>

						{#each iconOptions as icon}
							<button
								type="button"
								class="flex h-10 w-10 items-center justify-center rounded-md border border-gray-200 hover:bg-gray-100 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-gray-700 dark:hover:bg-gray-700 {formData.icon ===
								icon
									? 'bg-blue-50 ring-2 ring-blue-500 dark:bg-blue-900/30'
									: ''}"
								on:click={() => handleIconSelect(icon)}
								title="Select icon"
							>
								{@html icon}
							</button>
						{/each}
					</div>
				</div>
			{/if}
		</div>
	</div>

	<!-- Default Category -->
	<div class="flex items-center">
		<input
			type="checkbox"
			id="is_default"
			bind:checked={formData.is_default}
			class="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:ring-offset-gray-800"
			disabled={isSubmitting}
		/>
		<label for="is_default" class="ml-2 block text-sm text-gray-700 dark:text-gray-300">
			Set as default category
		</label>
	</div>

	<!-- Preview -->
	<div class="mt-4 rounded-md border border-gray-200 p-4 dark:border-gray-700">
		<h3 class="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Preview</h3>
		<div class="flex items-center rounded-md p-3" style="background-color: {formData.color};">
			{#if formData.icon}
				<div class="mr-2 text-white">
					{@html formData.icon}
				</div>
			{/if}
			<span class="font-medium" style="color: {textPreviewColor};">
				{formData.name || 'Category Name'}
			</span>
			{#if formData.is_default}
				<span
					class="bg-opacity-25 ml-2 inline-flex items-center rounded-full bg-white px-2 py-0.5 text-xs font-medium"
					style="color: {textPreviewColor};"
				>
					Default
				</span>
			{/if}
		</div>
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
			disabled={isSubmitting || !!nameError}
		>
			{submitButtonText}
		</Button>
	</div>
</form>

<style>
	/* Custom scrollbar for select dropdowns */
	div[style*='overflow-y: auto'] {
		scrollbar-width: thin;
		scrollbar-color: rgba(156, 163, 175, 0.5) transparent;
	}

	div[style*='overflow-y: auto']::-webkit-scrollbar {
		width: 6px;
	}

	div[style*='overflow-y: auto']::-webkit-scrollbar-track {
		background: transparent;
	}

	div[style*='overflow-y: auto']::-webkit-scrollbar-thumb {
		background-color: rgba(156, 163, 175, 0.5);
		border-radius: 3px;
	}
</style>
