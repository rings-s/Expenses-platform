<script>
	import { goto } from '$app/navigation';
	import AuthLayout from '$lib/components/auth/AuthLayout.svelte';
	import ForgotPasswordForm from '$lib/components/auth/ForgotPasswordForm.svelte';

	function handleRequestSuccess(event) {
		// After a brief delay, redirect to reset token page
		setTimeout(() => {
			goto(`/reset-password?email=${encodeURIComponent(event.detail.email)}`);
		}, 2000);
	}
</script>

<svelte:head>
	<title>Forgot Password - Expensis</title>
</svelte:head>

<AuthLayout title="Reset your password" subtitle="We'll send you a code to reset your password">
	<ForgotPasswordForm on:success={handleRequestSuccess} />
</AuthLayout>
