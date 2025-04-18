<script lang="ts">
	import { onMount } from 'svelte';
	import { authStore, user, authError } from '$lib/stores/auth';
	import { authService } from '$lib/services/auth_services';
	import EmailVerificationCodeForm from '$lib/components/auth/EmailVerificationCodeForm.svelte';
	import Alert from '$lib/components/ui/Alert.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import { fade } from 'svelte/transition';

	// Check if we have an email in localStorage (from registration)
	let email = $state('');

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

<div class="flex min-h-[80vh] items-center justify-center px-4">
	<div class="w-full max-w-md">
		{#if $user?.email_verified}
			<div
				class="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800"
				transition:fade={{ duration: 300 }}
			>
				<div class="p-8">
					<div class="mb-6 flex justify-center">
						<div
							class="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900"
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								class="h-8 w-8 text-green-600 dark:text-green-300"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M5 13l4 4L19 7"
								/>
							</svg>
						</div>
					</div>

					<h1 class="mb-2 text-center text-2xl font-bold text-gray-800 dark:text-white">
						Email Verified
					</h1>
					<p class="mb-6 text-center text-gray-600 dark:text-gray-300">
						Your email has been successfully verified. You can now continue using the
						application.
					</p>

					<div class="flex justify-center">
						<Button href="/dashboard" variant="primary" size="lg">Go to Dashboard</Button>
					</div>
				</div>
			</div>
		{:else}
			<div
				class="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800"
				transition:fade={{ duration: 300 }}
			>
				<div class="p-8">
					<div class="mb-6 flex justify-center">
						<div
							class="bg-primary-100 dark:bg-primary-900 flex h-16 w-16 items-center justify-center rounded-full"
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								class="text-primary-600 dark:text-primary-300 h-8 w-8"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
								/>
							</svg>
						</div>
					</div>

					<h1 class="mb-6 text-center text-2xl font-bold text-gray-800 dark:text-white">
						Verify Your Email
					</h1>

					{#if $authError}
						<Alert
							type="error"
							dismissible={true}
							on:dismiss={() => authStore.clearError()}
							class="mb-6"
						>
							{$authError}
						</Alert>
					{/if}

					<!-- Use the proper EmailVerificationCodeForm component -->
					<EmailVerificationCodeForm {email} on:success={handleSuccess} />
				</div>
			</div>
		{/if}
	</div>
</div>
