<script lang="ts">
	import { onMount } from 'svelte';
	import { authService } from '$lib/services/auth.service';
	import { user, authError, authStore } from '$lib/stores/auth';
	import Button from '$lib/components/ui/Button.svelte';
	import Input from '$lib/components/ui/Input.svelte';
	import Alert from '$lib/components/ui/Alert.svelte';
	import Avatar from '$lib/components/ui/Avatar.svelte';
	import type { User } from '$lib/types/auth.types';

	let profileData: Partial<User> = {
		first_name: $user?.first_name || '',
		last_name: $user?.last_name || '',
		phone_number: $user?.phone_number || '',
		bio: $user?.bio || ''
	};

	let loading = false;
	let success = false;
	let errors: Record<string, string> = {};

	onMount(async () => {
		// Get fresh user data from API
		await authService.getUserProfile();
	});

	async function handleSubmit() {
		// Reset state
		errors = {};
		success = false;

		loading = true;

		try {
			const updated = await authService.updateProfile(profileData);

			if (updated) {
				success = true;
				// Clear success message after 3 seconds
				setTimeout(() => {
					success = false;
				}, 3000);
			}
		} finally {
			loading = false;
		}
	}
</script>

<div class="mx-auto max-w-3xl rounded-lg bg-white p-8 shadow-md">
	<h1 class="mb-6 text-2xl font-bold">Your Profile</h1>

	<!-- Success Message -->
	{#if success}
		<Alert type="success" class="mb-4">Profile updated successfully!</Alert>
	{/if}

	<!-- Error Alert -->
	{#if $authError}
		<Alert type="error" dismissible={true} on:dismiss={() => authStore.clearError()} class="mb-4">
			{$authError}
		</Alert>
	{/if}

	<div class="flex flex-col gap-8 md:flex-row">
		<!-- Profile Image Section -->
		<div class="flex w-full flex-col items-center md:w-1/3">
			<Avatar
				src={$user?.profile_image}
				name={`${$user?.first_name} ${$user?.last_name}`}
				size="xl"
			/>

			<div class="mt-4">
				<h2 class="text-xl font-medium">{$user?.username}</h2>
				<p class="text-gray-600">{$user?.email}</p>
				<p class="mt-1 text-sm text-gray-500">
					Joined: {new Date($user?.date_joined || '').toLocaleDateString()}
				</p>
			</div>

			<div class="mt-4 w-full">
				<p class="mb-1 text-sm font-medium">Account Type</p>
				<div class="rounded-md bg-gray-100 px-4 py-2 text-center">
					{$user?.user_type?.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
				</div>

				{#if $user?.role}
					<p class="mt-4 mb-1 text-sm font-medium">Role</p>
					<div class="rounded-md bg-gray-100 px-4 py-2 text-center">
						{$user.role.name}
					</div>
				{/if}
			</div>
		</div>

		<!-- Profile Form -->
		<div class="w-full md:w-2/3">
			<form on:submit|preventDefault={handleSubmit} class="space-y-4">
				<!-- Name Row -->
				<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
					<Input
						type="text"
						label="First Name"
						bind:value={profileData.first_name}
						placeholder="John"
						error={errors.first_name}
						disabled={loading}
					/>

					<Input
						type="text"
						label="Last Name"
						bind:value={profileData.last_name}
						placeholder="Doe"
						error={errors.last_name}
						disabled={loading}
					/>
				</div>

				<!-- Phone -->
				<Input
					type="tel"
					label="Phone Number"
					bind:value={profileData.phone_number}
					placeholder="+1234567890"
					error={errors.phone_number}
					disabled={loading}
				/>

				<!-- Bio -->
				<div>
					<label for="bio" class="mb-1 block text-sm font-medium text-gray-700">Bio</label>
					<textarea
						id="bio"
						bind:value={profileData.bio}
						rows="4"
						class="focus:ring-primary focus:border-primary w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:outline-none"
						placeholder="Tell us about yourself"
						disabled={loading}
					></textarea>
				</div>

				<!-- Submit Button -->
				<div class="flex justify-end">
					<Button type="submit" variant="primary" {loading} disabled={loading}>Save Changes</Button>
				</div>
			</form>
		</div>
	</div>
</div>
