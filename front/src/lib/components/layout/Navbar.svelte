<script lang="ts">
	import { onMount, createEventDispatcher } from 'svelte';
	import { fade, slide } from 'svelte/transition';
	import { user, authStore } from '$lib/stores/auth';
	import { clickOutside } from '$lib/actions/clickOutside';
	import { page } from '$app/stores';

	// Props with Svelte 5 runes
	const { title = '', showSidebarToggle = true, isSidebarOpen = false } = $props();

	// State with runes
	let isProfileMenuOpen = $state(false);
	let isNotificationsOpen = $state(false);
	let isScrolled = $state(false);
	let searchQuery = $state('');
	let hasNotifications = $state(true); // Mock data - would be dynamic in real app

	// Event dispatcher
	const dispatch = createEventDispatcher();

	// Toggle sidebar
	function toggleSidebar() {
		dispatch('toggleSidebar');
	}

	// Toggle profile menu
	function toggleProfileMenu() {
		isProfileMenuOpen = !isProfileMenuOpen;
		if (isProfileMenuOpen) isNotificationsOpen = false;
	}

	// Toggle notifications panel
	function toggleNotifications() {
		isNotificationsOpen = !isNotificationsOpen;
		if (isNotificationsOpen) isProfileMenuOpen = false;
	}

	// Handle logout
	async function handleLogout() {
		await authStore.logout();
		window.location.href = '/auth/login';
	}

	// Search form submission
	function handleSearch(e: Event) {
		e.preventDefault();
		if (searchQuery.trim()) {
			window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`;
		}
	}

	// Check scroll position to add shadow effect
	function handleScroll() {
		isScrolled = window.scrollY > 10;
	}

	onMount(() => {
		// Add scroll event listener
		window.addEventListener('scroll', handleScroll);
		handleScroll(); // Initial check

		// Clean up on component destruction
		return () => {
			window.removeEventListener('scroll', handleScroll);
		};
	});
</script>

<div
	class={`sticky top-0 z-30 w-full border-b bg-white transition-shadow duration-300 dark:border-gray-800 dark:bg-gray-900 ${
		isScrolled ? 'shadow-md' : ''
	}`}
>
	<div class="px-4 md:px-6">
		<div class="flex h-16 items-center justify-between">
			<!-- Left section: Sidebar toggle and Title -->
			<div class="flex items-center">
				{#if showSidebarToggle}
					<button
						type="button"
						class="focus:ring-primary rounded-md p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-600 focus:ring-2 focus:outline-none focus:ring-inset dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-300"
						on:click={toggleSidebar}
						aria-expanded={isSidebarOpen}
					>
						<span class="sr-only">{isSidebarOpen ? 'Close sidebar' : 'Open sidebar'}</span>
						{#if isSidebarOpen}
							<!-- X icon -->
							<svg
								class="h-6 w-6"
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
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
				{/if}

				<div class="ml-2 flex items-center sm:ml-4">
					<span class="text-xl font-semibold text-gray-800 dark:text-white">
						{title || $page.url.pathname.split('/').pop()?.replace(/-/g, ' ') || 'Dashboard'}
					</span>
				</div>
			</div>

			<!-- Center section: Search (hidden on small screens) -->
			<div class="hidden max-w-lg flex-1 justify-center px-2 lg:flex">
				<form on:submit={handleSearch} class="w-full max-w-lg">
					<div class="relative w-full">
						<div class="absolute inset-y-0 left-0 flex items-center pl-3">
							<svg
								class="h-5 w-5 text-gray-400"
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
								/>
							</svg>
						</div>
						<input
							type="text"
							bind:value={searchQuery}
							placeholder="Search..."
							class="focus:border-primary focus:ring-primary dark:focus:border-primary-400 w-full rounded-md border border-gray-300 bg-white py-2 pr-4 pl-10 text-gray-700 focus:ring-1 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
						/>
					</div>
				</form>
			</div>

			<!-- Right section: Actions -->
			<div class="flex items-center space-x-4">
				<!-- Mobile Search Toggle -->
				<button
					type="button"
					class="focus:ring-primary rounded-md p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-600 focus:ring-2 focus:outline-none focus:ring-inset lg:hidden dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-300"
					aria-label="Search"
				>
					<svg
						class="h-5 w-5"
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
						/>
					</svg>
				</button>

				<!-- Notifications -->
				<div class="relative">
					<button
						type="button"
						class="focus:ring-primary relative rounded-md p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-600 focus:ring-2 focus:outline-none focus:ring-inset dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-300"
						on:click={toggleNotifications}
						aria-expanded={isNotificationsOpen}
					>
						<span class="sr-only">View notifications</span>
						<svg
							class="h-6 w-6"
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
							/>
						</svg>

						{#if hasNotifications}
							<span class="absolute top-1 right-1 block h-2 w-2 rounded-full bg-red-500"></span>
						{/if}
					</button>

					{#if isNotificationsOpen}
						<div
							class="ring-opacity-5 absolute right-0 mt-2 w-80 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black focus:outline-none dark:bg-gray-800 dark:ring-gray-700"
							use:clickOutside={() => (isNotificationsOpen = false)}
							transition:slide={{ duration: 200 }}
						>
							<div class="p-4">
								<h3 class="text-lg font-medium text-gray-900 dark:text-white">Notifications</h3>
								<div class="mt-4 space-y-3">
									<!-- Mock notifications - would be dynamic in real app -->
									<div
										class="flex items-start space-x-3 rounded-md p-3 hover:bg-gray-50 dark:hover:bg-gray-700"
									>
										<div
											class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900"
										>
											<svg
												class="h-5 w-5 text-blue-600 dark:text-blue-200"
												xmlns="http://www.w3.org/2000/svg"
												fill="none"
												viewBox="0 0 24 24"
												stroke="currentColor"
											>
												<path
													stroke-linecap="round"
													stroke-linejoin="round"
													stroke-width="2"
													d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
												/>
											</svg>
										</div>
										<div>
											<p class="text-sm font-medium text-gray-900 dark:text-white">
												New expense report approved
											</p>
											<p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
												Your expense report for March has been approved.
											</p>
											<p class="mt-1 text-xs text-gray-400 dark:text-gray-500">5 min ago</p>
										</div>
									</div>

									<div
										class="flex items-start space-x-3 rounded-md p-3 hover:bg-gray-50 dark:hover:bg-gray-700"
									>
										<div
											class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-red-100 dark:bg-red-900"
										>
											<svg
												class="h-5 w-5 text-red-600 dark:text-red-200"
												xmlns="http://www.w3.org/2000/svg"
												fill="none"
												viewBox="0 0 24 24"
												stroke="currentColor"
											>
												<path
													stroke-linecap="round"
													stroke-linejoin="round"
													stroke-width="2"
													d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
												/>
											</svg>
										</div>
										<div>
											<p class="text-sm font-medium text-gray-900 dark:text-white">
												Expense submission deadline reminder
											</p>
											<p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
												Remember to submit your expenses by the end of the month.
											</p>
											<p class="mt-1 text-xs text-gray-400 dark:text-gray-500">2 hours ago</p>
										</div>
									</div>
								</div>

								<a
									href="/notifications"
									class="text-primary hover:text-primary-dark dark:text-primary-400 dark:hover:text-primary-300 mt-4 block text-center text-sm font-medium"
								>
									View all notifications
								</a>
							</div>
						</div>
					{/if}
				</div>

				<!-- Create New Button -->
				<a
					href="/expenses/new"
					class="bg-primary hover:bg-primary-dark focus:ring-primary dark:bg-primary-600 dark:hover:bg-primary-700 hidden rounded-md px-4 py-2 text-sm font-medium text-white transition-colors duration-200 focus:ring-2 focus:ring-offset-2 focus:outline-none sm:inline-flex"
				>
					<svg
						class="mr-2 -ml-1 h-5 w-5"
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M12 6v6m0 0v6m0-6h6m-6 0H6"
						/>
					</svg>
					New Expense
				</a>

				<!-- User Profile Menu -->
				<div class="relative">
					<button
						type="button"
						class="focus:ring-primary flex items-center rounded-full focus:ring-2 focus:ring-offset-2 focus:outline-none"
						on:click={toggleProfileMenu}
						aria-expanded={isProfileMenuOpen}
					>
						<span class="sr-only">Open user menu</span>
						<div
							class="h-8 w-8 overflow-hidden rounded-full border-2 border-gray-200 dark:border-gray-600"
						>
							{#if $user?.profile_image}
								<img src={$user.profile_image} alt="Profile" class="h-full w-full object-cover" />
							{:else}
								<!-- Fallback Avatar -->
								<div class="bg-primary flex h-full w-full items-center justify-center text-white">
									{$user?.first_name?.charAt(0) || $user?.username?.charAt(0) || 'U'}
								</div>
							{/if}
						</div>
					</button>

					{#if isProfileMenuOpen}
						<div
							class="ring-opacity-5 absolute right-0 mt-2 w-48 origin-top-right rounded-md bg-white py-2 shadow-lg ring-1 ring-black focus:outline-none dark:bg-gray-800 dark:ring-gray-700"
							use:clickOutside={() => (isProfileMenuOpen = false)}
							transition:slide={{ duration: 200 }}
						>
							<div class="border-b border-gray-200 px-4 py-2 dark:border-gray-700">
								<p class="text-sm font-medium text-gray-900 dark:text-white">
									{$user?.first_name}
									{$user?.last_name}
								</p>
								<p class="truncate text-xs text-gray-500 dark:text-gray-400">{$user?.email}</p>
							</div>

							<a
								href="/auth/profile"
								class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
							>
								Your Profile
							</a>
							<a
								href="/settings"
								class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
							>
								Settings
							</a>
							<button
								type="button"
								class="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
								on:click={handleLogout}
							>
								Sign out
							</button>
						</div>
					{/if}
				</div>
			</div>
		</div>
	</div>

	<!-- Mobile Search (hidden by default) -->
	<div class="hidden border-t border-gray-200 p-4 lg:hidden dark:border-gray-700">
		<form on:submit={handleSearch} class="w-full">
			<div class="relative w-full">
				<div class="absolute inset-y-0 left-0 flex items-center pl-3">
					<svg
						class="h-5 w-5 text-gray-400"
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
						/>
					</svg>
				</div>
				<input
					type="text"
					bind:value={searchQuery}
					placeholder="Search..."
					class="w-full rounded-md border border-gray-300 py-2 pr-4 pl-10 text-gray-700 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200"
				/>
			</div>
		</form>
	</div>
</div>

<style>
	/* Add hover effect animations */
	button:hover,
	a:hover {
		transform: translateY(-1px);
		transition: transform 0.2s ease;
	}

	/* Subtle pulse animation for notification indicator */
	.absolute.top-1.right-1 {
		animation: pulse 2s infinite;
	}

	@keyframes pulse {
		0% {
			transform: scale(0.95);
			box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7);
		}

		70% {
			transform: scale(1);
			box-shadow: 0 0 0 5px rgba(239, 68, 68, 0);
		}

		100% {
			transform: scale(0.95);
			box-shadow: 0 0 0 0 rgba(239, 68, 68, 0);
		}
	}
</style>
