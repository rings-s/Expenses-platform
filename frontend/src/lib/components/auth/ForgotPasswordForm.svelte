<script>
	import { createEventDispatcher } from 'svelte';
	import authService from '$lib/services/authService';
	import FormField from '$lib/components/ui/FormField.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Alert from '$lib/components/ui/Alert.svelte';
	import { isValidEmail } from '$lib/utils/validation';

	let email = '';
	let error = '';
	let successMessage = '';
	let isSubmitting = false;

	const dispatch = createEventDispatcher();

	async function handleSubmit() {
		if (!email) {
			error = 'Please enter your email address';
			return;
		}

		if (!isValidEmail(email)) {
			error = 'Please enter a valid email address';
			return;
		}

		error = '';
		isSubmitting = true;

		try {
			await authService.requestPasswordReset(email);

			successMessage = 'Password reset instructions have been sent to your email address.';

			// Dispatch success event with email
			dispatch('success', { email });
		} catch (err) {
			// For security reasons, we still show success even if the email doesn't exist
			successMessage =
				'If an account exists with this email, password reset instructions have been sent.';

			// Also dispatch success to proceed to reset page (for the same security reason)
			dispatch('success', { email });
		} finally {
			isSubmitting = false;
		}
	}
</script>

<form on:submit|preventDefault={handleSubmit} class="space-y-6">
	{#if error}
		<Alert type="error">{error}</Alert>
	{/if}

	{#if successMessage}
		<Alert type="success">{successMessage}</Alert>
	{/if}

	<FormField label="Email Address" type="email" name="email" bind:value={email} required={true} />

	<div>
		<Button type="submit" variant="primary" fullWidth={true} loading={isSubmitting}>
			Send Reset Code
		</Button>
	</div>
</form>

<div class="mt-6 text-center">
	<p class="text-sm text-gray-600">
		<a href="/login" class="font-medium text-blue-600 hover:text-blue-500"> Back to login </a>
	</p>
</div>
