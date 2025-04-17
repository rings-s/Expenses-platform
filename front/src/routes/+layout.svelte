<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { navigating } from '$app/stores';
	import { authStore, isAuthenticated, isLoading, user } from '$lib/stores/auth';
	import Header from '$lib/components/layout/Header.svelte';
	import Footer from '$lib/components/layout/Footer.svelte';
	import Sidebar from '$lib/components/layout/Sidebar.svelte';
	import { browser } from '$app/environment';
	import { page } from '$app/stores';
	import '../app.css';

	// State with runes
	let isSidebarOpen = $state(false);
	let isMobile = $state(browser ? window.innerWidth < 768 : false);
	let showSidebar = $state(false);

	// Derived values
	const loading = $derived($isLoading || $navigating);

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

		// Handle sidebar for mobile vs desktop
		const handleResize = () => {
			isMobile = window.innerWidth < 768;
			if (!isMobile) {
				isSidebarOpen = true;
			} else {
				isSidebarOpen = false;
			}
		};

		// Set initial sidebar state
		handleResize();

		// Add resize event listener
		window.addEventListener('resize', handleResize);

		// Clean up on component destruction
		return () => {
			clearTimeout(safetyTimeout);
			window.removeEventListener('resize', handleResize);
		};
	});

	// Toggle sidebar
	function toggleSidebar() {
		isSidebarOpen = !isSidebarOpen;
	}

	// Side effects with $effect

	// Close sidebar on navigation (mobile only)
	$effect(() => {
		if ($navigating && isMobile) {
			isSidebarOpen = false;
		}
	});

	// Determine if we should show the sidebar based on the current route
	$effect(() => {
		// Only show sidebar for authenticated users on non-auth pages
		showSidebar = $isAuthenticated && !$page.url.pathname.startsWith('/auth/');
	});
</script>

{#if loading}
	<!-- Loading indicator -->
	<div
		class="bg-opacity-80 dark:bg-opacity-80 fixed inset-0 z-50 flex items-center justify-center bg-white dark:bg-gray-900"
	>
		<div
			class="border-primary h-16 w-16 animate-spin rounded-full border-4 border-t-transparent"
		></div>
	</div>
{/if}

<div class="flex min-h-screen flex-col bg-gray-50 dark:bg-gray-900">
	<Header />

	<div class="flex flex-grow">
		{#if showSidebar}
			<Sidebar isOpen={isSidebarOpen} {isMobile} on:close={() => (isSidebarOpen = false)} />
		{/if}

		<main
			class={`container mx-auto flex-grow p-4 transition-all duration-300 ${showSidebar && isSidebarOpen && !isMobile ? 'md:ml-64' : ''}`}
		>
			<slot />
		</main>
	</div>

	<Footer />
</div>
