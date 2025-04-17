<script lang="ts">
	import { page } from '$app/stores';
	import LoginForm from '$lib/components/auth/LoginForm.svelte';

	// Get the redirect URL from query parameter
	const redirectUrl = $page.url.searchParams.get('redirect');
</script>

<div class="mx-auto max-w-md rounded-lg bg-white p-8 shadow-md">
	<h1 class="mb-6 text-center text-2xl font-bold">Log In to Your Account</h1>

	<LoginForm redirect={redirectUrl} />
</div>
