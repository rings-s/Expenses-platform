<script>
	import { authStore } from '$lib/stores/authStore';
	import { userStore } from '$lib/stores/userStore';
	import { goto } from '$app/navigation';

	let isUserMenuOpen = false;

	function toggleUserMenu() {
		isUserMenuOpen = !isUserMenuOpen;
	}

	async function handleLogout() {
		await authStore.logout();
		goto('/login');
	}
</script>

{#if $authStore.isAuthenticated && $userStore.profile}
	<div class="relative">
		<button
			type="button"
			on:click={toggleUserMenu}
			class="flex items-center focus:outline-none"
			id="user-menu-button"
		>
			<span class="sr-only">Open user menu</span>
			{#if $userStore.profile?.profile_image}
				<img class="h-8 w-8 rounded-full" src={$userStore.profile.profile_image} alt="Profile" />
			{:else}
				<div
					class="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 font-semibold text-blue-800"
				>
					{$userStore.profile?.first_name?.charAt(0) ||
						$userStore.profile?.username?.charAt(0) ||
						'U'}
				</div>
			{/if}
			<span class="ml-2 hidden text-sm text-gray-700 md:block">
				{$userStore.profile?.first_name || $userStore.profile?.username || 'User'}
			</span>
		</button>

		{#if isUserMenuOpen}
			<div
				class="ring-opacity-5 absolute right-0 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black focus:outline-none"
				role="menu"
			>
				<a
					href="/profile"
					class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
					role="menuitem"
				>
					Your Profile
				</a>
				<a
					href="/settings"
					class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
					role="menuitem"
				>
					Settings
				</a>
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
{:else}
	<div class="flex space-x-4">
		<a
			href="/login"
			class="rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900"
		>
			Sign in
		</a>
		<a
			href="/register"
			class="rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
		>
			Sign up
		</a>
	</div>
{/if}
