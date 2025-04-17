<script lang="ts">
	import { createEventDispatcher, onMount } from 'svelte';
	import { slide, fade } from 'svelte/transition';
	import { user } from '$lib/stores/auth';
	import { page } from '$app/stores';

	// Props with Svelte 5 runes
	const { isOpen = false, isMobile = false } = $props();

	// State with runes
	let activeSection = $state('');
	let expandedMenus = $state<Record<string, boolean>>({});

	// Event dispatcher
	const dispatch = createEventDispatcher();

	// Menu sections
	const menuSections = [
		{
			id: 'dashboard',
			icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
			label: 'Dashboard',
			path: '/dashboard',
			requiredRoles: []
		},
		{
			id: 'expenses',
			icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
			label: 'Expenses',
			path: '/expenses',
			requiredRoles: [],
			submenu: [
				{ label: 'All Expenses', path: '/expenses' },
				{ label: 'Add New', path: '/expenses/new' },
				{ label: 'Categories', path: '/expenses/categories' }
			]
		},
		{
			id: 'reports',
			icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
			label: 'Reports',
			path: '/reports',
			requiredRoles: ['admin', 'manager'],
			submenu: [
				{ label: 'Monthly Summary', path: '/reports/monthly' },
				{ label: 'Category Analysis', path: '/reports/categories' },
				{ label: 'User Spending', path: '/reports/users' },
				{ label: 'Export', path: '/reports/export' }
			]
		},
		{
			id: 'users',
			icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z',
			label: 'Users',
			path: '/users',
			requiredRoles: ['admin']
		},
		{
			id: 'settings',
			icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z',
			label: 'Settings',
			path: '/settings',
			requiredRoles: ['admin']
		}
	];

	// Toggle submenu visibility
	function toggleSubmenu(sectionId: string) {
		expandedMenus[sectionId] = !expandedMenus[sectionId];
		expandedMenus = { ...expandedMenus };
	}

	// Close sidebar on mobile
	function handleNavigate() {
		if (isMobile) {
			dispatch('close');
		}
	}

	// Update active section based on current path
	$effect(() => {
		// Add null check to prevent errors when $page.url is undefined
		if (!$page || !$page.url) return;

		const path = $page.url.pathname;
		activeSection =
			menuSections.find((section) => path === section.path || path.startsWith(section.path + '/'))
				?.id || '';

		// Auto expand parent menu when on child page
		menuSections.forEach((section) => {
			if (section.submenu && path.startsWith(section.path + '/')) {
				expandedMenus[section.id] = true;
			}
		});
	});

	// Filter menu items based on user role
	const visibleMenuSections = $derived(
		menuSections.filter((section) => {
			if (!section.requiredRoles || section.requiredRoles.length === 0) {
				return true;
			}
			return section.requiredRoles.includes($user?.user_type || '');
		})
	);

	// Get a CSS class based on whether a menu item is active
	function getItemClass(path: string, isSubmenu = false) {
		const isActive = $page.url.pathname === path || $page.url.pathname.startsWith(path + '/');

		const baseClass = isSubmenu
			? 'pl-10 pr-4 py-2 text-sm rounded-md flex items-center'
			: 'px-4 py-2 rounded-md flex items-center';

		if (isActive) {
			return `${baseClass} text-white bg-primary dark:bg-primary-600`;
		}

		return `${baseClass} text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800`;
	}

	onMount(() => {
		// Initialize expanded menus based on current path
		const path = $page.url.pathname;
		menuSections.forEach((section) => {
			if (section.submenu && path.startsWith(section.path + '/')) {
				expandedMenus[section.id] = true;
			}
		});
	});
</script>

