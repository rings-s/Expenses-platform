<script lang="ts">
	import { onMount, createEventDispatcher } from 'svelte';
	import { authService } from '$lib/services/auth_services';
	import { authStore, authError, user } from '$lib/stores/auth';
	import Button from '$lib/components/ui/Button.svelte';
	import Input from '$lib/components/ui/Input.svelte';
	import Select from '$lib/components/ui/Select.svelte';
	import Textarea from '$lib/components/ui/Textarea.svelte';
	import Alert from '$lib/components/ui/Alert.svelte';
	import type { ProfileUpdateData, User } from '$lib/types/auth.types';

	export let allowTypeUpdate = false; // Only admins should be able to update user types

	let profileData: ProfileUpdateData = {
		username: $user?.username || '',
		first_name: $user?.first_name || '',
		last_name: $user?.last_name || '',
		phone_number: $user?.phone_number || '',
		bio: $user?.bio || '',
		user_type: $user?.user_type || 'regular'
	};

	let loading = false;
	let saveSuccess = false;
	let errors: Record<string, string> = {};

	const dispatch = createEventDispatcher();

	onMount(async () => {
		// Refresh user profile data
		try {
			const userData = await authService.getUserProfile();
			if (userData) {
				profileData = {
					username: userData.username || '',
					first_name: userData.first_name || '',
					last_name: userData.last_name || '',
					phone_number: userData.phone_number || '',
					bio: userData.bio || '',
					user_type: userData.user_type || 'regular'
				};
			}
		} catch (error) {
			console.error('Error fetching user profile:', error);
		}
	});

	function validateForm(): boolean {
		errors = {};

		// Username validation
		if (!profileData.username) {
			errors.username = 'Username is required';
		} else if (profileData.username.length < 3) {
			errors.username = 'Username must be at least 3 characters long';
		} else if (!/^[a-zA-Z0-9_]+$/.test(profileData.username)) {
			errors.username = 'Username can only contain letters, numbers, and underscores';
		}

		// Basic name validation (optional fields)
		if (profileData.first_name && profileData.first_name.length > 30) {
			errors.first_name = 'First name is too long (maximum 30 characters)';
		}

		if (profileData.last_name && profileData.last_name.length > 30) {
			errors.last_name = 'Last name is too long (maximum 30 characters)';
		}

		// Phone number validation (optional field)
		if (profileData.phone_number && !/^\+?[0-9\s\-()]{7,15}$/.test(profileData.phone_number)) {
			errors.phone_number = 'Please enter a valid phone number';
		}

		return Object.keys(errors).length === 0;
	}

	async function handleSubmit() {
		if (!validateForm()) {
			return;
		}

		loading = true;
		saveSuccess = false;
		authStore.clearError();

		try {
			const success = await authService.updateProfile(profileData);

			if (success) {
				saveSuccess = true;
				dispatch('success', { user: $user });

				// Hide success message after 3 seconds
				setTimeout(() => {
					saveSuccess = false;
				}, 3000);
			}
		} catch (error) {
			console.error('Error updating profile:', error);
		} finally {
			loading = false;
		}
	}

	// User type options
	const userTypeOptions = [
		{ value: 'regular', label: 'Regular User' },
		{ value: 'manager', label: 'Manager' },
		{ value: 'admin', label: 'Administrator' }
	];
</script>

<form on:submit|preventDefault={handleSubmit} class="space-y-6">
	<!-- Alerts -->
	{#if $authError}
		<Alert type="error" dismissible={true} on:dismiss={() => authStore.clearError()}>
			{$authError}
		</Alert>
	{/if}

	{#if saveSuccess}
		<Alert type="success" dismissible={true}>Profile updated successfully</Alert>
	{/if}

	<!-- Username -->
	<Input
		type="text"
		label="Username"
		bind:value={profileData.username}
		error={errors.username}
		disabled={loading}
		required
	/>

	<!-- Name Row -->
	<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
		<Input
			type="text"
			label="First Name"
			bind:value={profileData.first_name}
			error={errors.first_name}
			disabled={loading}
		/>

		<Input
			type="text"
			label="Last Name"
			bind:value={profileData.last_name}
			error={errors.last_name}
			disabled={loading}
		/>
	</div>

	<!-- Phone Number -->
	<Input
		type="tel"
		label="Phone Number"
		bind:value={profileData.phone_number}
		error={errors.phone_number}
		disabled={loading}
	/>

	<!-- Bio -->
	<Textarea
		label="Bio"
		bind:value={profileData.bio}
		error={errors.bio}
		disabled={loading}
		rows={4}
	/>

	<!-- Admin Only Fields -->
	{#if allowTypeUpdate}
		<div>
			<Select
				label="User Type"
				bind:value={profileData.user_type}
				options={userTypeOptions}
				error={errors.user_type}
				disabled={loading}
			/>
		</div>
	{/if}

	<!-- Email (Read-only) -->
	<Input
		type="email"
		label="Email"
		value={$user?.email || ''}
		disabled={true}
		helpText="Email cannot be changed. Contact an administrator if you need to update your email."
	/>

	<!-- Email Verification Status -->
	{#if $user && !$user.email_verified}
		<Alert type="warning">
			<div class="flex items-center justify-between">
				<span>Your email is not verified. Please check your inbox for a verification link.</span>
				<Button
					variant="secondary"
					size="sm"
					on:click={() => authService.requestVerificationEmail($user?.email || '')}
				>
					Resend
				</Button>
			</div>
		</Alert>
	{/if}

	<!-- Submit Button -->
	<div class="flex justify-end">
		<Button type="submit" variant="primary" {loading} disabled={loading}>Save Changes</Button>
	</div>
</form>
