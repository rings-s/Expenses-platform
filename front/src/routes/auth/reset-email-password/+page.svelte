<script lang="ts">
	import { onMount } from 'svelte';
	import { authService } from '$lib/services/auth_services';
	import { authStore, authError } from '$lib/stores/auth';
	import Button from '$lib/components/ui/Button.svelte';
	import Input from '$lib/components/ui/Input.svelte';
	import Alert from '$lib/components/ui/Alert.svelte';
	import { fade } from 'svelte/transition';
	import type { ResetPasswordData } from '$lib/types/auth.types';

	// State with runes
	let currentStep = $state('code'); // 'code' or 'password'
	let resetData = $state<ResetPasswordData>({
		token: '',
		password: '',
		password_confirm: ''
	});
	let email = $state(''); // For displaying confirmation
	let loading = $state(false);
	let success = $state(false);
	let errors = $state<Record<string, string>>({});

	// Password validation regex patterns
	const hasLowerCase = /[a-z]/;
	const hasUpperCase = /[A-Z]/;
	const hasNumber = /\d/;
	const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/;

	onMount(() => {
		// Try to get stored email from localStorage
		if (typeof localStorage !== 'undefined') {
			const storedEmail = localStorage.getItem('reset_password_email');
			if (storedEmail) {
				email = storedEmail;
			}
		}

		// Check if a token was provided in the URL (like ?token=123456)
		if (typeof window !== 'undefined') {
			const params = new URLSearchParams(window.location.search);
			const token = params.get('token');
			if (token) {
				resetData.token = token;
			}
		}
	});

	function validateCode(): boolean {
		errors = {};

		if (!resetData.token) {
			errors.token = 'Reset code is required';
			return false;
		}

		if (resetData.token.length !== 6 || !/^\d+$/.test(resetData.token)) {
			errors.token = 'Please enter a valid 6-digit reset code';
			return false;
		}

		return true;
	}

	function validatePassword(): boolean {
		errors = {};

		// Enhanced password validation
		if (!resetData.password) {
			errors.password = 'Password is required';
		} else if (resetData.password.length < 8) {
			errors.password = 'Password must be at least 8 characters long';
		} else {
			// Check password complexity
			let complexityErrors = [];

			if (!hasLowerCase.test(resetData.password)) {
				complexityErrors.push('lowercase letter');
			}

			if (!hasUpperCase.test(resetData.password)) {
				complexityErrors.push('uppercase letter');
			}

			if (!hasNumber.test(resetData.password)) {
				complexityErrors.push('number');
			}

			if (!hasSpecialChar.test(resetData.password)) {
				complexityErrors.push('special character');
			}

			if (complexityErrors.length > 0) {
				errors.password = `Password must include at least one ${complexityErrors.join(', ')}`;
			}
		}

		if (resetData.password !== resetData.password_confirm) {
			errors.password_confirm = 'Passwords do not match';
		}

		return Object.keys(errors).length === 0;
	}

	async function handleVerifyCode() {
		if (!validateCode()) {
			return;
		}

		loading = true;
		authStore.clearError();

		try {
			// Proceed to password step without API call yet
			// The token will be verified when we reset the password
			currentStep = 'password';
		} finally {
			loading = false;
		}
	}

	async function handleResetPassword() {
		if (!validatePassword()) {
			return;
		}

		loading = true;
		authStore.clearError();

		try {
			const result = await authService.resetPassword(resetData);

			if (result) {
				success = true;

				// Clear stored email
				if (typeof localStorage !== 'undefined') {
					localStorage.removeItem('reset_password_email');
				}

				// After success, redirect to login after a delay
				setTimeout(() => {
					if (typeof window !== 'undefined') {
						window.location.href = '/auth/login';
					}
				}, 3000);
			}
		} catch (error) {
			console.error('Error resetting password:', error);
		} finally {
			loading = false;
		}
	}
</script>

