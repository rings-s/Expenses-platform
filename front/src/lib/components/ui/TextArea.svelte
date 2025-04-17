<!--
  Textarea Component

  An enhanced textarea component with features:
  - Auto-grow functionality
  - Character counter
  - Error and validation state
  - Label and description
  - Placeholder styling
  - Resize options
-->
<script lang="ts">
	import { createEventDispatcher, onMount } from 'svelte';

	// Props with Svelte 5 runes
	const {
		// Basic properties
		value = '',
		name = '',
		id = '',
		placeholder = '',
		rows = 3,
		cols = 0,
		maxlength = null,
		minlength = null,

		// Styling
		label = '',
		helpText = '',
		error = '',
		success = false,
		resize = 'vertical', // 'none', 'vertical', 'horizontal', 'both'
		variant = 'default',
		size = 'md',
		rounded = 'md',

		// Behavior
		required = false,
		readonly = false,
		disabled = false,
		autofocus = false,
		autogrow = false,
		showCharCount = false,

		// Additional
		class: className = ''
	} = $props();

	// Event dispatcher
	const dispatch = createEventDispatcher<{
		input: Event;
		change: Event;
		focus: FocusEvent;
		blur: FocusEvent;
	}>();

	// Internal state
	let textareaElement = $state<HTMLTextAreaElement | null>(null);
	let isFocused = $state(false);

	// Generate an ID if not provided
	const elementId = $derived(id || `textarea-${Math.random().toString(36).slice(2, 9)}`);

	// Calculate remaining characters
	const remainingChars = $derived(maxlength !== null ? maxlength - value.length : null);

	// Helper derived values
	const shouldShowCharCount = $derived(
		showCharCount || (maxlength !== null && showCharCount !== false)
	);

	const hasError = $derived(!!error);
	const hasSuccessOrError = $derived(success || hasError);

	// Size classes
	const sizeClasses = {
		sm: 'py-1.5 px-2 text-sm',
		md: 'py-2 px-3 text-base',
		lg: 'py-2.5 px-4 text-lg'
	};

	// Rounded classes
	const roundedClasses = {
		none: 'rounded-none',
		sm: 'rounded-sm',
		md: 'rounded-md',
		lg: 'rounded-lg',
		full: 'rounded-full'
	};

	// Resize styles
	const resizeStyles = {
		none: 'resize-none',
		vertical: 'resize-y',
		horizontal: 'resize-x',
		both: 'resize'
	};

	// Auto-resize the textarea to fit content
	function autoResize() {
		if (!autogrow || !textareaElement) return;

		// Reset height to auto to get the correct scrollHeight
		textareaElement.style.height = 'auto';

		// Set the height to scrollHeight to show all content
		textareaElement.style.height = `${textareaElement.scrollHeight}px`;
	}

	// Handle input events
	function handleInput(event: Event) {
		if (autogrow) autoResize();
		dispatch('input', event);
	}

	// Handle change events
	function handleChange(event: Event) {
		dispatch('change', event);
	}

	// Handle focus events
	function handleFocus(event: FocusEvent) {
		isFocused = true;
		dispatch('focus', event);
	}

	// Handle blur events
	function handleBlur(event: FocusEvent) {
		isFocused = false;
		dispatch('blur', event);
	}

	// Class derivation for textarea
	const textareaClasses = $derived(`
    block w-full ${sizeClasses[size]} ${roundedClasses[rounded]} ${resizeStyles[resize]}
    ${
			hasError
				? 'border-red-500 focus:border-red-500 focus:ring-red-500/30 dark:border-red-500'
				: success
					? 'border-green-500 focus:border-green-500 focus:ring-green-500/30 dark:border-green-500'
					: 'border-gray-300 focus:border-blue-500 focus:ring-blue-500/30 dark:border-gray-600'
		}
    ${
			disabled
				? 'bg-gray-100 text-gray-500 cursor-not-allowed dark:bg-gray-800 dark:text-gray-400'
				: 'bg-white text-gray-900 dark:bg-gray-700 dark:text-white'
		}
    border shadow-sm focus:ring-4 focus:outline-none
    transition-all duration-200
    ${isFocused ? 'shadow-sm' : ''}
    ${className}
  `);

	// Focus the textarea
	function focus() {
		textareaElement?.focus();
	}

	// Lifecycle hooks
	onMount(() => {
		// Initialize auto-resize
		if (autogrow && textareaElement) {
			autoResize();
		}

		// Set focus if autofocus is enabled
		if (autofocus && textareaElement) {
			textareaElement.focus();
		}
	});

	// Re-run autoResize when value changes
	$effect(() => {
		if (value && autogrow) {
			// Use setTimeout to ensure DOM is updated
			setTimeout(autoResize, 0);
		}
	});
</script>

<div class="w-full">
	<!-- Label (if provided) -->
	{#if label}
		<label for={elementId} class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
			{label}
			{#if required}
				<span class="text-red-500">*</span>
			{/if}
		</label>
	{/if}

	<!-- Textarea element -->
	<textarea
		id={elementId}
		{name}
		bind:value
		bind:this={textareaElement}
		class={textareaClasses}
		{placeholder}
		{rows}
		{cols}
		{maxlength}
		{minlength}
		{required}
		{readonly}
		{disabled}
		aria-invalid={hasError}
		aria-describedby={hasError ? `${elementId}-error` : helpText ? `${elementId}-help` : undefined}
		on:input={handleInput}
		on:change={handleChange}
		on:focus={handleFocus}
		on:blur={handleBlur}
	></textarea>

	<!-- Error, help text, and character count -->
	<div class="mt-1 flex justify-between text-sm">
		<div>
			{#if hasError}
				<p id="{elementId}-error" class="text-red-600 dark:text-red-400">{error}</p>
			{:else if helpText}
				<p id="{elementId}-help" class="text-gray-500 dark:text-gray-400">{helpText}</p>
			{/if}
		</div>

		{#if shouldShowCharCount && maxlength !== null}
			<div class="ml-auto text-xs text-gray-500 dark:text-gray-400">
				{value.length}/{maxlength}
			</div>
		{/if}
	</div>
</div>

<style>
	/* Better placeholder styling */
	textarea::placeholder {
		color: #9ca3af;
		opacity: 0.7;
		transition: opacity 0.2s ease;
	}

	textarea:focus::placeholder {
		opacity: 0.5;
	}

	/* Smooth transitions */
	textarea {
		transition: all 0.2s ease-in-out;
	}
</style>
