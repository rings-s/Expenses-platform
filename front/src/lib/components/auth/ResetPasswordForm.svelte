<script lang="ts">
	import { createEventDispatcher, onMount } from 'svelte';
	import { authService } from '$lib/services/auth_services';
	import { authStore, authError } from '$lib/stores/auth';
	import Button from '$lib/components/ui/Button.svelte';
	import Input from '$lib/components/ui/Input.svelte';
	import Alert from '$lib/components/ui/Alert.svelte';
	import { fade } from 'svelte/transition';
	import type { ResetPasswordData } from '$lib/types/auth.types';

	// State
	let currentStep = $state('code'); // 'code' or 'password'
	let resetData = $state<ResetPasswordData>({
		token: '',
		password: '',
		password_confirm: ''
	});
	let email = $state('');
	let loading = $state(false);
	let success = $state(false);
	let errors = $state<Record<string, string>>({});

	// Password validation patterns
	const hasLowerCase = /[a-z]/;
	const hasUpperCase = /[A-Z]/;
	const hasNumber = /\d/;
	const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/;

	// Clear errors on input
	function handleInputChange() {
		// Clear relevant errors based on which field changed
		if (resetData.token && errors.token) {
			errors.token = '';
		}
		if (resetData.password && errors.password) {
			errors.password = '';
		}
		if (resetData.password_confirm && resetData.password === resetData.password_confirm && errors.password_confirm) {
			errors.password_confirm = '';
		}
	}

	onMount(() => {
		// Get email from localStorage
		const storedEmail = localStorage.getItem('reset_password_email');
		if (storedEmail) {
			email = storedEmail;
			console.log("Retrieved email for password reset:", email);
		} else {
			console.log("No email found in localStorage for password reset");
		}

		// Check for token in URL
		if (typeof window !== 'undefined') {
			const params = new URLSearchParams(window.location.search);
			const token = params.get('token');
			if (token) {
				resetData.token = token;
				console.log("Retrieved token from URL:", token);
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

		if (!resetData.password) {
			errors.password = 'Password is required';
			return false;
		}

		if (resetData.password.length < 8) {
			errors.password = 'Password must be at least 8 characters long';
			return false;
		}

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
			return false;
		}

		if (resetData.password !== resetData.password_confirm) {
			errors.password_confirm = 'Passwords do not match';
			return false;
		}

		return true;
	}

	async function handleVerifyCode() {
		authStore.clearError();

		if (!validateCode()) {
			return;
		}

		loading = true;

		try {
			console.log("Verifying reset code:", resetData.token);
			// We move to the password reset step without separate verification
			currentStep = 'password';
		} catch (error) {
			console.error('Error processing code:', error);
			authStore.setError('Error processing code. Please try again.');
		} finally {
			loading = false;
		}
	}

	async function handleResetPassword() {
		authStore.clearError();

		if (!validatePassword()) {
			return;
		}

		loading = true;

		try {
			console.log("Submitting password reset with token:", resetData.token);
			const result = await authService.resetPassword(resetData);

			if (result) {
				success = true;
				console.log("Password reset successful");

				// Clear stored email
				if (typeof localStorage !== 'undefined') {
					localStorage.removeItem('reset_password_email');
				}

				// Redirect to login after success
				setTimeout(() => {
					window.location.href = '/auth/login';
				}, 3000);
			}
		} catch (error) {
			console.error('Error resetting password:', error);
		} finally {
			loading = false;
		}
	}
</script>


<div class="mx-auto max-w-md">
	{#if success}
		<div
			class="overflow-hidden rounded-xl bg-white p-8 shadow-lg dark:bg-gray-800"
			transition:fade={{ duration: 300 }}
		>
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

			<h2 class="mb-2 text-center text-2xl font-bold text-gray-800 dark:text-white">
				Password Reset Complete
			</h2>
			<p class="mb-6 text-center text-gray-600 dark:text-gray-300">
				Your password has been reset successfully. You will be redirected to the login page.
			</p>

			<div class="mt-6 text-center">
				<Button href="/auth/login" variant="primary">Go to Login</Button>
			</div>
		</div>
	{:else}
		<!-- Error Alert -->
		{#if $authError}
			<Alert type="error" dismissible={true} on:dismiss={() => authStore.clearError()}>
				{$authError}
			</Alert>
		{/if}

		<div class="overflow-hidden rounded-xl bg-white shadow-lg dark:bg-gray-800">
			{#if currentStep === 'code'}
				<!-- Code step - Enter the reset code -->
				<div class="p-8" transition:fade={{ duration: 300 }}>
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
									d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
								/>
							</svg>
						</div>
					</div>

					<h2 class="mb-2 text-center text-2xl font-bold text-gray-800 dark:text-white">
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

					<form on:submit|preventDefault={handleVerifyCode} class="space-y-6" on:input={handleInputChange}>
						<Input
							type="text"
							name="token"
							label="Reset Code"
							bind:value={resetData.token}
							error={errors.token}
							disabled={loading}
							maxlength="6"
							inputmode="numeric"
							pattern="[0-9]*"
							autocomplete="one-time-code"
							placeholder="123456"
							class="text-center text-lg tracking-widest"
							required
						/>

						<Button type="submit" variant="primary" fullWidth={true} {loading} disabled={loading}>
							Verify Code
						</Button>

						<!-- Back to request page -->
						<div class="mt-4 text-center">

								href="/auth/request-password-reset"
								class="text-primary hover:text-primary-dark dark:text-primary-400 dark:hover:text-primary-300 text-sm font-medium"
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
									d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
								/>
							</svg>
						</div>
					</div>

					<h2 class="mb-2 text-center text-2xl font-bold text-gray-800 dark:text-white">
						Set New Password
					</h2>
					<p class="mb-6 text-center text-gray-600 dark:text-gray-300">
						Create a new secure password for your account.
					</p>

					<!-- Password Requirements Info -->
					<div class="mb-4 text-sm text-gray-600 dark:text-gray-400">
						<p>Your password must:</p>
						<ul class="mt-1 list-disc pl-5">
							<li>Be at least 8 characters long</li>
							<li>Include at least one lowercase letter</li>
							<li>Include at least one uppercase letter</li>
							<li>Include at least one number</li>
							<li>Include at least one special character (!@#$%^&*)</li>
						</ul>
					</div>

					<form on:submit|preventDefault={handleResetPassword} class="space-y-6" on:input={handleInputChange}>
						<!-- Password Field -->
						<Input
							type="password"
							name="password"
							label="New Password"
							bind:value={resetData.password}
							error={errors.password}
							disabled={loading}
							required
						/>

						<!-- Confirm Password Field -->
						<Input
							type="password"
							name="password_confirm"
							label="Confirm New Password"
							bind:value={resetData.password_confirm}
							error={errors.password_confirm}
							disabled={loading}
							required
						/>

						<Button type="submit" variant="primary" fullWidth={true} {loading} disabled={loading}>
							Reset Password
						</Button>

						<!-- Back to code step -->
						<div class="mt-4 text-center">
							<button
								type="button"
								on:click={() => (currentStep = 'code')}
								class="text-primary hover:text-primary-dark dark:text-primary-400 dark:hover:text-primary-300 text-sm font-medium"
							>
								Back to code entry
							</button>
						</div>
					</form>
				</div>
			{/if}
		</div>

		<div class="mt-6 text-center">

				href="/auth/login"
				class="text-primary hover:text-primary-dark dark:text-primary-400 dark:hover:text-primary-300 text-sm font-medium"
			>
				Back to login
			</a>
		</div>
	{/if}
</div>