<div class="flex min-h-[80vh] items-center justify-center px-4">
	<div class="w-full max-w-md">
		{#if success}
			<div
				class="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800"
				transition:fade={{ duration: 300 }}
			>
				<div class="p-8">
					<div class="mb-8 flex justify-center">
						<div
							class="flex h-20 w-20 items-center justify-center rounded-full bg-green-100 shadow-md dark:bg-green-900"
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								class="h-10 w-10 text-green-600 dark:text-green-300"
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

					<h2 class="mb-4 text-center text-2xl font-bold text-gray-800 dark:text-white">
						Password Reset Complete
					</h2>
					<p class="mb-8 text-center text-gray-600 dark:text-gray-300">
						Your password has been reset successfully. You will be redirected to the login page.
					</p>

					<div class="mt-8 text-center">
						<Button href="/auth/login" variant="primary" size="lg">Go to Login</Button>
					</div>
				</div>
			</div>
		{:else}
			<!-- Error Alert -->
			{#if $authError}
				<Alert
					type="error"
					dismissible={true}
					on:dismiss={() => authStore.clearError()}
					class="mb-4"
				>
					{$authError}
				</Alert>
			{/if}

			<div
				class="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800"
			>
				{#if currentStep === 'code'}
					<!-- Code step - Enter the reset code -->
					<div class="p-8" transition:fade={{ duration: 300 }}>
						<div class="mb-6 flex justify-center">
							<div
								class="mb-2 flex h-20 w-20 items-center justify-center rounded-full bg-gray-100 shadow-sm dark:bg-gray-700"
							>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									class="h-10 w-10 text-gray-600 dark:text-gray-300"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
									/>
								</svg>
							</div>
						</div>

						<h2 class="mb-3 text-center text-2xl font-bold text-gray-800 dark:text-white">
							Enter Reset Code
						</h2>
						<p class="mb-6 text-center text-gray-600 dark:text-gray-300">
							{#if email}
								We've sent a 6-digit reset code to <span
									class="font-medium text-gray-800 dark:text-white">{email}</span
								>. Please enter it below.
							{:else}
								Please enter the 6-digit reset code we sent to your email.
							{/if}
						</p>

						<form on:submit|preventDefault={handleVerifyCode} class="space-y-6">
							<div>
								<label
									for="reset-code"
									class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
								>
									Reset Code <span class="text-red-500">*</span>
								</label>
								<input
									type="text"
									id="reset-code"
									bind:value={resetData.token}
									class="focus:ring-primary focus:border-primary block w-full rounded-lg border-gray-300 bg-white px-4 py-3 text-center text-xl font-medium tracking-[0.6em] shadow-sm transition-all duration-200 focus:ring-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
									maxlength="6"
									inputmode="numeric"
									pattern="[0-9]*"
									autocomplete="one-time-code"
									placeholder="123456"
									required
								/>
								{#if errors.token}
									<p class="mt-1 text-sm text-red-600 dark:text-red-400">{errors.token}</p>
								{/if}
							</div>

							<button
								type="submit"
								class="w-full rounded-lg bg-gray-900 px-4 py-3 font-medium text-white shadow-sm transition-all duration-200 hover:bg-black hover:shadow-md focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 focus:outline-none dark:bg-gray-700 dark:hover:bg-gray-600"
								disabled={loading}
							>
								{#if loading}
									<span class="flex items-center justify-center">
										<svg
											class="mr-2 -ml-1 h-4 w-4 animate-spin text-white"
											xmlns="http://www.w3.org/2000/svg"
											fill="none"
											viewBox="0 0 24 24"
										>
											<circle
												class="opacity-25"
												cx="12"
												cy="12"
												r="10"
												stroke="currentColor"
												stroke-width="4"
											></circle>
											<path
												class="opacity-75"
												fill="currentColor"
												d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
											></path>
										</svg>
										Verifying...
									</span>
								{:else}
									Verify Code
								{/if}
							</button>

							<!-- Back to request page -->
							<div class="mt-6 text-center">
								<a
									href="/auth/request-password-reset"
									class="text-sm font-medium text-gray-600 transition-colors duration-200 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
								>
									Request a new code
								</a>
							</div>
						</form>
					</div>
				{:else if currentStep === 'password'}
					<!-- Password step - Set new password -->
					<div class="p-8" transition:fade={{ duration: 300 }}>
						<div class="mb-6 flex justify-center">
							<div
								class="bg-primary-100 dark:bg-primary-900 mb-2 flex h-20 w-20 items-center justify-center rounded-full shadow-sm"
							>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									class="text-primary-600 dark:text-primary-300 h-10 w-10"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
									/>
								</svg>
							</div>
						</div>

						<h2 class="mb-3 text-center text-2xl font-bold text-gray-800 dark:text-white">
							Set New Password
						</h2>
						<p class="mb-6 text-center text-gray-600 dark:text-gray-300">
							Create a new secure password for your account.
						</p>

						<!-- Password Requirements Info -->
						<div
							class="mb-6 rounded-lg border border-blue-100 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20"
						>
							<p class="mb-2 text-sm font-medium text-blue-800 dark:text-blue-300">
								Your password must:
							</p>
							<ul class="list-disc space-y-1 pl-5 text-sm text-blue-700 dark:text-blue-400">
								<li>Be at least 8 characters long</li>
								<li>Include at least one lowercase letter</li>
								<li>Include at least one uppercase letter</li>
								<li>Include at least one number</li>
								<li>Include at least one special character (!@#$%^&*)</li>
							</ul>
						</div>

						<form on:submit|preventDefault={handleResetPassword} class="space-y-6">
							<!-- Password Field -->
							<Input
								type="password"
								label="New Password"
								bind:value={resetData.password}
								error={errors.password}
								disabled={loading}
								required
							/>

							<!-- Confirm Password Field -->
							<Input
								type="password"
								label="Confirm New Password"
								bind:value={resetData.password_confirm}
								error={errors.password_confirm}
								disabled={loading}
								required
							/>

							<button
								type="submit"
								class="w-full rounded-lg bg-gray-900 px-4 py-3 font-medium text-white shadow-sm transition-all duration-200 hover:bg-black hover:shadow-md focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 focus:outline-none dark:bg-gray-700 dark:hover:bg-gray-600"
								disabled={loading}
							>
								{#if loading}
									<span class="flex items-center justify-center">
										<svg
											class="mr-2 -ml-1 h-4 w-4 animate-spin text-white"
											xmlns="http://www.w3.org/2000/svg"
											fill="none"
											viewBox="0 0 24 24"
										>
											<circle
												class="opacity-25"
												cx="12"
												cy="12"
												r="10"
												stroke="currentColor"
												stroke-width="4"
											></circle>
											<path
												class="opacity-75"
												fill="currentColor"
												d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
											></path>
										</svg>
										Resetting Password...
									</span>
								{:else}
									Reset Password
								{/if}
							</button>

							<!-- Back to code step -->
							<div class="mt-6 text-center">
								<button
									type="button"
									on:click={() => (currentStep = 'code')}
									class="text-sm font-medium text-gray-600 transition-colors duration-200 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
								>
									Back to code entry
								</button>
							</div>
						</form>
					</div>
				{/if}
			</div>

			<div class="mt-6 text-center">
				<a
					href="/auth/login"
					class="text-sm font-medium text-gray-600 transition-colors duration-200 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
				>
					Back to login
				</a>
			</div>
		{/if}
	</div>
</div>

<style>
	/* Add subtle animation to inputs */
	input:focus {
		transform: translateY(-1px);
		transition: all 0.2s ease;
	}

	/* Add proper spacing for verification code */
	input[placeholder='123456']::placeholder {
		opacity: 0.4;
	}
</style>
