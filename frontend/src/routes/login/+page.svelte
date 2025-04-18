<script>
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import AuthLayout from '$lib/components/auth/AuthLayout.svelte';
	import LoginForm from '$lib/components/auth/LoginForm.svelte';

	let showVerificationSuccess = false;

	onMount(() => {
		// Check if user was redirected after email verification
		if ($page.url.searchParams.get('verified') === 'true') {
			showVerificationSuccess = true;
		}
	});

	function handleLoginSuccess() {
		goto('/dashboard');
	}
</script>

<svelte:head>
	<title>Login - Expensis</title>
</svelte:head>

<AuthLayout title="Sign in to your account">
	<LoginForm {showVerificationSuccess} on:success={handleLoginSuccess} />
</AuthLayout>
