<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { navigating } from '$app/stores';
	import { authStore, isAuthenticated, isLoading } from '$lib/stores/auth';
	import Header from '$lib/components/layout/Header.svelte';
	import Footer from '$lib/components/layout/Footer.svelte';
	import '../app.css';

	// Initialize auth on mount
	onMount(() => {
		// Initialize authentication state
		authStore.init();

		// Safety timeout to prevent infinite loading
		const safetyTimeout = setTimeout(() => {
			const state = $isLoading;
			if (state) {
				console.warn('Auth loading state timed out - forcing completion');
				authStore._update((state) => ({ ...state, isLoading: false }));
			}
		}, 5000);

		// Clean up the safety timeout on component destruction
		return () => clearTimeout(safetyTimeout);
	});

	// Use $derived for reactive loading state in Svelte 5 runes mode
	const loading = $derived($isLoading || $navigating);

	// Use runes props syntax
	const { children } = $props();
</script>

{#if loading}
	<!-- Loading indicator -->
	<div class="bg-opacity-80 fixed inset-0 z-50 flex items-center justify-center bg-white">
		<div
			class="border-primary h-16 w-16 animate-spin rounded-full border-4 border-t-transparent"
		></div>
	</div>
{/if}

<div class="flex min-h-screen flex-col">
	<Header />

	<main class="container mx-auto flex-grow px-4 py-8">
		{@render children()}
	</main>

	<Footer />
</div>
