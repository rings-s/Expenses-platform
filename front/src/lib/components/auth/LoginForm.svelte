<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { authService } from '$lib/services/auth_services';
	import { authStore, authError } from '$lib/stores/auth';
	import Button from '$lib/components/ui/Button.svelte';
	import Input from '$lib/components/ui/Input.svelte';
	import Alert from '$lib/components/ui/Alert.svelte';
	import type { LoginCredentials } from '$lib/types/auth.types';

	export let redirect: string | null = null;

	let credentials: LoginCredentials = {
		email: '',
		password: ''
	};

	let loading = false;
	let errors: Record<string, string> = {};

	const dispatch = createEventDispatcher();

	async function handleSubmit() {
		// Reset errors
		errors = {};

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
			const success = await authService.login(credentials);

			if (success) {
				dispatch('success');

				// Navigate to redirect URL if provided, otherwise to dashboard
				if (redirect) {
					location.href = redirect;
				} else {
					location.href = '/dashboard';
				}
			}
		} catch (error) {
			// This error is already handled by the auth service
		} finally {
			loading = false;
		}
	}
</script>

<form on:submit|preventDefault={handleSubmit} class="space-y-6">
	<!-- Error Alert -->
	{#if $authError}
		<Alert type="error" dismissible={true} on:dismiss={() => authStore.clearError()}>
			{$authError}
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
			<a href="/auth/reset-password" class="text-primary hover:text-primary-dark text-sm">
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
		<span class="text-gray-600">Don't have an account?</span>
		<a href="/auth/register" class="text-primary hover:text-primary-dark ml-1"> Sign up </a>
	</div>
</form>
