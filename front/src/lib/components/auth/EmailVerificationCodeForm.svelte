<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { authService } from '$lib/services/auth_services';
	import { authStore, authError, user } from '$lib/stores/auth';
	import Button from '$lib/components/ui/Button.svelte';
	import Alert from '$lib/components/ui/Alert.svelte';
	import { fade, fly } from 'svelte/transition';

	// Props with Svelte 5 runes
	const { email = '' } = $props();

	let verificationCode = $state('');
	let loading = $state(false);
	let success = $state(false);
	let errors = $state<Record<string, string>>({});
	let isVisible = $state(true); // Control animation state

	const dispatch = createEventDispatcher();

	// Clear error when verification code is filled
	$effect(() => {
		if (verificationCode && verificationCode.length === 6 && errors.code) {
			errors.code = '';
		}
	});

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
					if (typeof window !== 'undefined') {
						window.location.href = '/dashboard';
					}
				}, 2000);
			}
		} catch (error) {
			console.error('Error verifying email:', error);
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

<!-- Rest of the component remains the same -->

<div class="w-full">
	{#if isVisible}
		{#if success}
			<!-- Success state -->
			{#key success}
				<div
					class="overflow-hidden rounded-xl bg-white dark:bg-gray-800"
					transition:fade={{ duration: 300 }}
				>
					<div class="mt-6 mb-6 flex justify-center">
						<div
							class="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900"
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								class="h-8 w-8 text-green-600 dark:text-green-300"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M5 13l4 4L19 7"
								/>
							</svg>
						</div>
					</div>

					<Alert type="success" class="mb-6">
						<h3 class="text-lg font-medium">Email Verified!</h3>
						<p>
							Your email has been successfully verified. You will be redirected to the dashboard.
						</p>
					</Alert>
				</div>
			{/key}
		{:else}
			<div transition:fade={{ duration: 300 }}>
				<!-- Error display -->
				{#if $authError}
					<Alert
						type="error"
						dismissible={true}
						on:dismiss={() => authStore.clearError()}
						class="mb-6"
					>
						{$authError}
					</Alert>
				{/if}

				<p class="mb-6 text-center text-gray-600 dark:text-gray-300">
					We've sent a 6-digit verification code to
					<span class="font-medium break-all text-gray-800 dark:text-white"
						>{email || 'your email'}</span
					>. Please enter it below to verify your account.
				</p>

				<form on:submit|preventDefault={handleSubmit} class="space-y-6">
					<!-- Verification Code Field -->
					<div>
						<label
							for="verification-code"
							class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
						>
							Verification Code <span class="text-red-500">*</span>
						</label>
						<div class="relative mt-1">
							<input
								type="text"
								id="verification-code"
								bind:value={verificationCode}
								class={`block w-full rounded-lg border bg-white px-4 py-3 text-center text-xl font-medium tracking-[0.5em] transition-all duration-200 focus:shadow-md focus:ring-2 dark:bg-gray-700
								${errors.code ? 'border-red-500 focus:ring-red-200' : 'focus:ring-primary-200 focus:border-primary-500 border-gray-300 dark:border-gray-600'}`}
								maxlength="6"
								inputmode="numeric"
								pattern="[0-9]*"
								autocomplete="one-time-code"
								placeholder="123456"
								disabled={loading}
								required
							/>
							{#if errors.code}
								<p class="mt-1 text-sm text-red-600 dark:text-red-400">{errors.code}</p>
							{/if}
						</div>
					</div>

					<!-- Submit Button -->
					<Button
						type="submit"
						variant="primary"
						fullWidth={true}
						size="lg"
						{loading}
						disabled={loading}
					>
						<span class="flex items-center justify-center">
							{#if loading}
								<span class="mr-2">Verifying</span>
							{:else}
								Verify Email
							{/if}
						</span>
					</Button>

					<!-- Resend Code -->
					<div class="mt-6 text-center">
						<p class="text-sm text-gray-600 dark:text-gray-400">Didn't receive a code?</p>
						<button
							type="button"
							on:click={handleResendCode}
							class="text-primary hover:text-primary-dark dark:text-primary-400 dark:hover:text-primary-300 focus:ring-primary mt-1 rounded text-sm font-medium transition-all duration-200 hover:underline focus:ring-2 focus:ring-offset-2 focus:outline-none"
							disabled={loading}
						>
							Resend code
						</button>
					</div>
				</form>
			</div>
		{/if}
	{/if}
</div>

<style>
	/* Add subtle animation to the input on focus */
	input:focus {
		transform: translateY(-1px);
	}

	/* Add proper separation between input digits */
	input::placeholder {
		opacity: 0.5;
		letter-spacing: 0.5em;
	}
</style>
