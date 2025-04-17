<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	// Props
	export let value: string = '';
	export let label: string = '';
	export let placeholder: string = '';
	export let name: string = '';
	export let id: string = '';
	export let rows: number = 3;
	export let disabled: boolean = false;
	export let readonly: boolean = false;
	export let required: boolean = false;
	export let error: string = '';
	export let helpText: string = '';
	export let maxlength: number | null = null;
	export let autogrow: boolean = false;
	export let resize: 'none' | 'vertical' | 'horizontal' | 'both' = 'vertical';

	// Generate a unique ID if none is provided
	if (!id && name) {
		id = `textarea-${name}`;
	} else if (!id) {
		id = `textarea-${Math.random().toString(36).substring(2, 9)}`;
	}

	// Event dispatcher
	const dispatch = createEventDispatcher();

	// Handle input event
	function handleInput(event: Event) {
		const target = event.target as HTMLTextAreaElement;
		value = target.value;
		dispatch('input', event);

		if (autogrow) {
			resizeTextarea(target);
		}
	}

	// Auto-resize textarea
	function resizeTextarea(textarea: HTMLTextAreaElement) {
		textarea.style.height = 'auto';
		textarea.style.height = `${textarea.scrollHeight}px`;
	}

	// Handle textarea mounting
	function handleMount(textarea: HTMLTextAreaElement) {
		if (autogrow && textarea) {
			setTimeout(() => resizeTextarea(textarea), 0);
		}
	}

	// Get resize style
	function getResizeStyle() {
		if (autogrow) return 'resize-none';
		return `resize-${resize}`;
	}

	// Count remaining characters
	$: remainingChars = maxlength ? maxlength - value.length : null;
	$: showCharCount = maxlength !== null;

	// Define classes based on component state
	$: inputClasses = `block w-full px-3 py-2 border rounded-md ${getResizeStyle()} focus:outline-none focus:ring-2
    ${disabled ? 'bg-gray-100 cursor-not-allowed opacity-60' : 'bg-white'}
    ${error ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-primary-100 focus:border-primary-300'}`;
</script>

<div>
	{#if label}
		<label for={id} class="mb-1 block text-sm font-medium text-gray-700">
			{label}
			{#if required}
				<span class="text-red-500">*</span>
			{/if}
		</label>
	{/if}

	<textarea
		{id}
		{name}
		class={inputClasses}
		{placeholder}
		{disabled}
		{readonly}
		{required}
		{rows}
		{maxlength}
		aria-invalid={!!error}
		aria-describedby={error ? `${id}-error` : helpText ? `${id}-help` : undefined}
		on:input={handleInput}
		on:change={(e) => dispatch('change', e)}
		on:focus={(e) => dispatch('focus', e)}
		on:blur={(e) => dispatch('blur', e)}
		use:handleMount
		bind:value
	></textarea>

	<div class="mt-1 flex justify-between">
		{#if error}
			<p id={`${id}-error`} class="text-sm text-red-600">{error}</p>
		{:else if helpText}
			<p id={`${id}-help`} class="text-sm text-gray-500">{helpText}</p>
		{:else}
			<span></span>
		{/if}

		{#if showCharCount}
			<p class="text-right text-xs text-gray-500">
				{remainingChars} character{remainingChars === 1 ? '' : 's'} remaining
			</p>
		{/if}
	</div>
</div>
