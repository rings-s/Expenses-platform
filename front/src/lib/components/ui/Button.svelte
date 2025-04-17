<!-- src/lib/components/ui/Button.svelte -->
<script lang="ts">
	export let type: 'button' | 'submit' | 'reset' = 'button';
	export let variant: 'primary' | 'secondary' | 'danger' | 'ghost' = 'primary';
	export let size: 'sm' | 'md' | 'lg' = 'md';
	export let fullWidth = false;
	export let disabled = false;
	export let loading = false;
	export let href: string | null = null;

	const variantClasses = {
		primary: 'bg-primary hover:bg-primary-dark text-white',
		secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-800',
		danger: 'bg-red-600 hover:bg-red-700 text-white',
		ghost: 'bg-transparent hover:bg-gray-100 text-gray-700'
	};

	const sizeClasses = {
		sm: 'text-xs px-2.5 py-1.5',
		md: 'text-sm px-4 py-2',
		lg: 'text-base px-6 py-3'
	};

	$: classes = [
		'bg-gray-900 rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary',
		variantClasses[variant],
		sizeClasses[size],
		fullWidth ? 'w-full' : '',
		disabled || loading ? 'opacity-50 cursor-not-allowed' : '',
		$$props.class || ''
	].join(' ');
</script>

{#if href}
	<a {href} class={classes} {...$$restProps}>
		{#if loading}
			<span
				class="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"
			></span>
		{/if}
		<slot />
	</a>
{:else}
	<button {type} class={classes} {disabled} {...$$restProps}>
		{#if loading}
			<span
				class="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"
			></span>
		{/if}
		<slot />
	</button>
{/if}
