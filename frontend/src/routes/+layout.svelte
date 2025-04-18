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
	let isMobileMenuOpen = false;

	function toggleMobileMenu() {
		isMobileMenuOpen = !isMobileMenuOpen;
	}

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
</script>

<!-- Header - Don't show on auth pages -->
{#if !$page.url.pathname.includes('/login') && !$page.url.pathname.includes('/register') && !$page.url.pathname.includes('/verify-email') && !$page.url.pathname.includes('/forgot-password') && !$page.url.pathname.includes('/reset-password')}
	<header class="bg-white shadow">
		<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
			<div class="flex h-16 justify-between">
				<div class="flex">
					<div class="flex flex-shrink-0 items-center">
						<a href="/">
							<Logo size="md" />
						</a>
					</div>

					<!-- Desktop navigation -->
					<nav class="hidden sm:ml-6 sm:flex sm:space-x-8">
						<a
							href="/"
							class="inline-flex items-center border-b-2 border-transparent px-1 pt-1 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700"
						>
							Home
						</a>
						{#if $authStore.isAuthenticated}
							<a
								href="/dashboard"
								class="inline-flex items-center border-b-2 border-transparent px-1 pt-1 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700"
							>
								Dashboard
							</a>
							<a
								href="/expenses"
								class="inline-flex items-center border-b-2 border-transparent px-1 pt-1 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700"
							>
								Expenses
							</a>
							<a
								href="/reports"
								class="inline-flex items-center border-b-2 border-transparent px-1 pt-1 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700"
							>
								Reports
							</a>
						{/if}
					</nav>
				</div>

				<!-- User menu -->
				<div class="flex items-center">
					<HeaderAuth />

					<!-- Mobile menu button -->
					<div class="ml-3 sm:hidden">
						<button
							type="button"
							on:click={toggleMobileMenu}
							class="inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-inset"
							aria-controls="mobile-menu"
							aria-expanded="false"
						>
							<span class="sr-only">Open main menu</span>
							<svg
								class="h-6 w-6"
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
								aria-hidden="true"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M4 6h16M4 12h16M4 18h16"
								/>
							</svg>
						</button>
					</div>
				</div>
			</div>
		</div>

		<!-- Mobile menu -->
		{#if isMobileMenuOpen}
			<div class="sm:hidden" id="mobile-menu">
				<div class="space-y-1 pt-2 pb-3">
					<a href="/" class="block border-l-4 py-2 pr-4 pl-3 text-base font-medium text-gray-700">
						Home
					</a>
					{#if $authStore.isAuthenticated}
						<a
							href="/dashboard"
							class="block border-l-4 border-transparent py-2 pr-4 pl-3 text-base font-medium text-gray-500 hover:border-gray-300 hover:bg-gray-50 hover:text-gray-700"
						>
							Dashboard
						</a>
						<a
							href="/expenses"
							class="block border-l-4 border-transparent py-2 pr-4 pl-3 text-base font-medium text-gray-500 hover:border-gray-300 hover:bg-gray-50 hover:text-gray-700"
						>
							Expenses
						</a>
						<a
							href="/reports"
							class="block border-l-4 border-transparent py-2 pr-4 pl-3 text-base font-medium text-gray-500 hover:border-gray-300 hover:bg-gray-50 hover:text-gray-700"
						>
							Reports
						</a>
					{/if}
				</div>
			</div>
		{/if}
	</header>
{/if}

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
