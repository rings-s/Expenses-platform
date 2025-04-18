<script>
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { authStore } from '$lib/stores/authStore';
	import { userStore } from '$lib/stores/userStore';
	import Logo from '$lib/components/ui/Logo.svelte';

	export let title = 'Dashboard';

	let isMenuOpen = false;
	let isMobileMenuOpen = false;
	let isUserMenuOpen = false;

	// Navigation items
	const navigation = [
		{ name: 'Dashboard', href: '/dashboard', icon: 'chart-bar' },
		{ name: 'Expenses', href: '/expenses', icon: 'receipt-tax' },
		{ name: 'Categories', href: '/categories', icon: 'tag' },
		{ name: 'Budgets', href: '/budgets', icon: 'currency-dollar' },
		{ name: 'Reports', href: '/reports', icon: 'document-report' }
	];

	// User menu items
	const userNavigation = [
		{ name: 'Your Profile', href: '/profile' },
		{ name: 'Settings', href: '/settings' }
	];

	function isActivePath(path) {
		return $page.url.pathname === path || $page.url.pathname.startsWith(`${path}/`);
	}

	async function handleLogout() {
		await authStore.logout();
		goto('/login');
	}

	function toggleMenu() {
		isMenuOpen = !isMenuOpen;
	}

	function toggleMobileMenu() {
		isMobileMenuOpen = !isMobileMenuOpen;
	}

	function toggleUserMenu() {
		isUserMenuOpen = !isUserMenuOpen;
	}

	onMount(() => {
		// Load user profile if not already loaded
		if (!$userStore.profile) {
			userStore.loadProfile();
		}
	});

	// Icons mapping
	const icons = {
		'chart-bar': `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
      <path stroke-linecap="round" stroke-linejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
    </svg>`,
		'receipt-tax': `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
      <path stroke-linecap="round" stroke-linejoin="round" d="M9 14.25l6-6m4.5-3.493V21.75l-3.75-1.5-3.75 1.5-3.75-1.5-3.75 1.5V4.757c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0c1.1.128 1.907 1.077 1.907 2.185ZM9.75 9h.008v.008H9.75V9Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm4.125 4.5h.008v.008h-.008V13.5Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
    </svg>`,
		tag: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
      <path stroke-linecap="round" stroke-linejoin="round" d="M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 0 0 5.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 0 0 9.568 3Z" />
      <path stroke-linecap="round" stroke-linejoin="round" d="M6 6h.008v.008H6V6Z" />
    </svg>`,
		'currency-dollar': `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
      <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>`,
		'document-report': `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
      <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m6.75 12H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
    </svg>`
	};
</script>

<div class="min-h-screen bg-gray-100">
	<!-- Sidebar for desktop -->
	<div class="hidden md:fixed md:inset-y-0 md:flex md:w-64 md:flex-col">
		<div class="flex min-h-0 flex-1 flex-col bg-blue-700">
			<div class="flex flex-1 flex-col overflow-y-auto pt-5 pb-4">
				<div class="flex flex-shrink-0 items-center px-4">
					<div class="text-white">
						<Logo size="md" />
					</div>
				</div>
				<nav class="mt-5 flex-1 space-y-1 px-2">
					{#each navigation as item}
						<a
							href={item.href}
							class="group flex items-center rounded-md px-2 py-2 text-sm font-medium {isActivePath(
								item.href
							)
								? 'bg-blue-800 text-white'
								: 'text-blue-100 hover:bg-blue-600'}"
						>
							<span class="mr-3 h-6 w-6 flex-shrink-0" aria-hidden="true">
								{@html icons[item.icon]}
							</span>
							{item.name}
						</a>
					{/each}
				</nav>
			</div>

			<!-- User profile in sidebar -->
			<div class="flex flex-shrink-0 border-t border-blue-800 p-4">
				<button on:click={toggleUserMenu} class="group block w-full flex-shrink-0">
					<div class="flex items-center">
						<div>
							{#if $userStore.profile?.profile_image}
								<img
									class="inline-block h-9 w-9 rounded-full"
									src={$userStore.profile.profile_image}
									alt="Profile"
								/>
							{:else}
								<div
									class="flex h-9 w-9 items-center justify-center rounded-full bg-blue-200 font-semibold text-blue-800"
								>
									{$userStore.profile?.first_name?.charAt(0) ||
										$userStore.profile?.username?.charAt(0) ||
										'U'}
								</div>
							{/if}
						</div>
						<div class="ml-3">
							<p class="text-sm font-medium text-white">
								{$userStore.profile?.first_name || $userStore.profile?.username || 'User'}
							</p>
							<p class="text-xs font-medium text-blue-200 group-hover:text-white">
								{$userStore.profile?.email || 'user@example.com'}
							</p>
						</div>
					</div>
				</button>

				<!-- User dropdown menu -->
				{#if isUserMenuOpen}
					<div
						class="ring-opacity-5 absolute bottom-12 left-20 w-48 rounded-md bg-white py-1 shadow-lg ring-1 ring-black focus:outline-none"
					>
						{#each userNavigation as item}
							<a href={item.href} class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
								{item.name}
							</a>
						{/each}
						<button
							on:click={handleLogout}
							class="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
						>
							Sign out
						</button>
					</div>
				{/if}
			</div>
		</div>
	</div>

	<!-- Mobile header -->
	<div class="sticky top-0 z-10 flex h-16 flex-shrink-0 bg-white shadow md:hidden">
		<button
			type="button"
			on:click={toggleMobileMenu}
			class="border-r border-gray-200 px-4 text-gray-500 focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-inset md:hidden"
		>
			<span class="sr-only">Open sidebar</span>
			<!-- Hamburger icon -->
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

		<div class="flex flex-1 justify-between px-4">
			<div class="flex flex-1 items-center">
				<span class="text-xl font-semibold text-gray-800">{title}</span>
			</div>
			<div class="ml-4 flex items-center md:ml-6">
				<!-- Profile dropdown -->
				<div class="relative ml-3">
					<div>
						<button
							type="button"
							on:click={toggleUserMenu}
							class="flex max-w-xs items-center rounded-full bg-white text-sm focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none"
							id="user-menu-button"
						>
							<span class="sr-only">Open user menu</span>
							{#if $userStore.profile?.profile_image}
								<img
									class="h-8 w-8 rounded-full"
									src={$userStore.profile.profile_image}
									alt="Profile"
								/>
							{:else}
								<div
									class="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 font-semibold text-blue-800"
								>
									{$userStore.profile?.first_name?.charAt(0) ||
										$userStore.profile?.username?.charAt(0) ||
										'U'}
								</div>
							{/if}
						</button>
					</div>

					{#if isUserMenuOpen}
						<div
							class="ring-opacity-5 absolute right-0 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black focus:outline-none"
							role="menu"
							aria-orientation="vertical"
							aria-labelledby="user-menu-button"
							tabindex="-1"
						>
							{#each userNavigation as item}
								<a
									href={item.href}
									class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
									role="menuitem"
								>
									{item.name}
								</a>
							{/each}
							<button
								type="button"
								on:click={handleLogout}
								class="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
								role="menuitem"
							>
								Sign out
							</button>
						</div>
					{/if}
				</div>
			</div>
		</div>
	</div>

	<!-- Mobile menu, show/hide based on menu state -->
	{#if isMobileMenuOpen}
		<div class="absolute inset-0 z-20 flex flex-col bg-white shadow-lg md:hidden">
			<div class="flex items-center justify-between p-4">
				<Logo size="md" />
				<button
					type="button"
					on:click={toggleMobileMenu}
					class="text-gray-500 focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-inset"
				>
					<span class="sr-only">Close sidebar</span>
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
				</button>
			</div>

			<div class="h-0 flex-1 overflow-y-auto">
				<nav class="space-y-1 px-2">
					{#each navigation as item}
						<a
							href={item.href}
							on:click={toggleMobileMenu}
							class="group flex items-center rounded-md px-2 py-2 text-base font-medium {isActivePath(
								item.href
							)
								? 'bg-blue-100 text-blue-900'
								: 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}"
						>
							<span
								class="mr-4 h-6 w-6 flex-shrink-0 {isActivePath(item.href)
									? 'text-blue-500'
									: 'text-gray-400 group-hover:text-gray-500'}"
								aria-hidden="true"
							>
								{@html icons[item.icon]}
							</span>
							{item.name}
						</a>
					{/each}
				</nav>
			</div>

			<div class="flex flex-shrink-0 border-t border-gray-200 p-4">
				<div class="flex items-center">
					<div>
						{#if $userStore.profile?.profile_image}
							<img
								class="inline-block h-10 w-10 rounded-full"
								src={$userStore.profile.profile_image}
								alt="Profile"
							/>
						{:else}
							<div
								class="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 font-semibold text-blue-700"
							>
								{$userStore.profile?.first_name?.charAt(0) ||
									$userStore.profile?.username?.charAt(0) ||
									'U'}
							</div>
						{/if}
					</div>
					<div class="ml-3">
						<p class="text-base font-medium text-gray-700">
							{$userStore.profile?.first_name || $userStore.profile?.username || 'User'}
						</p>
						<p class="text-sm font-medium text-gray-500">
							{$userStore.profile?.email || 'user@example.com'}
						</p>
					</div>
				</div>
			</div>
		</div>
	{/if}

	<!-- Main content -->
	<div class="flex flex-1 flex-col md:pl-64">
		<main>
			<div class="py-6">
				<div class="mx-auto max-w-7xl px-4 sm:px-6 md:px-8">
					<h1 class="hidden text-2xl font-semibold text-gray-900 md:block">{title}</h1>
				</div>
				<div class="mx-auto max-w-7xl px-4 sm:px-6 md:px-8">
					<div class="py-4">
						<slot />
					</div>
				</div>
			</div>
		</main>
	</div>
</div>
