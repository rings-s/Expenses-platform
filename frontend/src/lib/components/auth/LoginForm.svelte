<script>
	import { createEventDispatcher } from 'svelte';
	import { authStore } from '$lib/stores/authStore';
	import FormField from '$lib/components/ui/FormField.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Alert from '$lib/components/ui/Alert.svelte';

	export let showVerificationSuccess = false;

	let email = '';
	let password = '';
	let error = '';
	let isSubmitting = false;

	const dispatch = createEventDispatcher();

	async function handleSubmit() {
		if (!email || !password) {
			error = 'Please enter both email and password';
			return;
		}

		error = '';
		isSubmitting = true;

		try {
			await authStore.login({ email, password });
			dispatch('success');
		} catch (err) {
			error = err.message || 'Login failed. Please check your credentials and try again.';
		} finally {
			isSubmitting = false;
		}
	}
</script>

<form on:submit|preventDefault={handleSubmit} class="space-y-6">
	{#if error}
		<Alert type="error">{error}</Alert>
	{/if}

	{#if showVerificationSuccess}
		<Alert type="success">Email verified successfully! You can now log in.</Alert>
	{/if}

	<FormField label="Email Address" type="email" name="email" bind:value={email} required={true} />

	<FormField
		label="Password"
		type="password"
		name="password"
		bind:value={password}
		required={true}
	/>

	<div class="flex items-center justify-between">
		<div class="flex items-center">
			<input
				id="remember_me"
				name="remember_me"
				type="checkbox"
				class="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
			/>
			<label for="remember_me" class="ml-2 block text-sm text-gray-900"> Remember me </label>
		</div>

		<div class="text-sm">
			<a href="/forgot-password" class="font-medium text-blue-600 hover:text-blue-500">
				Forgot your password?
			</a>
		</div>
	</div>

	<div>
		<Button type="submit" variant="primary" fullWidth={true} loading={isSubmitting}>Sign in</Button>
	</div>
</form>

<div class="mt-6 text-center">
	<p class="text-sm text-gray-600">
		Don't have an account?
		<a href="/register" class="font-medium text-blue-600 hover:text-blue-500"> Sign up </a>
	</p>
</div>
