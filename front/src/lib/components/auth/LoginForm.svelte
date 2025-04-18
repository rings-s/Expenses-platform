<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { authService } from '$lib/services/auth_services';
	import { authStore, authError } from '$lib/stores/auth';
	import Button from '$lib/components/ui/Button.svelte';
	import Input from '$lib/components/ui/Input.svelte';
	import Alert from '$lib/components/ui/Alert.svelte';
	import type { LoginCredentials } from '$lib/types/auth.types';

	// Props with Svelte 5 runes
	const { redirect = null } = $props();

	// State with runes
	let credentials = $state<LoginCredentials>({
		email: '',
		password: ''
	});

	let loading = $state(false);
	let errors = $state<Record<string, string>>({});
	let verificationNeeded = $state(false);
	let unverifiedEmail = $state('');

	const dispatch = createEventDispatcher();

	// Clear errors when input values change
	$effect(() => {
		if (credentials.email && errors.email) {
			errors.email = '';
		}
	});

	$effect(() => {
		if (credentials.password && errors.password) {
			errors.password = '';
		}
	});

	async function handleSubmit() {
		// Reset errors and states
		errors = {};
		verificationNeeded = false;
		unverifiedEmail = '';
		authStore.clearError();

		// Validate
		if (!credentials.email) {
			errors.email = 'Email is required';
		}

		if (!credentials.password) {
			errors.password = 'Password is required';
		}

		// Stop if we have errors
		if (Object.keys(errors).length > 0) {
			return;
		}

		loading = true;

		try {
			const loginResult = await authService.login(credentials);

			if (loginResult.needsVerification) {
				// Email is not verified
				verificationNeeded = true;
				unverifiedEmail = credentials.email;

				// Store email for verification page
				if (typeof localStorage !== 'undefined') {
					localStorage.setItem('verification_email', credentials.email);
				}

				return;
			}

			if (loginResult.success) {
				dispatch('success');

				// Navigate to redirect URL if provided, otherwise to dashboard
				setTimeout(() => {
					if (redirect) {
						window.location.href = redirect;
					} else {
						window.location.href = '/dashboard';
					}
				}, 300);
			}
		} catch (error) {
			// Error is already handled by the auth service
			console.error('Login error:', error);
		} finally {
			loading = false;
		}
	}

	function goToVerification() {
		window.location.href = '/auth/verify-email';
	}
</script>

<form on:submit|preventDefault={handleSubmit} class="space-y-6">
	<!-- Error Alert -->
	{#if $authError}
		<Alert type="error" dismissible={true} on:dismiss={() => authStore.clearError()}>
			{$authError}
		</Alert>
	{/if}

	<!-- Email Verification Required Alert -->
	{#if verificationNeeded}
		<Alert type="warning">
			<div class="flex flex-col">
				<h3 class="mb-2 text-base font-medium">Email Verification Required</h3>
				<p class="mb-4">
					Your account exists but your email ({unverifiedEmail}) needs to be verified before you can
					log in.
				</p>
				<div class="flex justify-end">
					<Button variant="warning" size="sm" on:click={goToVerification}>Verify Now</Button>
				</div>
			</div>
		</Alert>
	{/if}

	<!-- Email Field -->
	<div>
		<Input
			type="email"
			label="Email"
			bind:value={credentials.email}
			placeholder="your@email.com"
			error={errors.email}
			disabled={loading}
			required
		/>
	</div>

	<!-- Password Field -->
	<div>
		<Input
			type="password"
			label="Password"
			bind:value={credentials.password}
			error={errors.password}
			disabled={loading}
			required
		/>

		<div class="mt-2 text-right">
		    <a
				href="/auth/request-password-reset"
				class="text-primary hover:text-primary-dark dark:text-primary-400 dark:hover:text-primary-300 text-sm"
			>
				Forgot password?
			</a>
		</div>
	</div>

	<!-- Submit Button -->
	<Button type="submit" variant="primary" fullWidth={true} {loading} disabled={loading}>
		Log In
	</Button>

	<!-- Register Link -->
	<div class="mt-4 text-center">
		<span class="text-gray-600 dark:text-gray-400">Don't have an account?</span>
		<a
			href="/auth/register"
			class="text-primary hover:text-primary-dark dark:text-primary-400 dark:hover:text-primary-300 ml-1"
		>
			Sign up
		</a>
	</div>
</form>
