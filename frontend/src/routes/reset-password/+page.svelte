<script>
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import AuthLayout from '$lib/components/auth/AuthLayout.svelte';
	import ResetPasswordForm from '$lib/components/auth/ResetPasswordForm.svelte';

	let email = '';
	let token = '';
	let showPasswordForm = false;

	onMount(() => {
		// Get email from query params
		email = $page.url.searchParams.get('email') || '';

		// Check if token is in URL params
		const urlToken = $page.url.searchParams.get('token');
		if (urlToken) {
			token = urlToken;
			showPasswordForm = true;
		}

		if (!email) {
			goto('/forgot-password');
		}
	});

	function handleResetSuccess() {
		// After a brief delay, redirect to login
		setTimeout(() => {
			goto('/login?reset=true');
		}, 2000);
	}
</script>

<svelte:head>
	<title>Reset Password - Expensis</title>
</svelte:head>

<AuthLayout
	title="Reset your password"
	subtitle={showPasswordForm ? 'Create a new password' : 'Enter the code sent to your email'}
>
	<ResetPasswordForm {email} {token} {showPasswordForm} on:success={handleResetSuccess} />
</AuthLayout>
