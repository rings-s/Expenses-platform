<script lang="ts">
	import { onMount } from 'svelte';
	import { isAuthenticated, user, authStore } from '$lib/stores/auth';
	import { authService } from '$lib/services/auth_services';

	import { clickOutside } from '$lib/actions/clickOutside';
	import { slide, fade } from 'svelte/transition';

	let isMenuOpen = $state(false);
	let isProfileMenuOpen = $state(false);
	let isScrolled = $state(false);
	let isDarkMode = $state(false);

	// Toggle mobile menu
	function toggleMenu() {
		isMenuOpen = !isMenuOpen;
		if (isMenuOpen) isProfileMenuOpen = false;
	}

	// Toggle profile dropdown
	function toggleProfileMenu() {
		isProfileMenuOpen = !isProfileMenuOpen;
		if (isProfileMenuOpen) isMenuOpen = false;
	}

	// Handle logout
	async function handleLogout() {
		try {
			console.log("Logging out user...");
			// First, call the auth service logout function
			const success = await authService.logout();

			if (success) {
					console.log("Logout successful, redirecting to login");
			} else {
				console.warn("Logout may have failed but continuing with redirect");
			}

			// Always navigate to login page, even if server-side logout failed
			window.location.href = '/auth/login';
		} catch (error) {
				console.error('Error during logout:', error);
				// Even if there's an error, force navigation to login
				window.location.href = '/auth/login';
		}
	}

	// Check scroll position to add shadow effect
	function handleScroll() {
		isScrolled = window.scrollY > 10;
	}

	// Toggle dark mode
	function toggleDarkMode() {
		isDarkMode = !isDarkMode;
		document.documentElement.classList.toggle('dark', isDarkMode);
		if (typeof localStorage !== 'undefined') {
			localStorage.setItem('darkMode', isDarkMode ? 'true' : 'false');
		}
	}

	onMount(() => {
		// Initialize dark mode from localStorage
		if (typeof localStorage !== 'undefined') {
			const storedMode = localStorage.getItem('darkMode');
			if (storedMode) {
				isDarkMode = storedMode === 'true';
				document.documentElement.classList.toggle('dark', isDarkMode);
			}
		}

		// Add scroll event listener
		window.addEventListener('scroll', handleScroll);
		handleScroll(); // Initial check

		// Clean up on component destruction
		return () => {
			window.removeEventListener('scroll', handleScroll);
		};
	});
</script>

<header
	class={`fixed top-0 right-0 left-0 z-40 border-b bg-white transition-all duration-300 dark:border-gray-800 dark:bg-gray-900 ${
		isScrolled ? 'shadow-md' : ''
	}`}
