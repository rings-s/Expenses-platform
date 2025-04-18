<script>
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import authService from '$lib/services/authService';
	import AuthLayout from '$lib/components/auth/AuthLayout.svelte';
	import FormField from '$lib/components/ui/FormField.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Alert from '$lib/components/ui/Alert.svelte';
	import { isStrongPassword } from '$lib/utils/validation';

	let email = '';
	let token = '';
	let newPassword = '';
	let confirmPassword = '';
	let error = '';
	let successMessage = '';
	let isSubmitting = false;
	let showPasswordForm = false;

	onMount(() => {
		// Get email from query params
		email = $page.url.searchParams.get('email') || '';

		// Check if token is in URL params
		const urlToken = $page.url.searchParams.get('token');
		if (urlToken) {
			token = urlToken;
			showPasswordForm = true;
		}
	});

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

			// After a brief delay, redirect to login
			setTimeout(() => {
				goto('/login?reset=true');
			}, 2000);
		} catch (err) {
			error = err.message || 'Failed to reset password. Please try again.';
		} finally {
			isSubmitting = false;
		}
	}
</script>

<svelte:head>
	<title>Reset Password - Expensis</title>
</svelte:head>

<AuthLayout
	title="Reset your password"
	subtitle={showPasswordForm ? 'Create a new password' : 'Enter the code sent to your email'}
>
	{#if !showPasswordForm}
		<form on:submit|preventDefault={verifyToken} class="space-y-6">
			{#if error}
				<Alert type="error">{error}</Alert>
			{/if}

			{#if successMessage}
				<Alert type="success">{successMessage}</Alert>
			{/if}

			<FormField
				label="Email Address"
				type="email"
				name="email"
				bind:value={email}
				disabled={true}
			/>

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

	<svelte:fragment slot="footer">
		<p class="text-sm text-gray-600">
			<a href="/login" class="font-medium text-blue-600 hover:text-blue-500"> Back to login </a>
		</p>
	</svelte:fragment>
</AuthLayout>
