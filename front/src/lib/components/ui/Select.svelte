<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { fade } from 'svelte/transition';
	import { clickOutside } from '$lib/actions/clickOutside';

	// Props
	export let value: any = undefined;
	export let options: Array<{ value: any; label: string }> = [];
	export let label: string = '';
	export let name: string = '';
	export let id: string = '';
	export let placeholder: string = 'Select an option';
	export let disabled: boolean = false;
	export let required: boolean = false;
	export let error: string = '';
	export let helpText: string = '';
	export let allowClear: boolean = false;
	export let allowSearch: boolean = false;
	export let loading: boolean = false;
	export let size: 'sm' | 'md' | 'lg' = 'md';

	// State
	let open = false;
	let searchText = '';
	let selectedOption = getSelectedOption();
	let inputElement: HTMLDivElement;

	// Generate a unique ID if none is provided
	if (!id && name) {
		id = `select-${name}`;
	} else if (!id) {
		id = `select-${Math.random().toString(36).substring(2, 9)}`;
	}

	// Event dispatcher
	const dispatch = createEventDispatcher();

	// Find the selected option based on value
	function getSelectedOption() {
		return options.find((option) => option.value === value);
	}

	// When the value changes, update the selected option
	$: {
		selectedOption = getSelectedOption();
	}

	// Filter options based on search text
	$: filteredOptions =
		allowSearch && searchText
			? options.filter((option) => option.label.toLowerCase().includes(searchText.toLowerCase()))
			: options;

	// Toggle the dropdown
	function toggleDropdown() {
		if (!disabled && !loading) {
			open = !open;
			if (open && allowSearch) {
				// Focus the search input when opening
				setTimeout(() => {
					const searchInput = document.getElementById(`${id}-search`);
					if (searchInput) searchInput.focus();
				}, 50);
			}
		}
	}

	// Handle option selection
	function selectOption(option: { value: any; label: string }) {
		value = option.value;
		selectedOption = option;
		open = false;
		dispatch('change', { value: option.value });
		searchText = '';
	}

	// Clear the selection
	function clearSelection(e: Event) {
		e.stopPropagation();
		value = undefined;
		selectedOption = undefined;
		dispatch('change', { value: undefined });
		dispatch('clear');
	}

	// Handle key navigation
	function handleKeyDown(e: KeyboardEvent) {
		if (disabled || loading) return;

		switch (e.key) {
			case 'Enter':
			case ' ':
				e.preventDefault();
				toggleDropdown();
				break;
			case 'Escape':
				if (open) {
					e.preventDefault();
					open = false;
				}
				break;
			case 'ArrowDown':
				if (!open) {
					e.preventDefault();
					open = true;
				}
				break;
			case 'Tab':
				if (open) {
					open = false;
				}
				break;
		}
	}

	// Handle keyboard navigation within the dropdown
	function handleOptionKeyDown(e: KeyboardEvent, option: { value: any; label: string }) {
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			selectOption(option);
		}
	}

	// Get size classes
	function getSizeClasses() {
		switch (size) {
			case 'sm':
				return 'h-8 text-sm';
			case 'lg':
				return 'h-12 text-lg';
			default:
				return 'h-10 text-base';
		}
	}

	// Define classes based on component state
	$: containerClasses = `relative ${disabled ? 'opacity-60' : ''}`;
	$: selectClasses = `flex items-center w-full px-3 border rounded-md bg-white ${getSizeClasses()}
    focus:outline-none focus:ring-2
    ${disabled ? 'cursor-not-allowed bg-gray-100' : 'cursor-pointer'}
    ${error ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-primary-100 focus:border-primary-300'}
    ${open ? 'ring-2 ring-primary-100 border-primary-300' : ''}`;
	$: menuClasses = `absolute z-50 w-full mt-1 overflow-auto bg-white border border-gray-300 rounded-md shadow-lg max-h-60`;
	$: optionClasses = `px-3 py-2 cursor-pointer hover:bg-gray-100 focus:bg-gray-100 focus:outline-none`;
	$: selectedOptionClasses = `bg-primary-50 text-primary-700`;
</script>

<div class={containerClasses}>
	{#if label}
		<label for={id} class="mb-1 block text-sm font-medium text-gray-700">
			{label}
			{#if required}
				<span class="text-red-500">*</span>
			{/if}
		</label>
	{/if}

	<div
		{id}
		role="combobox"
		aria-expanded={open}
		aria-haspopup="listbox"
		aria-labelledby={label ? id : undefined}
		aria-controls={`${id}-listbox`}
		tabindex={disabled ? -1 : 0}
		class={selectClasses}
		on:click={toggleDropdown}
		on:keydown={handleKeyDown}
		use:clickOutside={() => (open = false)}
		bind:this={inputElement}
	>
		<div class="flex-grow truncate text-left">
			{#if selectedOption}
				{selectedOption.label}
			{:else}
				<span class="text-gray-400">{placeholder}</span>
			{/if}
		</div>

		<div class="ml-2 flex items-center">
			{#if loading}
				<div
					class="border-t-primary-500 h-4 w-4 animate-spin rounded-full border-2 border-gray-300"
				></div>
			{:else if allowClear && selectedOption}
				<button
					type="button"
					aria-label="Clear selection"
					class="p-1 text-gray-400 hover:text-gray-600 focus:outline-none"
					on:click={clearSelection}
					tabindex="-1"
				>
					<!-- X icon -->
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="16"
						height="16"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
					>
						<line x1="18" y1="6" x2="6" y2="18"></line>
						<line x1="6" y1="6" x2="18" y2="18"></line>
					</svg>
				</button>
			{/if}

			<div class="ml-1 text-gray-400">
				<!-- Chevron Down icon -->
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="16"
					height="16"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
				>
					<polyline points="6 9 12 15 18 9"></polyline>
				</svg>
			</div>
		</div>
	</div>

	{#if open}
		<div
			id={`${id}-listbox`}
			class={menuClasses}
			role="listbox"
			transition:fade={{ duration: 100 }}
		>
			{#if allowSearch}
				<div class="sticky top-0 border-b border-gray-200 bg-white p-2">
					<input
						id={`${id}-search`}
						type="text"
						placeholder="Search..."
						class="focus:ring-primary-300 w-full rounded-md border border-gray-300 px-2 py-1 focus:ring-1 focus:outline-none"
						bind:value={searchText}
					/>
				</div>
			{/if}

			{#if filteredOptions.length === 0}
				<div class="px-3 py-2 text-sm text-gray-500">No options found</div>
			{:else}
				{#each filteredOptions as option, i}
					<div
						role="option"
						aria-selected={value === option.value}
						class={`${optionClasses} ${value === option.value ? selectedOptionClasses : ''}`}
						on:click={() => selectOption(option)}
						on:keydown={(e) => handleOptionKeyDown(e, option)}
						tabindex="0"
					>
						{option.label}
					</div>
				{/each}
			{/if}
		</div>
	{/if}

	{#if error}
		<p class="mt-1 text-sm text-red-600">{error}</p>
	{:else if helpText}
		<p class="mt-1 text-sm text-gray-500">{helpText}</p>
	{/if}
</div>
