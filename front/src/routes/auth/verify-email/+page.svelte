<script lang="ts">
	import { onMount } from 'svelte';
	import { authStore, user, authError } from '$lib/stores/auth';
	import { authService } from '$lib/services/auth_services'; // Added missing import
	import EmailVerificationCodeForm from '$lib/components/auth/EmailVerificationCodeForm.svelte';
	import Alert from '$lib/components/ui/Alert.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import { fade, fly } from 'svelte/transition';

	// Check if we have an email in localStorage (from registration)
	let email = $state('');
	// Control animation state
	let isVisible = $state(true);
	let verificationCode = $state('');
	let loading = $state(false);

	onMount(() => {
		// Try to get stored email from registration
		if (typeof localStorage !== 'undefined') {
			email = localStorage.getItem('verification_email') || '';
		}

		// If no email from registration, try to use current user's email
		if (!email && $user?.email) {
			email = $user.email;
		}
	});

	function handleSuccess() {
		// Clear verification email from localStorage after successful verification
		if (typeof localStorage !== 'undefined') {
			localStorage.removeItem('verification_email');
		}
	}
</script>

<div class="flex min-h-[80vh] items-center justify-center px-4">
	<div class="w-full max-w-md">
		{#if isVisible}
			{#if $user?.email_verified}
				{#key $user?.email_verified}
					<div
						class="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800"
						transition:fade={{ duration: 300 }}
					>
						<div class="p-8">
							<div class="mb-6 flex justify-center">
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

							<h1 class="mb-2 text-center text-2xl font-bold text-gray-800 dark:text-white">
								Email Verified
							</h1>
							<p class="mb-6 text-center text-gray-600 dark:text-gray-300">
								Your email has been successfully verified. You can now continue using the
								application.
							</p>

							<div class="flex justify-center">
								<Button href="/dashboard" variant="primary" size="lg">Go to Dashboard</Button>
							</div>
						</div>
					</div>
				{/key}
			{:else}
				<div
					class="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800"
					transition:fade={{ duration: 300 }}
				>
					<div class="p-8">
						<div class="mb-6 flex justify-center">
							<div
								class="bg-primary-100 dark:bg-primary-900 flex h-16 w-16 items-center justify-center rounded-full"
							>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									class="text-primary-600 dark:text-primary-300 h-8 w-8"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
									/>
								</svg>
							</div>
						</div>

						<h1 class="mb-6 text-center text-2xl font-bold text-gray-800 dark:text-white">
							Verify Your Email
						</h1>

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
							<span class="font-medium break-all text-gray-800 dark:text-white">{email}</span>.
							Please enter it below to verify your account.
						</p>

						<form
							on:submit|preventDefault={async (e) => {
								const form = e.target;
								const input = form.querySelector('input');
								if (input) {
									const code = input.value;
									if (code.length === 6) {
										loading = true;
										try {
											const result = await authService.verifyEmail(code);
											if (result) {
												handleSuccess();
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
								}
							}}
							class="space-y-6"
						>
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
										class="focus:ring-primary focus:border-primary block w-full rounded-lg border-gray-300 bg-white px-4 py-3 text-center text-xl font-medium tracking-[0.5em] transition-all duration-200 focus:shadow-md dark:border-gray-600 dark:bg-gray-700 dark:text-white"
										maxlength="6"
										inputmode="numeric"
										pattern="[0-9]*"
										autocomplete="one-time-code"
										placeholder="123456"
										disabled={loading}
										required
									/>
								</div>
							</div>

							<Button
								type="submit"
								variant="primary"
								fullWidth={true}
								size="lg"
								{loading}
								disabled={loading}
							>
								{loading ? 'Verifying...' : 'Verify Email'}
							</Button>
						</form>

						<div class="mt-6 text-center">
							<p class="text-sm text-gray-600 dark:text-gray-400">Didn't receive a code?</p>
							<button
								type="button"
								on:click={() => {
									const emailToUse = email || $user?.email || '';
									if (emailToUse) {
										authService.requestVerificationEmail(emailToUse).then((success) => {
											if (success) {
												authStore.setMessage('A new verification code has been sent to your email');
											}
										});
									} else {
										authStore.setError('Email address is required to resend verification code');
									}
								}}
								class="text-primary hover:text-primary-dark dark:text-primary-400 dark:hover:text-primary-300 focus:ring-primary mt-1 rounded text-sm font-medium transition-all duration-200 hover:underline focus:ring-2 focus:ring-offset-2 focus:outline-none"
							>
								Resend code
							</button>
						</div>
					</div>
				</div>
			{/if}
		{/if}
	</div>
</div>

<style>
	/* Add custom animation for input focus */
	input:focus {
		transform: translateY(-1px);
		transition: all 0.2s ease;
	}
</style>
