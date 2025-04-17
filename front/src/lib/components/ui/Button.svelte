<!--
  Button Component

  A highly customizable button component with support for:
  - Multiple variants (primary, secondary, danger, success, warning, info, ghost)
  - Multiple sizes (xs, sm, md, lg, xl)
  - Loading states with animated spinner
  - Disabled states
  - Link functionality (with href)
  - Icons (leading and trailing)
  - Full width option
  - Subtle animations and transitions
  - High contrast for accessibility
-->
<script lang="ts">
	// Props with Svelte 5 runes
	const {
		// Button properties
		type = 'button',
		variant = 'primary',
		size = 'md',
		fullWidth = false,
		disabled = false,
		loading = false,
		href = null,
		active = false,
		rounded = 'md',

		// Icon properties
		icon = null,
		iconPosition = 'left',
		trailingIcon = null,

		// Additional styling
		class: className = '',

		// Animations
		animate = true,
		pulse = false
	} = $props();

	// Derived values
	const showLeadingIcon = $derived(icon && (iconPosition === 'left' || !iconPosition));
	const showTrailingIcon = $derived(trailingIcon || (icon && iconPosition === 'right'));
	const isDisabled = $derived(disabled || loading);
	const isLink = $derived(!!href);

	// Variant styles with refined color palette
	const variantClasses = {
		primary:
			'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 focus:ring-blue-500/40 dark:bg-blue-500 dark:hover:bg-blue-600 dark:active:bg-blue-700',
		secondary:
			'bg-gray-200 text-gray-800 hover:bg-gray-300 active:bg-gray-400 focus:ring-gray-300/40 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600 dark:active:bg-gray-500',
		danger:
			'bg-red-600 text-white hover:bg-red-700 active:bg-red-800 focus:ring-red-500/40 dark:bg-red-500 dark:hover:bg-red-600 dark:active:bg-red-700',
		success:
			'bg-emerald-600 text-white hover:bg-emerald-700 active:bg-emerald-800 focus:ring-emerald-500/40 dark:bg-emerald-500 dark:hover:bg-emerald-600 dark:active:bg-emerald-700',
		warning:
			'bg-amber-500 text-white hover:bg-amber-600 active:bg-amber-700 focus:ring-amber-400/40 dark:bg-amber-500 dark:hover:bg-amber-600 dark:active:bg-amber-700',
		info: 'bg-sky-500 text-white hover:bg-sky-600 active:bg-sky-700 focus:ring-sky-400/40 dark:bg-sky-500 dark:hover:bg-sky-600 dark:active:bg-sky-700',
		ghost:
			'bg-transparent text-gray-700 hover:bg-gray-100 active:bg-gray-200 focus:ring-gray-300/40 dark:text-gray-300 dark:hover:bg-gray-800 dark:active:bg-gray-700',
		outline:
			'bg-transparent border border-gray-300 text-gray-700 hover:bg-gray-50 active:bg-gray-100 focus:ring-gray-300/40 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800 dark:active:bg-gray-700'
	};

	// Size classes with improved spacing
	const sizeClasses = {
		xs: 'text-xs px-2 py-1 h-6',
		sm: 'text-sm px-2.5 py-1.5 h-8',
		md: 'text-sm px-4 py-2 h-10',
		lg: 'text-base px-5 py-2.5 h-11',
		xl: 'text-base px-6 py-3 h-12'
	};

	// Rounded corner variants
	const roundedClasses = {
		none: 'rounded-none',
		sm: 'rounded-sm',
		md: 'rounded-md',
		lg: 'rounded-lg',
		xl: 'rounded-xl',
		full: 'rounded-full'
	};

	// Icon size based on button size
	const iconSizeClasses = {
		xs: 'w-3.5 h-3.5',
		sm: 'w-4 h-4',
		md: 'w-4.5 h-4.5',
		lg: 'w-5 h-5',
		xl: 'w-5.5 h-5.5'
	};

	// Text classes for when we have icons
	const textWithIconClasses = {
		left: 'ml-2',
		right: 'mr-2'
	};

	// Spinner size classes
	const spinnerSizeClasses = {
		xs: 'w-3 h-3 border-1',
		sm: 'w-3.5 h-3.5 border-1',
		md: 'w-4 h-4 border-2',
		lg: 'w-4.5 h-4.5 border-2',
		xl: 'w-5 h-5 border-2'
	};

	// Final classes computation
	$effect(() => {
		// Recompute when dependencies change
	});

	const buttonClasses = $derived(`
    ${variantClasses[variant]}
    ${sizeClasses[size]}
    ${roundedClasses[rounded]}
    ${fullWidth ? 'w-full' : 'w-auto'}
    ${active ? 'ring-2' : ''}
    ${animate ? 'transition-all duration-200' : ''}
    ${pulse ? 'animate-pulse' : ''}
    ${isDisabled ? 'opacity-60 cursor-not-allowed pointer-events-none' : 'transform hover:-translate-y-0.5 active:translate-y-0'}
    font-medium inline-flex items-center justify-center
    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-900
    shadow-sm hover:shadow
    ${className}
  `);
</script>

{#if isLink}
	<a {href} class={buttonClasses} {...$$restProps}>
		{#if loading}
			<span
				class={`mr-2 inline-block animate-spin rounded-full border-2 border-white/20 border-t-white ${spinnerSizeClasses[size]}`}
			></span>
		{:else if showLeadingIcon}
			<span class={iconSizeClasses[size]}>
				{@html icon}
			</span>
		{/if}

		<span
			class={showLeadingIcon
				? textWithIconClasses.left
				: showTrailingIcon
					? textWithIconClasses.right
					: ''}
		>
			<slot></slot>
		</span>

		{#if showTrailingIcon && !loading}
			<span class={iconSizeClasses[size]}>
				{@html trailingIcon || icon}
			</span>
		{/if}
	</a>
{:else}
	<button {type} class={buttonClasses} disabled={isDisabled} {...$$restProps}>
		{#if loading}
			<span
				class={`mr-2 inline-block animate-spin rounded-full border-2 border-current border-t-transparent ${spinnerSizeClasses[size]}`}
			></span>
		{:else if showLeadingIcon}
			<span class={iconSizeClasses[size]}>
				{@html icon}
			</span>
		{/if}

		<span
			class={showLeadingIcon
				? textWithIconClasses.left
				: showTrailingIcon
					? textWithIconClasses.right
					: ''}
		>
			<slot></slot>
		</span>

		{#if showTrailingIcon && !loading}
			<span class={iconSizeClasses[size]}>
				{@html trailingIcon || icon}
			</span>
		{/if}
	</button>
{/if}

<style>
	/* Add subtle micro-interactions */
	button,
	a {
		backface-visibility: hidden;
		transform: translateZ(0);
		-webkit-font-smoothing: subpixel-antialiased;
	}

	/* Crisp text rendering */
	button,
	a {
		text-rendering: optimizeLegibility;
	}

	/* Improve focus visibility for accessibility */
	button:focus-visible,
	a:focus-visible {
		outline: 2px solid currentColor;
		outline-offset: 2px;
	}
</style>
