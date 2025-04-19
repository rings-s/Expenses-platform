<!-- src/routes/+layout.svelte -->
<script>
	import { onMount } from 'svelte';
	import { navigating, page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { authStore } from '$lib/stores/authStore';
	import HeaderAuth from '$lib/components/auth/HeaderAuth.svelte';
	import Logo from '$lib/components/ui/Logo.svelte';
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
			!$page.url.pathname.startsWith('/reset-password') &&
			$page.url.pathname !== '/'
		) {
			goto('/login');
		}
	});

	// Check if current page is an auth page using $derived
	const isAuthPage = $derived(
		$page.url.pathname.includes('/login') ||
			$page.url.pathname.includes('/register') ||
			$page.url.pathname.includes('/verify-email') ||
			$page.url.pathname.includes('/forgot-password') ||
			$page.url.pathname.includes('/reset-password')
	);

	// Check if current page is a dashboard/app page using $derived
	const isAppPage = $derived(
		$page.url.pathname.includes('/dashboard') ||
			$page.url.pathname.includes('/expenses') ||
			$page.url.pathname.includes('/categories') ||
			$page.url.pathname.includes('/budgets') ||
			$page.url.pathname.includes('/reports') ||
			$page.url.pathname.includes('/profile') ||
			$page.url.pathname.includes('/settings')
	);
</script>

<!-- HEADER SECTION REMOVED -->

<!-- Loading indicator -->
{#if $navigating}
	<div class="bg-opacity-75 fixed inset-0 z-50 flex items-center justify-center bg-gray-500">
		<div class="h-16 w-16 animate-spin rounded-full border-t-2 border-b-2 border-blue-600"></div>
	</div>
{/if}

<!-- Main content -->
<main>
	{@render children()}
</main>