>
	<div class="container mx-auto px-4 py-3">
		<div class="flex items-center justify-between">
			<!-- Logo -->
			<a href="/" class="flex items-center space-x-2">
				<span class="text-primary dark:text-primary-400 text-xl font-bold">Expensis</span>
			</a>

			<!-- Desktop Navigation -->
			<nav class="hidden items-center space-x-8 md:flex">
				<a
					href="/"
					class="hover:text-primary dark:hover:text-primary-400 font-medium text-gray-700 transition duration-200 dark:text-gray-300"
					>Home</a
				>
				{#if $isAuthenticated}
					<a
						href="/dashboard"
						class="hover:text-primary dark:hover:text-primary-400 font-medium text-gray-700 transition duration-200 dark:text-gray-300"
						>Dashboard</a
					>
					<a
						href="/expenses"
						class="hover:text-primary dark:hover:text-primary-400 font-medium text-gray-700 transition duration-200 dark:text-gray-300"
						>Expenses</a
					>
					{#if $user && ($user.user_type === 'admin' || $user.user_type === 'manager')}
						<a
							href="/reports"
							class="hover:text-primary dark:hover:text-primary-400 font-medium text-gray-700 transition duration-200 dark:text-gray-300"
							>Reports</a
						>
					{/if}
					{#if $user && $user.user_type === 'admin'}
						<a
							href="/users"
							class="hover:text-primary dark:hover:text-primary-400 font-medium text-gray-700 transition duration-200 dark:text-gray-300"
							>Users</a
						>
					{/if}
				{:else}
					<a
						href="/about"
						class="hover:text-primary dark:hover:text-primary-400 font-medium text-gray-700 transition duration-200 dark:text-gray-300"
						>About</a
					>
					<a
						href="/features"
						class="hover:text-primary dark:hover:text-primary-400 font-medium text-gray-700 transition duration-200 dark:text-gray-300"
						>Features</a
					>
					<a
						href="/pricing"
						class="hover:text-primary dark:hover:text-primary-400 font-medium text-gray-700 transition duration-200 dark:text-gray-300"
						>Pricing</a
					>
				{/if}
			</nav>

			<!-- Right Side Actions -->
			<div class="flex items-center space-x-4">
				<!-- Dark Mode Toggle -->
				<button
					type="button"
					class="text-gray-500 hover:text-gray-700 focus:outline-none dark:text-gray-400 dark:hover:text-gray-200"
					on:click={toggleDarkMode}
					aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
				>
					{#if isDarkMode}
						<!-- Sun Icon -->
						<svg
							xmlns="http://www.w3.org/2000/svg"
							class="h-5 w-5"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
							/>
						</svg>
					{:else}
						<!-- Moon Icon -->
						<svg
							xmlns="http://www.w3.org/2000/svg"
							class="h-5 w-5"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
							/>
						</svg>
					{/if}
				</button>

				{#if $isAuthenticated}
					<!-- User Profile Dropdown -->
					<div class="relative hidden md:block">
						<button
							type="button"
							class="flex items-center space-x-2 focus:outline-none"
							on:click={toggleProfileMenu}
							aria-expanded={isProfileMenuOpen}
							aria-haspopup="true"
						>
							<div class="h-8 w-8 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
								{#if $user?.profile_image}
									<img src={$user.profile_image} alt="Profile" class="h-full w-full object-cover" />
								{:else if $user}
									<!-- Fallback Avatar -->
									<div class="bg-primary flex h-full w-full items-center justify-center text-white">
										{#if $user.first_name}
											<span>{$user.first_name.charAt(0)}</span>
										{:else if $user.username}
											<span>{$user.username.charAt(0)}</span>
										{:else}
											<span>U</span>
										{/if}
									</div>
								{:else}
									<div
										class="flex h-full w-full items-center justify-center bg-gray-300 text-gray-600"
									>
										<span>?</span>
									</div>
								{/if}
							</div>
							<span class="text-sm font-medium dark:text-gray-200">
								{#if $user}
									{$user.first_name || $user.username || 'User'}
								{:else}
									<span>User</span>
								{/if}
							</span>
							<!-- Dropdown Arrow -->
							<svg
								class="h-4 w-4 text-gray-500 dark:text-gray-400"
								viewBox="0 0 20 20"
								fill="currentColor"
							>
								<path
									fill-rule="evenodd"
									d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
									clip-rule="evenodd"
								/>
							</svg>
						</button>

						{#if isProfileMenuOpen}
							<div
								class="ring-opacity-5 absolute right-0 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black focus:outline-none dark:bg-gray-800 dark:ring-gray-700"
								role="menu"
								aria-orientation="vertical"
								use:clickOutside={() => (isProfileMenuOpen = false)}
								transition:slide={{ duration: 200 }}
							>
								<a
									href="/auth/profile"
									class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
									role="menuitem"
								>
									Your Profile
								</a>
								{#if $user && $user.user_type === 'admin'}
									<a
										href="/settings"
										class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
										role="menuitem"
									>
										Settings
									</a>
								{/if}
								<button
									type="button"
									class="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
									role="menuitem"
									on:click={handleLogout}
								>
									Sign out
								</button>
							</div>
						{/if}
					</div>
				{:else}
					<!-- Auth Buttons -->
					<div class="hidden space-x-2 md:flex">
						<a
							href="/auth/login"
							class="rounded-md px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800"
						>
							Log in
						</a>
						<a
							href="/auth/register"
							class="bg-primary hover:bg-primary-dark focus:ring-primary dark:bg-primary-500 dark:hover:bg-primary-600 rounded-md px-4 py-2 text-sm font-medium text-white focus:ring-2 focus:ring-offset-2 focus:outline-none"
						>
							Sign up
						</a>
					</div>
				{/if}

				<!-- Mobile Menu Button -->
				<button
					type="button"
					class="focus:ring-primary inline-flex items-center justify-center rounded-md p-2 text-gray-700 hover:bg-gray-100 hover:text-gray-900 focus:ring-2 focus:outline-none focus:ring-inset md:hidden dark:text-gray-200 dark:hover:bg-gray-800"
					aria-expanded="false"
					on:click={toggleMenu}
				>
					<span class="sr-only">{isMenuOpen ? 'Close menu' : 'Open menu'}</span>
					{#if isMenuOpen}
						<!-- X icon -->
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
								d="M6 18L18 6M6 6l12 12"
							/>
						</svg>
					{:else}
						<!-- Menu icon -->
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
					{/if}
				</button>
			</div>
		</div>
	</div>

	<!-- Mobile Menu -->
	{#if isMenuOpen}
		<div class="md:hidden" transition:slide={{ duration: 200 }}>
			<div class="border-t border-gray-200 px-2 py-3 dark:border-gray-700">
				<a
					href="/"
					class="block rounded-md px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-200 dark:hover:bg-gray-800"
				>
					Home
				</a>
				{#if $isAuthenticated}
					<a
						href="/dashboard"
						class="block rounded-md px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-200 dark:hover:bg-gray-800"
					>
						Dashboard
					</a>
					<a
						href="/expenses"
						class="block rounded-md px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-200 dark:hover:bg-gray-800"
					>
						Expenses
					</a>
					{#if $user && ($user.user_type === 'admin' || $user.user_type === 'manager')}
						<a
							href="/reports"
							class="block rounded-md px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-200 dark:hover:bg-gray-800"
						>
							Reports
						</a>
					{/if}
					{#if $user && $user.user_type === 'admin'}
						<a
							href="/users"
							class="block rounded-md px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-200 dark:hover:bg-gray-800"
						>
							Users
						</a>
					{/if}
					<div class="border-t border-gray-200 pt-4 pb-3 dark:border-gray-700">
						{#if $user}
							<div class="flex items-center px-4">
								<div
									class="h-10 w-10 flex-shrink-0 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700"
								>
									{#if $user.profile_image}
										<img
											src={$user.profile_image}
											alt="Profile"
											class="h-full w-full object-cover"
										/>
									{:else}
										<!-- Fallback Avatar -->
										<div
											class="bg-primary flex h-full w-full items-center justify-center text-white"
										>
											{#if $user.first_name}
												<span>{$user.first_name.charAt(0)}</span>
											{:else if $user.username}
												<span>{$user.username.charAt(0)}</span>
											{:else}
												<span>U</span>
											{/if}
										</div>
									{/if}
								</div>
								<div class="ml-3">
									<div class="text-base font-medium text-gray-800 dark:text-gray-200">
										{#if $user.first_name || $user.last_name}
											<span>{$user.first_name || ''} {$user.last_name || ''}</span>
										{:else}
											<span>{$user.username || 'User'}</span>
										{/if}
									</div>
									<div class="text-sm font-medium text-gray-500 dark:text-gray-400">
										{$user.email || ''}
									</div>
								</div>
							</div>
						{/if}
						<div class="mt-3 space-y-1 px-2">
							<a
								href="/auth/profile"
								class="block rounded-md px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-200 dark:hover:bg-gray-800"
							>
								Your Profile
							</a>
							{#if $user && $user.user_type === 'admin'}
								<a
									href="/settings"
									class="block rounded-md px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-200 dark:hover:bg-gray-800"
								>
									Settings
								</a>
							{/if}
							<button
								type="button"
								class="block w-full rounded-md px-3 py-2 text-left text-base font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-200 dark:hover:bg-gray-800"
								on:click={handleLogout}
							>
								Sign out
							</button>
						</div>
					</div>
				{:else}
					<a
						href="/about"
						class="block rounded-md px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-200 dark:hover:bg-gray-800"
					>
						About
					</a>
					<a
						href="/features"
						class="block rounded-md px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-200 dark:hover:bg-gray-800"
					>
						Features
					</a>
					<a
						href="/pricing"
						class="block rounded-md px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-200 dark:hover:bg-gray-800"
					>
						Pricing
					</a>
					<div class="mt-4 space-y-2 px-3">
						<a
							href="/auth/login"
							class="block w-full rounded-md bg-gray-100 px-4 py-2 text-center text-base font-medium text-gray-800 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
						>
							Log in
						</a>
						<a
							href="/auth/register"
							class="bg-primary hover:bg-primary-dark dark:bg-primary-500 dark:hover:bg-primary-600 block w-full rounded-md px-4 py-2 text-center text-base font-medium text-white"
						>
							Sign up
						</a>
					</div>
				{/if}
			</div>
		</div>
	{/if}
</header>

<!-- Spacer to prevent content from hiding under fixed header -->
<div class="h-16 md:h-16"></div>

<style>
	/* Add smooth transitions */
	a,
	button {
		transition: all 0.2s ease-in-out;
	}
</style>
