<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { authService } from '$lib/services/auth_services';
	import { authStore, authError } from '$lib/stores/auth';
	import Button from '$lib/components/ui/Button.svelte';
	import Input from '$lib/components/ui/Input.svelte';
	import Alert from '$lib/components/ui/Alert.svelte';
	import type { ResetPasswordData } from '$lib/types/auth.types';

	// We now use a multi-step reset process
	let currentStep = 'code'; // 'code' or 'password'

	let resetData: ResetPasswordData = {
		token: '',
		password: '',
		password_confirm: ''
	};

	let email = ''; // For requesting a code
	let loading = false;
	let success = false;
	let errors: Record<string, string> = {};

	const dispatch = createEventDispatcher();

	// Password validation regex patterns
	const hasLowerCase = /[a-z]/;
	const hasUpperCase = /[A-Z]/;
	const hasNumber = /\d/;
	const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/;

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

	async function handleRequestCode() {
		// Reset errors
		errors = {};
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
				// Move to code entry step
				currentStep = 'code';
			}
		} finally {
			loading = false;
		}
	}

	async function handleVerifyCode() {
		if (!validateCode()) {
			return;
		}

		// Proceed to password step
		currentStep = 'password';
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
				dispatch('success');

				// After success, redirect to login after a delay
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
		<Alert type="success">
			<h3 class="text-lg font-medium">Password Reset Complete</h3>
			<p>Your password has been reset successfully. You will be redirected to the login page.</p>
		</Alert>
	{:else}
		<!-- Error Alert -->
		{#if $authError}
			<Alert type="error" dismissible={true} on:dismiss={() => authStore.clearError()}>
				{$authError}
			</Alert>
		{/if}

		<!-- Email step - Request a reset code -->
		{#if currentStep === 'email'}
			<form on:submit|preventDefault={handleRequestCode} class="space-y-6">
				<div class="mb-6 text-center">
					<h2 class="text-2xl font-bold text-gray-800">Reset Your Password</h2>
					<p class="mt-2 text-gray-600">
						Enter your email address and we'll send you a 6-digit code to reset your password.
					</p>
				</div>

				<Input
					type="email"
					label="Email"
					bind:value={email}
					placeholder="your@email.com"
					error={errors.email}
					disabled={loading}
					required
				/>

				<Button type="submit" variant="primary" fullWidth={true} {loading} disabled={loading}>
					Send Reset Code
				</Button>
			</form>
		{:else if currentStep === 'code'}
			<!-- Code step - Enter the reset code -->
			<form on:submit|preventDefault={handleVerifyCode} class="space-y-6">
				<div class="mb-6 text-center">
					<h2 class="text-2xl font-bold text-gray-800">Enter Reset Code</h2>
					<p class="mt-2 text-gray-600">
						We've sent a 6-digit reset code to your email. Please enter it below.
					</p>
				</div>

				<Input
					type="text"
					label="Reset Code"
					bind:value={resetData.token}
					error={errors.token}
					disabled={loading}
					maxlength="6"
					inputmode="numeric"
					pattern="[0-9]*"
					autocomplete="one-time-code"
					placeholder="123456"
					required
				/>

				<Button type="submit" variant="primary" fullWidth={true} {loading} disabled={loading}>
					Verify Code
				</Button>

				<!-- Back to email step -->
				<div class="mt-4 text-center">
					<button
						type="button"
						on:click={() => (currentStep = 'email')}
						class="text-primary hover:text-primary-dark text-sm font-medium"
					>
						Try a different email
					</button>
				</div>
			</form>
		{:else if currentStep === 'password'}
			<!-- Password step - Set new password -->
			<form on:submit|preventDefault={handleResetPassword} class="space-y-6">
				<div class="mb-6 text-center">
					<h2 class="text-2xl font-bold text-gray-800">Set New Password</h2>
					<p class="mt-2 text-gray-600">Create a new password for your account.</p>
				</div>

				<!-- Password Requirements Info -->
				<div class="mb-4 text-sm text-gray-600">
					<p>Your password must:</p>
					<ul class="mt-1 list-disc pl-5">
						<li>Be at least 8 characters long</li>
						<li>Include at least one lowercase letter</li>
						<li>Include at least one uppercase letter</li>
						<li>Include at least one number</li>
						<li>Include at least one special character (!@#$%^&*)</li>
					</ul>
				</div>

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

				<Button type="submit" variant="primary" fullWidth={true} {loading} disabled={loading}>
					Reset Password
				</Button>
			</form>
		{/if}

		<div class="mt-6 text-center">
			<a href="/auth/login" class="text-primary hover:text-primary-dark text-sm font-medium">
				Back to login
			</a>
		</div>
	{/if}
</div>
