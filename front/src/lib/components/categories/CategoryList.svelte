<!--
  CategoryList Component

  A component for displaying and managing expense categories:
  - Grid view of categories with color indicators
  - Search and filter functionality
  - Add/edit/delete actions
  - Animation and micro-interactions
-->
<script lang="ts">
	import { onMount, createEventDispatcher } from 'svelte';
	import { fade, fly, slide, scale } from 'svelte/transition';
	import { flip } from 'svelte/animate';
	import { quintOut } from 'svelte/easing';

	import { categoriesStore, categories } from '$lib/stores/categories';
	import { toastStore } from '$lib/stores/toast';
	import { uiStore } from '$lib/stores/ui';
	import Button from '$lib/components/ui/Button.svelte';
	import Input from '$lib/components/ui/Input.svelte';
	import Alert from '$lib/components/ui/Alert.svelte';
	import { isLightColor, sortCategoriesByName } from '$lib/utils/helpers';
	import type { Category } from '$lib/types/expenses';

	// Props with Svelte 5 runes
	const {
		editable = true,
		selectable = false,
		showHeader = true,
		showSearch = true,
		emptyMessage = 'No categories found',
		maxHeight = null
	} = $props();

	// Internal state
	let isLoading = $state(true);
	let searchQuery = $state('');
	let selectedCategoryId = $state<string | null>(null);
	let sortDirection = $state<'asc' | 'desc'>('asc');
	let showDeleteConfirm = $state(false);
	let categoryToDelete = $state<Category | null>(null);

	// Event dispatcher for selections and actions
	const dispatch = createEventDispatcher<{
		select: { category: Category };
		edit: { category: Category };
		delete: { category: Category };
		add: void;
	}>();

	// Filter categories based on search query
	$effect(() => {
		searchQuery; // Reference to trigger effect on changes
	});

	// Filtered and sorted categories
	const filteredCategories = $derived(() => {
		// Filter by search query
		let result = $categories.filter((category) => {
			if (!searchQuery) return true;

			const query = searchQuery.toLowerCase();
			return (
				category.name.toLowerCase().includes(query) ||
				category.description.toLowerCase().includes(query)
			);
		});

		// Sort by name
		result = sortCategoriesByName(result, sortDirection);

		return result;
	});

	// Handle category selection
	function selectCategory(category: Category) {
		if (!selectable) return;

		selectedCategoryId = category.id;
		dispatch('select', { category });
	}

	// Toggle sort direction
	function toggleSort() {
		sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
	}

	// Edit category
	function editCategory(category: Category, event: MouseEvent) {
		if (!editable) return;

		event.stopPropagation();
		dispatch('edit', { category });
	}

	// Confirm category deletion
	function confirmDelete(category: Category, event: MouseEvent) {
		if (!editable) return;

		event.stopPropagation();
		categoryToDelete = category;
		showDeleteConfirm = true;
	}

	// Cancel deletion
	function cancelDelete() {
		showDeleteConfirm = false;
		categoryToDelete = null;
	}

	// Delete category after confirmation
	async function deleteCategory() {
		if (!categoryToDelete) return;

		try {
			// We're just dispatching the event here - actual deletion happens in parent
			dispatch('delete', { category: categoryToDelete });

			showDeleteConfirm = false;
			categoryToDelete = null;
		} catch (error) {
			toastStore.error('Failed to delete category');
			console.error('Error deleting category:', error);
		}
	}

	// Add new category
	function addCategory() {
		dispatch('add');
	}

	// Calculate contrasting text color for category
	function getTextColor(background: string): string {
		return isLightColor(background) ? 'text-gray-900' : 'text-white';
	}

	// Initialization
	onMount(async () => {
		isLoading = false;
	});
</script>

