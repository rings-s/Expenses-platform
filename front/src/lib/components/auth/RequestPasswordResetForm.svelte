<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { authService } from '$lib/services/auth_services';
	import { authStore, authError } from '$lib/stores/auth';
	import Button from '$lib/components/ui/Button.svelte';
	import Input from '$lib/components/ui/Input.svelte';
	import Alert from '$lib/components/ui/Alert.svelte';

	let email = '';
	let loading = false;
	let success = false;
	let errors: Record<string, string> = {};

	const dispatch = createEventDispatcher();

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
				dispatch('success', { email });
			}
		} finally {
			loading = false;
		}
	}
</script>

<form on:submit|preventDefault={handleSubmit} class="space-y-6">
	{#if success}
		<Alert type="success">
			<h3 class="text-lg font-medium">Check your email</h3>
			<p>
				We've sent a password reset link to <strong>{email}</strong>. Click the link in the email to
				reset your password.
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
			<p class="mb-4 text-gray-600">
				Enter your email address and we'll send you a link to reset your password.
			</p>

			<Input
				type="email"
				label="Email"
				bind:value={email}
				placeholder="your@email.com"
				error={errors.email}
				disabled={loading}
				required
			/>
		</div>

		<Button type="submit" variant="primary" fullWidth={true} {loading} disabled={loading}>
			Send Reset Link
		</Button>
	{/if}

	<div class="mt-4 text-center">
		<a href="/auth/login" class="text-primary hover:text-primary-dark text-sm"> Back to login </a>
	</div>
</form>
