<!-- Input.svelte -->
<script lang="ts">
	import { createEventDispatcher, onMount } from 'svelte';

	// Props
	export let value = '';
	export let type = 'text';
	export let name = '';
	export let label = '';
	export let placeholder = '';
	export let required = false;
	export let disabled = false;
	export let error = '';
	export let helpText = '';

	// Internal state
	let touched = false;
	let inputElement;
	let isFocused = false;

	const dispatch = createEventDispatcher();

	// Clear error message when value changes and field has been touched
	$: if (touched && value && error) {
		error = '';
		dispatch('errorCleared', { name });
	}

	function handleInput(event) {
		touched = true;
		dispatch('input', event);
	}

	function handleFocus() {
		isFocused = true;
		dispatch('focus');
	}

	function handleBlur() {
		isFocused = false;
		touched = true;
		dispatch('blur');
	}
</script>

<div class="mb-4">
	{#if label}
		<label for={name} class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
			{label}
			{#if required}
				<span class="text-red-500">*</span>
			{/if}
		</label>
	{/if}

	<input
		{type}
		{name}
		id={name}
		bind:value
		bind:this={inputElement}
		class="focus:ring-primary focus:border-primary block w-full rounded-md border-gray-300 shadow-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
		{placeholder}
		{disabled}
		{required}
		on:input={handleInput}
		on:focus={handleFocus}
		on:blur={handleBlur}
	/>

	{#if error}
		<p class="mt-1 text-sm text-red-600">{error}</p>
	{:else if helpText}
		<p class="mt-1 text-sm text-gray-500">{helpText}</p>
	{/if}
</div>
