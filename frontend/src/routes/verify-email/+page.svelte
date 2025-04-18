<script>
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import AuthLayout from '$lib/components/auth/AuthLayout.svelte';
	import VerifyEmailForm from '$lib/components/auth/VerifyEmailForm.svelte';

	let email = '';

	onMount(() => {
		// Get email from query params
		email = $page.url.searchParams.get('email') || '';

		if (!email) {
			goto('/login');
		}
	});

	function handleVerificationSuccess() {
		goto('/login?verified=true');
	}
</script>

<svelte:head>
	<title>Verify Email - Expensis</title>
</svelte:head>

<AuthLayout title="Verify your email" subtitle="Please verify your email address to continue">
	<VerifyEmailForm {email} on:success={handleVerificationSuccess} />
</AuthLayout>