{#if isOpen}
	<aside
		class="sidebar fixed top-16 bottom-0 left-0 z-20 w-64 overflow-y-auto border-r border-gray-200 bg-white transition-all duration-300 dark:border-gray-800 dark:bg-gray-900"
		transition:slide={{ duration: 300, axis: 'x' }}
	>
		<nav class="px-3 py-4">
			<div class="space-y-1">
				<!-- Menu Items -->
				{#each visibleMenuSections as section}
					{#if section.submenu}
						<!-- Section with Submenu -->
						<div class="mb-2">
							<button
								on:click={() => toggleSubmenu(section.id)}
								class={`w-full ${getItemClass(section.path)} group justify-between transition-colors duration-200`}
								aria-expanded={expandedMenus[section.id] || false}
							>
								<div class="flex items-center">
									<svg
										xmlns="http://www.w3.org/2000/svg"
										class="mr-3 h-5 w-5"
										fill="none"
										viewBox="0 0 24 24"
										stroke="currentColor"
									>
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d={section.icon}
										/>
									</svg>
									<span>{section.label}</span>
								</div>

								<!-- Chevron Icon -->
								<svg
									xmlns="http://www.w3.org/2000/svg"
									class={`h-4 w-4 transition-transform duration-200 ${expandedMenus[section.id] ? 'rotate-180 transform' : ''}`}
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M19 9l-7 7-7-7"
									/>
								</svg>
							</button>

							<!-- Submenu -->
							{#if expandedMenus[section.id]}
								<div
									class="mt-1 ml-2 space-y-1 border-l border-gray-200 dark:border-gray-700"
									transition:slide={{ duration: 200 }}
								>
									{#each section.submenu as item}
										<a
											href={item.path}
											class={getItemClass(item.path, true)}
											on:click={handleNavigate}
										>
											<span class="relative -left-0.5 mr-2 h-0.5 w-2 rounded-full bg-current"
											></span>
											{item.label}
										</a>
									{/each}
								</div>
							{/if}
						</div>
					{:else}
						<!-- Regular Menu Item -->
						<a href={section.path} class={getItemClass(section.path)} on:click={handleNavigate}>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								class="mr-3 h-5 w-5"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d={section.icon}
								/>
							</svg>
							{section.label}
						</a>
					{/if}
				{/each}
			</div>

			<!-- User Section -->
			<div class="mt-8 border-t border-gray-200 pt-6 dark:border-gray-700">
				<a
					href="/auth/profile"
					class="flex items-center rounded-md px-4 py-3 text-gray-700 transition-colors duration-200 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
					on:click={handleNavigate}
				>
					<div class="mr-3 h-8 w-8 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
						{#if $user?.profile_image}
							<img src={$user.profile_image} alt="Profile" class="h-full w-full object-cover" />
						{:else}
							<!-- Fallback Avatar -->
							<div
								class="bg-primary flex h-full w-full items-center justify-center text-sm font-medium text-white"
							>
								{$user?.first_name?.charAt(0) || $user?.username?.charAt(0) || 'U'}
							</div>
						{/if}
					</div>
					<div class="overflow-hidden">
						<p class="truncate text-sm font-medium">
							{$user?.first_name || ''}
							{$user?.last_name || ''}
						</p>
						<p class="truncate text-xs text-gray-500 dark:text-gray-400">
							{$user?.email || ''}
						</p>
					</div>
				</a>
			</div>
		</nav>
	</aside>

	<!-- Overlay for mobile when sidebar is open -->
	{#if isMobile}
		<div
			class="bg-opacity-50 fixed inset-0 z-10 bg-gray-900"
			on:click={() => dispatch('close')}
			transition:fade={{ duration: 200 }}
		></div>
	{/if}
{/if}

<style>
	.sidebar {
		/* Add smooth scrollbar */
		scrollbar-width: thin;
		scrollbar-color: rgba(156, 163, 175, 0.5) transparent;
	}

	.sidebar::-webkit-scrollbar {
		width: 5px;
	}

	.sidebar::-webkit-scrollbar-track {
		background: transparent;
	}

	.sidebar::-webkit-scrollbar-thumb {
		background-color: rgba(156, 163, 175, 0.5);
		border-radius: 20px;
	}

	/* Add hover animation */
	a,
	button {
		transition: all 0.2s ease-in-out;
	}

	a:hover,
	button:hover {
		transform: translateX(2px);
	}
</style>