<div class="category-list w-full">
	{#if showHeader}
		<div class="mb-4 flex flex-wrap items-center justify-between gap-2">
			<h2 class="text-xl font-semibold text-gray-800 dark:text-white">Categories</h2>
			<div class="flex items-center space-x-2">
				{#if editable}
					<Button
						variant="primary"
						size="sm"
						on:click={addCategory}
						icon={`
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
              </svg>
            `}
					>
						Add Category
					</Button>
				{/if}
			</div>
		</div>
	{/if}

	{#if showSearch}
		<div class="mb-4">
			<Input
				type="text"
				placeholder="Search categories..."
				bind:value={searchQuery}
				icon={`
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
        `}
			/>
		</div>
	{/if}

	{#if isLoading}
		<div class="flex min-h-32 items-center justify-center">
			<div
				class="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600"
			></div>
		</div>
	{:else if filteredCategories.length === 0}
		<div
			class="flex min-h-32 flex-col items-center justify-center rounded-lg border border-gray-200 bg-gray-50 p-6 text-center dark:border-gray-700 dark:bg-gray-800"
			in:fade={{ duration: 200 }}
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				class="mb-3 h-12 w-12 text-gray-400"
				fill="none"
				viewBox="0 0 24 24"
				stroke="currentColor"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
				/>
			</svg>
			<p class="text-gray-600 dark:text-gray-300">{emptyMessage}</p>
			{#if editable}
				<Button variant="primary" size="sm" class="mt-4" on:click={addCategory}>
					Add Category
				</Button>
			{/if}
		</div>
	{:else}
		<div
			class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
			style={maxHeight ? `max-height: ${maxHeight}; overflow-y: auto;` : ''}
		>
			{#each filteredCategories as category, i (category.id)}
				<div
					class="group relative overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-all duration-200 hover:shadow-md dark:border-gray-700 dark:bg-gray-800 {selectable
						? 'cursor-pointer'
						: ''} {selectedCategoryId === category.id ? 'ring-2 ring-blue-500' : ''}"
					on:click={() => selectCategory(category)}
					animate:flip={{ duration: 300 }}
					in:scale={{ start: 0.95, duration: 200, delay: i * 30, easing: quintOut }}
				>
					<!-- Category color indicator -->
					<div class="h-2 w-full" style="background-color: {category.color};"></div>

					<div class="p-4">
						<div class="mb-2 flex items-center">
							{#if category.icon}
								<div
									class="mr-2 flex h-8 w-8 items-center justify-center rounded-full"
									style="background-color: {category.color};"
								>
									{@html category.icon}
								</div>
							{:else}
								<div
									class="mr-2 flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold {getTextColor(
										category.color
									)}"
									style="background-color: {category.color};"
								>
									{category.name[0].toUpperCase()}
								</div>
							{/if}

							<h3 class="flex-1 font-medium text-gray-900 dark:text-white">
								{category.name}
							</h3>

							{#if category.is_default}
								<span
									class="ml-1 inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-200"
									title="Default category"
								>
									Default
								</span>
							{/if}
						</div>

						{#if category.description}
							<p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
								{category.description}
							</p>
						{/if}

						{#if editable}
							<div
								class="mt-4 flex justify-end space-x-2 opacity-0 transition-opacity duration-200 group-hover:opacity-100"
							>
								<Button
									variant="secondary"
									size="xs"
									on:click={(e) => editCategory(category, e)}
									title="Edit category"
								>
									<svg
										xmlns="http://www.w3.org/2000/svg"
										class="h-3.5 w-3.5"
										fill="none"
										viewBox="0 0 24 24"
										stroke="currentColor"
									>
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
										/>
									</svg>
								</Button>
								<Button
									variant="danger"
									size="xs"
									on:click={(e) => confirmDelete(category, e)}
									title="Delete category"
									disabled={category.is_default}
								>
									<svg
										xmlns="http://www.w3.org/2000/svg"
										class="h-3.5 w-3.5"
										fill="none"
										viewBox="0 0 24 24"
										stroke="currentColor"
									>
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
										/>
									</svg>
								</Button>
							</div>
						{/if}
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>

<!-- Delete Confirmation Dialog -->
{#if showDeleteConfirm && categoryToDelete}
	<div
		class="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black"
		transition:fade={{ duration: 200 }}
	>
		<div
			class="w-full max-w-md rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800"
			transition:scale={{ start: 0.9, duration: 200 }}
		>
			<h3 class="mb-2 text-lg font-medium text-gray-900 dark:text-white">Delete Category</h3>
			<p class="mb-4 text-gray-600 dark:text-gray-300">
				Are you sure you want to delete the category <strong>{categoryToDelete.name}</strong>? This
				action cannot be undone.
			</p>

			<div class="flex justify-end space-x-2">
				<Button variant="secondary" on:click={cancelDelete}>Cancel</Button>
				<Button variant="danger" on:click={deleteCategory}>Delete</Button>
			</div>
		</div>
	</div>
{/if}

<style>
	/* Custom scrollbar for the category list */
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

	/* Hover effect for category cards */
	.category-list .group {
		transform: translateY(0);
		transition:
			transform 0.2s ease,
			box-shadow 0.2s ease;
	}

	.category-list .group:hover {
		transform: translateY(-2px);
	}
</style>
