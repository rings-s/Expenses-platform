<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { authService } from '$lib/services/auth_services';
	import { authStore, authError, user } from '$lib/stores/auth';
	import Button from '$lib/components/ui/Button.svelte';
	import Input from '$lib/components/ui/Input.svelte';
	import Alert from '$lib/components/ui/Alert.svelte';

	export let email = '';

	let verificationCode = '';
	let loading = false;
	let success = false;
	let errors: Record<string, string> = {};

	const dispatch = createEventDispatcher();

	async function handleSubmit() {
		// Reset state
		errors = {};
		authStore.clearError();

		// Validate code
		if (!verificationCode) {
			errors.code = 'Verification code is required';
			return;
		}

		if (verificationCode.length !== 6 || !/^\d+$/.test(verificationCode)) {
			errors.code = 'Please enter a valid 6-digit verification code';
			return;
		}

		loading = true;

		try {
			const result = await authService.verifyEmail(verificationCode);

			if (result) {
				success = true;
				dispatch('success');

				// Redirect to dashboard after successful verification
				setTimeout(() => {
					window.location.href = '/dashboard';
				}, 2000);
			}
		} finally {
			loading = false;
		}
	}

	function handleResendCode() {
		// Reset any previous errors
		authStore.clearError();

		// If email isn't provided, try to get it from the current user
		const emailToUse = email || $user?.email || '';

		if (!emailToUse) {
			authStore.setError('Email address is required to resend verification code');
			return;
		}

		authService.requestVerificationEmail(emailToUse).then((success) => {
			if (success) {
				authStore.setMessage('A new verification code has been sent to your email');
			}
		});
	}
</script>

<div class="mx-auto max-w-md">
	{#if success}
		<Alert type="success">
			<h3 class="text-lg font-medium">Email Verified!</h3>
			<p>Your email has been successfully verified. You will be redirected to the dashboard.</p>
		</Alert>
	{:else}
		<form on:submit|preventDefault={handleSubmit} class="space-y-6">
			<!-- Error Alert -->
			{#if $authError}
				<Alert type="error" dismissible={true} on:dismiss={() => authStore.clearError()}>
					{$authError}
				</Alert>
			{/if}

			<div class="mb-6 text-center">
				<h2 class="text-2xl font-bold text-gray-800">Verify Your Email</h2>
				<p class="mt-2 text-gray-600">
					We've sent a 6-digit verification code to {email || 'your email'}. Please enter it below
					to verify your account.
				</p>
			</div>

			<!-- Verification Code Field -->
			<div>
				<Input
					type="text"
					label="Verification Code"
					bind:value={verificationCode}
					error={errors.code}
					disabled={loading}
					maxlength="6"
					inputmode="numeric"
					pattern="[0-9]*"
					autocomplete="one-time-code"
					placeholder="123456"
					required
				/>
			</div>

			<!-- Submit Button -->
			<Button type="submit" variant="primary" fullWidth={true} {loading} disabled={loading}>
				Verify Email
			</Button>

			<!-- Resend Code -->
			<div class="mt-4 text-center">
				<p class="text-sm text-gray-600">Didn't receive a code?</p>
				<button
					type="button"
					on:click={handleResendCode}
					class="text-primary hover:text-primary-dark text-sm font-medium"
				>
					Resend code
				</button>
			</div>
		</form>
	{/if}
</div>
