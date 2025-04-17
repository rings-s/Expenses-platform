<!--
  Card Component

  A versatile card component with:
  - Various sizes and styles
  - Header, body, and footer slots
  - Hover and active states
  - Elevation options
  - Border variations
  - Optional interactive behavior
-->
<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	// Props with Svelte 5 runes
	const {
		// Styling options
		variant = 'default',
		padding = 'default',
		rounded = 'md',
		elevation = 'md',
		border = true,
		borderColor = 'default',
		maxWidth = '',
		fullWidth = false,

		// Interactive options
		hoverable = false,
		clickable = false,
		href = '',

		// Miscellaneous options
		title = '',
		titleSize = 'md',
		titleClass = '',
		footerClass = '',
		bodyClass = '',
		headerClass = '',

		// Additional styling
		class: className = ''
	} = $props();

	// Dispatch events
	const dispatch = createEventDispatcher<{
		click: MouseEvent;
	}>();

	// Elevation classes
	const elevationClasses = {
		none: '',
		xs: 'shadow-sm',
		sm: 'shadow',
		md: 'shadow-md',
		lg: 'shadow-lg',
		xl: 'shadow-xl',
		'2xl': 'shadow-2xl'
	};

	// Rounded corner classes
	const roundedClasses = {
		none: 'rounded-none',
		sm: 'rounded-sm',
		md: 'rounded-md',
		lg: 'rounded-lg',
		xl: 'rounded-xl',
		full: 'rounded-3xl'
	};

	// Padding classes
	const paddingClasses = {
		none: 'p-0',
		xs: 'p-2',
		sm: 'p-3',
		default: 'p-4',
		md: 'p-5',
		lg: 'p-6',
		xl: 'p-8'
	};

	// Header/footer padding classes (smaller padding for headers/footers)
	const headerFooterPaddingClasses = {
		none: 'px-0 py-0',
		xs: 'px-2 py-1.5',
		sm: 'px-3 py-2',
		default: 'px-4 py-3',
		md: 'px-5 py-3',
		lg: 'px-6 py-4',
		xl: 'px-8 py-5'
	};

	// Body padding classes (adjusted for header/footer presence)
	const bodyPaddingClasses = {
		none: 'p-0',
		xs: 'px-2 py-1',
		sm: 'px-3 py-2',
		default: 'px-4 py-3',
		md: 'px-5 py-3',
		lg: 'px-6 py-4',
		xl: 'px-8 py-5'
	};

	// Title size classes
	const titleSizeClasses = {
		sm: 'text-sm',
		md: 'text-base',
		lg: 'text-lg',
		xl: 'text-xl',
		'2xl': 'text-2xl'
	};

	// Border color classes
	const borderColorClasses = {
		default: 'border-gray-200 dark:border-gray-700',
		primary: 'border-blue-200 dark:border-blue-800',
		secondary: 'border-gray-300 dark:border-gray-600',
		success: 'border-green-200 dark:border-green-800',
		danger: 'border-red-200 dark:border-red-800',
		warning: 'border-amber-200 dark:border-amber-800',
		info: 'border-sky-200 dark:border-sky-800'
	};

	// Variant classes
	const variantClasses = {
		default: 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200',
		primary: 'bg-blue-50 dark:bg-blue-900/30 text-blue-900 dark:text-blue-100',
		secondary: 'bg-gray-50 dark:bg-gray-800/80 text-gray-900 dark:text-gray-100',
		success: 'bg-green-50 dark:bg-green-900/30 text-green-900 dark:text-green-100',
		danger: 'bg-red-50 dark:bg-red-900/30 text-red-900 dark:text-red-100',
		warning: 'bg-amber-50 dark:bg-amber-900/30 text-amber-900 dark:text-amber-100',
		info: 'bg-sky-50 dark:bg-sky-900/30 text-sky-900 dark:text-sky-100',
		transparent: 'bg-transparent text-gray-800 dark:text-gray-200'
	};

	// Handle click event
	function handleClick(event: MouseEvent) {
		if (clickable) {
			dispatch('click', event);
		}
	}

	// Determine if we have the header and footer slots
	const hasHeaderSlot = $derived($$slots.header || title);
	const hasFooterSlot = $derived($$slots.footer);

	// Compose final classes
	const cardClasses = $derived(`
    ${variantClasses[variant]}
    ${roundedClasses[rounded]}
    ${elevationClasses[elevation]}
    ${border ? `border ${borderColorClasses[borderColor]}` : ''}
    ${!hasHeaderSlot && !hasFooterSlot ? paddingClasses[padding] : 'p-0'}
    ${hoverable ? 'hover:shadow-lg transition-shadow duration-200' : ''}
    ${clickable || href ? 'cursor-pointer hover:-translate-y-1 transition-transform duration-200' : ''}
    ${fullWidth ? 'w-full' : ''}
    ${maxWidth ? `max-w-${maxWidth}` : ''}
    overflow-hidden
    ${className}
  `);

	// Handle whether to render as a link or div
	const Tag = $derived(href ? 'a' : 'div');
</script>

<svelte:element
	this={Tag}
	class={cardClasses}
	on:click={handleClick}
	href={href || undefined}
	{...href ? { rel: 'noopener' } : {}}
	{...$$restProps}
>
	<!-- Card Header -->
	{#if hasHeaderSlot}
		<div
			class="border-b border-gray-200 dark:border-gray-700 {headerFooterPaddingClasses[
				padding
			]} {headerClass}"
		>
			{#if $$slots.header}
				<slot name="header" />
			{:else if title}
				<h3 class="font-medium {titleSizeClasses[titleSize]} {titleClass}">
					{title}
				</h3>
			{/if}
		</div>
	{/if}

	<!-- Card Body -->
	<div class="{bodyPaddingClasses[padding]} {bodyClass}">
		<slot />
	</div>

	<!-- Card Footer -->
	{#if hasFooterSlot}
		<div
			class="border-t border-gray-200 dark:border-gray-700 {headerFooterPaddingClasses[
				padding
			]} {footerClass}"
		>
			<slot name="footer" />
		</div>
	{/if}
</svelte:element>

<style>
	/* Add subtle transitions */
	:global(a),
	:global(div) {
		backface-visibility: hidden;
		transform: translateZ(0);
		-webkit-font-smoothing: subpixel-antialiased;
	}
</style>
