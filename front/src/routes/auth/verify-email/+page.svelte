<script lang="ts">
	import { onMount } from 'svelte';
	import { authStore, user, authError } from '$lib/stores/auth';
	import EmailVerificationCodeForm from '$lib/components/auth/EmailVerificationCodeForm.svelte';
	import Alert from '$lib/components/ui/Alert.svelte';
	import Button from '$lib/components/ui/Button.svelte';

	// Check if we have an email in localStorage (from registration)
	let email = '';

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

<div class="mx-auto max-w-md rounded-lg bg-white p-8 shadow-md">
	{#if $user?.email_verified}
		<Alert type="success">
			<h3 class="text-lg font-medium">Email Already Verified</h3>
			<p>Your email has already been verified. You can continue using the application.</p>
		</Alert>

		<div class="mt-6 text-center">
			<Button href="/dashboard" variant="primary">Go to Dashboard</Button>
		</div>
	{:else}
		<h1 class="mb-6 text-center text-2xl font-bold">Verify Your Email</h1>

		<EmailVerificationCodeForm {email} on:success={handleSuccess} />
	{/if}
</div>
