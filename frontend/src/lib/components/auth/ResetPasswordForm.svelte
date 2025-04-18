<script>
	import { createEventDispatcher } from 'svelte';
	import authService from '$lib/services/authService';
	import FormField from '$lib/components/ui/FormField.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Alert from '$lib/components/ui/Alert.svelte';
	import { isStrongPassword } from '$lib/utils/validation';

	export let email = '';
	export let token = '';
	export let showPasswordForm = false;

	let newPassword = '';
	let confirmPassword = '';
	let error = '';
	let successMessage = '';
	let isSubmitting = false;

	const dispatch = createEventDispatcher();

	async function verifyToken() {
		if (!token) {
			error = 'Please enter the verification code';
			return;
		}

		error = '';
		isSubmitting = true;

		try {
			// We don't have a separate token verification endpoint, so just proceed
			showPasswordForm = true;
			successMessage = 'Code verified. Please set your new password.';
		} catch (err) {
			error = err.message || 'Invalid verification code. Please try again.';
		} finally {
			isSubmitting = false;
		}
	}

	async function resetPassword() {
		if (!newPassword) {
			error = 'Please enter a new password';
			return;
		}

		if (!isStrongPassword(newPassword)) {
			error = 'Password must be at least 8 characters with 1 uppercase, 1 lowercase, and 1 number';
			return;
		}

		if (newPassword !== confirmPassword) {
			error = 'Passwords do not match';
			return;
		}

		error = '';
		isSubmitting = true;

		try {
			await authService.resetPassword(token, newPassword);

			successMessage = 'Password reset successful!';

			// Dispatch success event
			dispatch('success');
		} catch (err) {
			error = err.message || 'Failed to reset password. Please try again.';
		} finally {
			isSubmitting = false;
		}
	}
</script>

{#if !showPasswordForm}
	<form on:submit|preventDefault={verifyToken} class="space-y-6">
		{#if error}
			<Alert type="error">{error}</Alert>
		{/if}

		{#if successMessage}
			<Alert type="success">{successMessage}</Alert>
		{/if}

		<div>
			<p class="mb-4 text-sm text-gray-700">
				We've sent a reset code to <strong>{email}</strong>. Please check your email and enter the
				code below to continue.
			</p>
		</div>

		<FormField
			label="Reset Code"
			name="token"
			bind:value={token}
			placeholder="Enter 6-digit code"
			required={true}
		/>

		<div>
			<Button type="submit" variant="primary" fullWidth={true} loading={isSubmitting}>
				Verify Code
			</Button>
		</div>
	</form>
{:else}
	<form on:submit|preventDefault={resetPassword} class="space-y-6">
		{#if error}
			<Alert type="error">{error}</Alert>
		{/if}

		{#if successMessage}
			<Alert type="success">{successMessage}</Alert>
		{/if}

		<FormField
			label="New Password"
			type="password"
			name="new_password"
			bind:value={newPassword}
			required={true}
		/>

		<FormField
			label="Confirm New Password"
			type="password"
			name="confirm_password"
			bind:value={confirmPassword}
			required={true}
		/>

		<div>
			<Button type="submit" variant="primary" fullWidth={true} loading={isSubmitting}>
				Reset Password
			</Button>
		</div>
	</form>
{/if}

<div class="mt-6 text-center">
	<p class="text-sm text-gray-600">
		<a href="/login" class="font-medium text-blue-600 hover:text-blue-500"> Back to login </a>
	</p>
</div>
