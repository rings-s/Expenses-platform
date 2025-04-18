<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { authService } from '$lib/services/auth_services';
	import { authStore, authError } from '$lib/stores/auth';
	import Button from '$lib/components/ui/Button.svelte';
	import Input from '$lib/components/ui/Input.svelte';
	import Alert from '$lib/components/ui/Alert.svelte';

	let email = $state('');
	let loading = $state(false);
	let success = $state(false);
	let errors = $state<Record<string, string>>({});

	const dispatch = createEventDispatcher();

	// Clear error when email is valid
	function handleInputChange(e) {
		if (email && /^\S+@\S+\.\S+$/.test(email) && errors.email) {
			errors.email = '';
		}
	}

	async function handleSubmit() {
		// Reset state
		errors = {};
		success = false;
		authStore.clearError();

		// Validate email
		if (!email) {
			errors.email = 'Email is required';
			return;
		}

		if (!/^\S+@\S+\.\S+$/.test(email)) {
			errors.email = 'Please enter a valid email address';
			return;
		}

		loading = true;

		try {
			const result = await authService.requestPasswordReset(email);

			if (result) {
				success = true;

				// Store email for the verification page
				if (typeof localStorage !== 'undefined') {
					localStorage.setItem('reset_password_email', email);
				}

				// Direct navigation to reset password page - more reliable than goto()
				console.log("Password reset code sent successfully. Redirecting...");
				setTimeout(() => {
					window.location.href = '/auth/reset-email-password';
				}, 1500);

				dispatch('success', { email });
			}
		} catch (error) {
			console.error('Error requesting password reset:', error);
			authStore.setError('Failed to send reset code. Please try again.');
		} finally {
			loading = false;
		}
	}
</script>

<form on:submit|preventDefault={handleSubmit} class="space-y-6" on:input={handleInputChange}>
	{#if success}
		<Alert type="success">
			<h3 class="text-lg font-medium">Check your email</h3>
			<p>
				We've sent a password reset code to <strong>{email}</strong>. You'll be redirected to enter
				this code to complete the password reset process.
			</p>
		</Alert>
	{:else}
		<!-- Error Alert -->
		{#if $authError}
			<Alert type="error" dismissible={true} on:dismiss={() => authStore.clearError()}>
				{$authError}
			</Alert>
		{/if}

		<div>
			<p class="mb-4 text-gray-600 dark:text-gray-400">
				Enter your email address and we'll send you a code to reset your password.
			</p>

			<Input
				type="email"
				name="email"
				label="Email"
				bind:value={email}
				placeholder="your@email.com"
				error={errors.email}
				disabled={loading}
				required
			/>
		</div>

		<Button type="submit" variant="primary" fullWidth={true} {loading} disabled={loading}>
			Send Reset Code
		</Button>
	{/if}

	<div class="mt-4 text-center">

	   <a
			href="/auth/login"
			class="text-primary hover:text-primary-dark dark:text-primary-400 dark:hover:text-primary-300 text-sm"
		>
			Back to login
		</a>
	</div>
</form>
