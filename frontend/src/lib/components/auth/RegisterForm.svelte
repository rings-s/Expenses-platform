<script>
	import { createEventDispatcher } from 'svelte';
	import { authStore } from '$lib/stores/authStore';
	import FormField from '$lib/components/ui/FormField.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Alert from '$lib/components/ui/Alert.svelte';
	import { isValidEmail, isStrongPassword, passwordsMatch } from '$lib/utils/validation';

	let formData = {
		email: '',
		username: '',
		first_name: '',
		last_name: '',
		password: '',
		password_confirm: '',
		user_type: 'regular'
	};

	let errors = {};
	let formError = '';
	let isSubmitting = false;
	let successMessage = '';

	const dispatch = createEventDispatcher();

	function validateForm() {
		errors = {};

		if (!formData.email) {
			errors.email = 'Email is required';
		} else if (!isValidEmail(formData.email)) {
			errors.email = 'Please enter a valid email address';
		}

		if (!formData.username || formData.username.length < 3) {
			errors.username = 'Username must be at least 3 characters';
		}

		if (!formData.password) {
			errors.password = 'Password is required';
		} else if (!isStrongPassword(formData.password)) {
			errors.password =
				'Password must be at least 8 characters with 1 uppercase, 1 lowercase, and 1 number';
		}

		if (!passwordsMatch(formData.password, formData.password_confirm)) {
			errors.password_confirm = 'Passwords must match';
		}

		return Object.keys(errors).length === 0;
	}

	async function handleSubmit() {
		if (!validateForm()) return;

		formError = '';
		isSubmitting = true;

		try {
			const response = await authStore.register(formData);

			successMessage =
				'Registration successful! A verification email has been sent to your email address.';

			// Dispatch success event with email for verification
			dispatch('success', { email: formData.email });
		} catch (error) {
			formError = error.message || 'Registration failed. Please try again.';
		} finally {
			isSubmitting = false;
		}
	}
</script>

<form on:submit|preventDefault={handleSubmit} class="space-y-6">
	{#if formError}
		<Alert type="error">{formError}</Alert>
	{/if}

	{#if successMessage}
		<Alert type="success">{successMessage}</Alert>
	{/if}

	<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
		<FormField
			label="First Name"
			name="first_name"
			bind:value={formData.first_name}
			error={errors.first_name}
		/>

		<FormField
			label="Last Name"
			name="last_name"
			bind:value={formData.last_name}
			error={errors.last_name}
		/>
	</div>

	<FormField
		label="Email Address"
		type="email"
		name="email"
		bind:value={formData.email}
		required={true}
		error={errors.email}
	/>

	<FormField
		label="Username"
		name="username"
		bind:value={formData.username}
		required={true}
		error={errors.username}
	/>

	<FormField
		label="Password"
		type="password"
		name="password"
		bind:value={formData.password}
		required={true}
		error={errors.password}
	/>

	<FormField
		label="Confirm Password"
		type="password"
		name="password_confirm"
		bind:value={formData.password_confirm}
		required={true}
		error={errors.password_confirm}
	/>

	<div>
		<Button type="submit" variant="primary" fullWidth={true} loading={isSubmitting}>
			Create Account
		</Button>
	</div>
</form>

<div class="mt-6 text-center">
	<p class="text-sm text-gray-600">
		Already have an account?
		<a href="/login" class="font-medium text-blue-600 hover:text-blue-500"> Sign in </a>
	</p>
</div>
