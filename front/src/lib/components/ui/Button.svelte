<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { goto } from '$app/navigation';

	// Simple type definitions
	type ButtonVariant =
		| 'primary'
		| 'secondary'
		| 'success'
		| 'danger'
		| 'warning'
		| 'outline'
		| 'link';
	type ButtonSize = 'xs' | 'sm' | 'md' | 'lg';
	type ButtonType = 'button' | 'submit' | 'reset';

	// Props using Svelte 5 runes
	const {
		variant = 'primary',
		size = 'md',
		type = 'button',
		href = '',
		target = '',
		disabled = false,
		loading = false,
		fullWidth = false,
		class: customClass = '',
		id = '',
		ariaLabel = '',
		ariaControls = '',
		ariaExpanded = false,
		dataTestid = ''
	} = $props<{
		variant?: ButtonVariant;
		size?: ButtonSize;
		type?: ButtonType;
		href?: string;
		target?: string;
		disabled?: boolean;
		loading?: boolean;
		fullWidth?: boolean;
		class?: string;
		id?: string;
		ariaLabel?: string;
		ariaControls?: string;
		ariaExpanded?: boolean;
		dataTestid?: string;
	}>();

	// Reactive states
	let linkRel = $state('');

	// Event dispatcher
	const dispatch = createEventDispatcher();

	// Tailwind class maps
	const variants = {
		primary: 'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500',
		secondary: 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500',
		success: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500',
		danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
		warning: 'bg-amber-500 text-white hover:bg-amber-600 focus:ring-amber-500',
		outline: 'bg-transparent border border-current text-current hover:bg-opacity-10',
		link: 'bg-transparent text-primary-600 hover:underline p-0'
	};

	const sizes = {
		xs: 'text-xs px-2 py-1',
		sm: 'text-sm px-3 py-1.5',
		md: 'text-base px-4 py-2',
		lg: 'text-lg px-5 py-2.5'
	};

	// Computed classes
	const buttonClasses = [
		// Base styles
		'bg-black inline-flex items-center justify-center font-medium rounded focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all',

		// Variant
		variants[variant],

		// Size
		sizes[size],

		// Width
		fullWidth ? 'w-full' : '',

		// States
		disabled || loading ? 'opacity-60 cursor-not-allowed' : '',

		// Custom class
		customClass
	]
		.filter(Boolean)
		.join(' ');

	// Handle href and target for external links
	$effect(() => {
		if (href && target === '_blank') {
			linkRel = 'noopener noreferrer';
		} else {
			linkRel = '';
		}
	});

	// Handle click event
	function handleClick(event: MouseEvent) {
		if (disabled || loading) {
			event.preventDefault();
			return;
		}

		dispatch('click', event);

		// Handle SvelteKit navigation for internal links
		if (href && !href.startsWith('http') && !event.ctrlKey && !event.metaKey) {
			event.preventDefault();
			goto(href);
		}
	}
</script>

{#if href && !disabled}
	<a
		{href}
		{id}
		class={buttonClasses}
		target={target || null}
		rel={linkRel || null}
		aria-label={ariaLabel || null}
		aria-expanded={ariaExpanded || null}
		aria-controls={ariaControls || null}
		data-testid={dataTestid || null}
		on:click={handleClick}
		on:mouseenter
		on:mouseleave
		on:focus
		on:blur
	>
		{#if loading}
			<svg class="mr-2 h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
				<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"
				></circle>
				<path
					class="opacity-75"
					fill="currentColor"
					d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
				></path>
			</svg>
		{/if}
		<slot />
	</a>
{:else}
	<button
		{id}
		{type}
		class={buttonClasses}
		disabled={disabled || loading}
		aria-label={ariaLabel || null}
		aria-expanded={ariaExpanded || null}
		aria-controls={ariaControls || null}
		data-testid={dataTestid || null}
		on:click={handleClick}
		on:mouseenter
		on:mouseleave
		on:focus
		on:blur
	>
		{#if loading}
			<svg class="mr-2 h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
				<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"
				></circle>
				<path
					class="opacity-75"
					fill="currentColor"
					d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
				></path>
			</svg>
		{/if}
		<slot />
	</button>
{/if}
