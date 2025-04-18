<script>
	import { onMount } from 'svelte';
	import { navigating, page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { authStore } from '$lib/stores/authStore';
	import '../app.css';
	import '../app.css';

	let { children } = $props();

	onMount(async () => {
		// Initialize auth store
		await authStore.initialize();

		// Redirect to login if not authenticated and trying to access protected routes
		if (
			!$authStore.isAuthenticated &&
			!$page.url.pathname.startsWith('/login') &&
			!$page.url.pathname.startsWith('/register') &&
			!$page.url.pathname.startsWith('/verify-email') &&
			!$page.url.pathname.startsWith('/forgot-password') &&
			!$page.url.pathname.startsWith('/reset-password')
		) {
			goto('/login');
		}
	});
</script>

<!-- Add a loading indicator when navigating between pages -->
{#if $navigating}
	<div class="bg-opacity-75 fixed inset-0 z-50 flex items-center justify-center bg-gray-500">
		<div class="h-16 w-16 animate-spin rounded-full border-t-2 border-b-2 border-blue-600"></div>
	</div>
{/if}

{@render children()}
