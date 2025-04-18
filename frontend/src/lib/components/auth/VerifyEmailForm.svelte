<script>
	import { createEventDispatcher } from 'svelte';
	import authService from '$lib/services/authService';
	import FormField from '$lib/components/ui/FormField.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Alert from '$lib/components/ui/Alert.svelte';

	export let email = '';

	let token = '';
	let error = '';
	let successMessage = '';
	let isSubmitting = false;
	let isResending = false;

	const dispatch = createEventDispatcher();

	async function verifyEmail() {
		if (!token) {
			error = 'Please enter the verification code';
			return;
		}

		error = '';
		isSubmitting = true;

		try {
			await authService.verifyEmail(token);

			successMessage = 'Email verified successfully!';

			// Dispatch success event
			dispatch('success');
		} catch (err) {
			error = err.message || 'Invalid verification code. Please try again.';
		} finally {
			isSubmitting = false;
		}
	}

	async function resendVerification() {
		if (!email) {
			error = 'Email address is required';
			return;
		}

		error = '';
		isResending = true;

		try {
			await authService.requestEmailVerification(email);
			successMessage = 'Verification email has been resent to your email address.';
		} catch (err) {
			error = err.message || 'Failed to resend verification email. Please try again.';
		} finally {
			isResending = false;
		}
	}
</script>

<form on:submit|preventDefault={verifyEmail} class="space-y-6">
	{#if error}
		<Alert type="error">{error}</Alert>
	{/if}

	{#if successMessage}
		<Alert type="success">{successMessage}</Alert>
	{/if}

	<div>
		<p class="mb-4 text-sm text-gray-700">
			We've sent a verification code to <strong>{email}</strong>. Please check your email and enter
			the code below to verify your account.
		</p>
	</div>

	<FormField
		label="Verification Code"
		name="token"
		bind:value={token}
		placeholder="Enter 6-digit code"
		required={true}
	/>

	<div>
		<Button type="submit" variant="primary" fullWidth={true} loading={isSubmitting}>
			Verify Email
		</Button>
	</div>

	<div class="text-center">
		<button
			type="button"
			on:click={resendVerification}
			class="text-sm text-blue-600 hover:text-blue-500"
			disabled={isResending}
		>
			{isResending ? 'Sending...' : "Didn't receive a code? Resend"}
		</button>
	</div>
</form>

<div class="mt-6 text-center">
	<p class="text-sm text-gray-600">
		<a href="/login" class="font-medium text-blue-600 hover:text-blue-500"> Back to login </a>
	</p>
</div>
