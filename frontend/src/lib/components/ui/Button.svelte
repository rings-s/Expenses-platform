<script>
	export let type = 'button';
	export let variant = 'primary'; // primary, secondary, danger, outline
	export let size = 'md'; // sm, md, lg
	export let disabled = false;
	export let loading = false;
	export let fullWidth = false;

	const variantClasses = {
		primary: 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500',
		secondary: 'bg-gray-600 hover:bg-gray-700 text-white focus:ring-gray-500',
		danger: 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500',
		success: 'bg-green-600 hover:bg-green-700 text-white focus:ring-green-500',
		outline: 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-blue-500'
	};

	const sizeClasses = {
		sm: 'py-1 px-3 text-xs',
		md: 'py-2 px-4 text-sm',
		lg: 'py-3 px-6 text-base'
	};

	$: classes = `
    ${variantClasses[variant]}
    ${sizeClasses[size]}
    ${fullWidth ? 'w-full' : ''}
    inline-flex justify-center items-center border border-transparent rounded-md font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors
    ${disabled || loading ? 'opacity-70 cursor-not-allowed' : ''}
  `;
</script>

<button {type} disabled={disabled || loading} class={classes} on:click>
	{#if loading}
		<svg
			class="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
			xmlns="http://www.w3.org/2000/svg"
			fill="none"
			viewBox="0 0 24 24"
		>
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
