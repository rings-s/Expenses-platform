<!--
  Input Component

  A highly customizable input component with support for:
  - Various input types (text, password, email, etc.)
  - Validation states (error, success)
  - Leading and trailing icons
  - Prefix and suffix text
  - Floating labels
  - Disabled and readonly states
  - Character counter
  - Help text
  - High contrast and accessibility
-->
<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	// Props with Svelte 5 runes
	const {
		// Input properties
		type = 'text',
		name = '',
		id = '',
		value = '',
		placeholder = '',

		// Label and help text
		label = '',
		floatingLabel = false,
		helpText = '',

		// Validation
		error = '',
		success = false,
		required = false,

		// Appearance
		variant = 'default',
		size = 'md',
		rounded = 'md',
		fullWidth = true,

		// States
		disabled = false,
		readonly = false,
		autofocus = false,

		// Icons and decorations
		icon = null,
		iconPosition = 'left',
		trailingIcon = null,
		prefix = '',
		suffix = '',
		showClearButton = false,

		// Character counter
		maxlength = null,
		showCharCount = false,

		// Additional properties
		autocomplete = '',
		pattern = '',
		min = '',
		max = '',
		step = '',

		// Additional styling
		class: className = ''
	} = $props();

	// Internal state with runes
	let inputElement = $state<HTMLInputElement | null>(null);
	let isFocused = $state(false);
	let showPassword = $state(false);

	// Event handling
	const dispatch = createEventDispatcher<{
		input: Event;
		focus: FocusEvent;
		blur: FocusEvent;
		change: Event;
		clear: void;
	}>();

	// Generate ID if not provided
	const inputId = $derived(id || `input-${Math.random().toString(36).substring(2, 11)}`);

	// Determine if input has content
	const hasValue = $derived(!!value || value === 0);

	// Calculate remaining characters
	const remainingChars = $derived(
		maxlength !== null ? maxlength - (value?.toString().length || 0) : null
	);

	// Determine actual input type
	const actualType = $derived(type === 'password' && showPassword ? 'text' : type);

	// Helper derived values for conditionals
	const showLeadingIcon = $derived(icon && (iconPosition === 'left' || !iconPosition));
	const showTrailingIcon = $derived(trailingIcon || (icon && iconPosition === 'right'));
	const hasContentBefore = $derived(showLeadingIcon || prefix);
	const hasContentAfter = $derived(
		showTrailingIcon || suffix || type === 'password' || (showClearButton && hasValue)
	);
	const shouldShowFloatingLabel = $derived(floatingLabel && (isFocused || hasValue));
	const shouldShowCharCount = $derived(
		showCharCount || (maxlength !== null && showCharCount !== false)
	);
	const hasError = $derived(!!error);
	const hasSuccessOrError = $derived(success || hasError);

	// Size classes
	const sizeClasses = {
		sm: 'h-8 text-xs px-2 py-1',
		md: 'h-10 text-sm px-3 py-2',
		lg: 'h-12 text-base px-4 py-2.5'
	};

	// Rounded classes
	const roundedClasses = {
		none: 'rounded-none',
		sm: 'rounded-sm',
		md: 'rounded-md',
		lg: 'rounded-lg',
		full: 'rounded-full'
	};

	// Handle clear button click
	function clearInput() {
		if (inputElement && !disabled && !readonly) {
			// Create a new InputEvent
			const event = new InputEvent('input', { bubbles: true });

			// Set the value to empty and dispatch event
			inputElement.value = '';
			inputElement.dispatchEvent(event);

			// Focus the input after clearing
			inputElement.focus();

			// Dispatch our custom clear event
			dispatch('clear');
		}
	}

	// Toggle password visibility
	function togglePasswordVisibility() {
		if (type === 'password' && !disabled && !readonly) {
			showPassword = !showPassword;
		}
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

	// Forward input events
	function handleInput(event: Event) {
		dispatch('input', event);
	}

	// Forward change events
	function handleChange(event: Event) {
		dispatch('change', event);
	}

	// Focus the input programmatically
	function focus() {
		inputElement?.focus();
	}

	// Class derivation for container
	const containerClasses = $derived(`
    relative
    ${fullWidth ? 'w-full' : 'w-auto'}
    ${className}
  `);

	// Class derivation for input
	const inputClasses = $derived(`
    block
    ${fullWidth ? 'w-full' : 'w-auto'}
    ${roundedClasses[rounded]}
    ${sizeClasses[size]}
    border
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
    ${hasContentBefore ? 'pl-9' : ''}
    ${hasContentAfter ? 'pr-10' : ''}
    ${shouldShowFloatingLabel ? 'pt-5 pb-1' : ''}
    shadow-sm
    transition-all duration-200
    focus:ring-4 focus:outline-none
    focus:shadow
    ${isFocused ? 'transform -translate-y-px' : ''}
  `);

	// Class derivation for label
	const labelClasses = $derived(`
    ${floatingLabel ? 'absolute pointer-events-none transition-all duration-200' : 'block'}
    ${
			shouldShowFloatingLabel
				? 'top-1 left-3 text-xs text-blue-600 dark:text-blue-400'
				: floatingLabel
					? 'top-1/2 -translate-y-1/2 left-3 text-gray-500'
					: 'mb-1'
		}
    ${
			hasError
				? 'text-red-500 dark:text-red-400'
				: success
					? 'text-green-600 dark:text-green-400'
					: ''
		}
    ${disabled ? 'text-gray-400 dark:text-gray-500' : ''}
    font-medium
  `);
</script>

<div class={containerClasses}>
	<!-- Label (non-floating or inactive floating) -->
	{#if label && (!floatingLabel || !shouldShowFloatingLabel)}
		<label for={inputId} class={labelClasses}>
			{label}
			{#if required}
				<span class="text-red-500">*</span>
			{/if}
		</label>
	{/if}

	<!-- Input container with relative positioning for icons/addons -->
	<div class="relative">
		<!-- Leading icon/content -->
		{#if hasContentBefore}
			<div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
				{#if showLeadingIcon}
					<span class="text-gray-500 dark:text-gray-400">
						{@html icon}
					</span>
				{:else if prefix}
					<span class="text-sm text-gray-500 dark:text-gray-400">{prefix}</span>
				{/if}
			</div>
		{/if}

		<!-- Input element -->
		<input
			{name}
			id={inputId}
			bind:value
			bind:this={inputElement}
			type={actualType}
			class={inputClasses}
			{placeholder}
			{disabled}
			{readonly}
			{required}
			{pattern}
			{autocomplete}
			{autofocus}
			{min}
			{max}
			{step}
			{maxlength}
			aria-invalid={hasError}
			aria-describedby={hasError ? `${inputId}-error` : helpText ? `${inputId}-help` : null}
			on:input={handleInput}
			on:change={handleChange}
			on:focus={handleFocus}
			on:blur={handleBlur}
		/>

		<!-- Floating label (when active) -->
		{#if floatingLabel && shouldShowFloatingLabel}
			<label for={inputId} class={labelClasses}>
				{label}
				{#if required}
					<span class="text-red-500">*</span>
				{/if}
			</label>
		{/if}

		<!-- Trailing icon/content -->
		{#if hasContentAfter}
			<div class="absolute inset-y-0 right-0 flex items-center space-x-1 pr-3">
				{#if suffix}
					<span class="text-sm text-gray-500 dark:text-gray-400">{suffix}</span>
				{/if}

				{#if showClearButton && hasValue && !disabled && !readonly}
					<button
						type="button"
						class="text-gray-400 hover:text-gray-600 focus:outline-none dark:text-gray-500 dark:hover:text-gray-300"
						on:click={clearInput}
						aria-label="Clear input"
						tabindex="-1"
					>
						<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M6 18L18 6M6 6l12 12"
							></path>
						</svg>
					</button>
				{/if}

				{#if type === 'password'}
					<button
						type="button"
						class="text-gray-400 hover:text-gray-600 focus:outline-none dark:text-gray-500 dark:hover:text-gray-300"
						on:click={togglePasswordVisibility}
						aria-label={showPassword ? 'Hide password' : 'Show password'}
						tabindex="-1"
					>
						{#if showPassword}
							<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18"
								></path>
							</svg>
						{:else}
							<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
								></path>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
								></path>
							</svg>
						{/if}
					</button>
				{/if}

				{#if showTrailingIcon}
					<span class="text-gray-500 dark:text-gray-400">
						{@html trailingIcon || icon}
					</span>
				{/if}
			</div>
		{/if}
	</div>

	<!-- Error message or help text -->
	<div class="mt-1 flex items-center justify-between text-sm">
		<div>
			{#if hasError}
				<p id="{inputId}-error" class="text-red-600 dark:text-red-400">{error}</p>
			{:else if helpText}
				<p id="{inputId}-help" class="text-gray-500 dark:text-gray-400">{helpText}</p>
			{/if}
		</div>

		<!-- Character counter -->
		{#if shouldShowCharCount && maxlength !== null}
			<div class="ml-auto text-xs text-gray-500 dark:text-gray-400">
				{value?.toString().length || 0}/{maxlength}
			</div>
		{/if}
	</div>
</div>

<style>
	/* Add subtle styling for focused state */
	input:focus {
		transition: all 0.2s ease;
	}

	/* Improve placeholder styling */
	input::placeholder {
		opacity: 0.5;
		transition: opacity 0.2s ease;
	}

	input:focus::placeholder {
		opacity: 0.7;
	}

	/* Smooth transitions for all state changes */
	input,
	label {
		transition: all 0.2s ease-in-out;
	}
</style>
