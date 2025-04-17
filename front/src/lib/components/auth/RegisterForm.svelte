<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { authService } from '$lib/services/auth_services';
	import { authStore, authError } from '$lib/stores/auth';
	import { goto } from '$app/navigation';
	import Button from '$lib/components/ui/Button.svelte';
	import Input from '$lib/components/ui/Input.svelte';
	import Alert from '$lib/components/ui/Alert.svelte';
	import type { RegisterData } from '$lib/types/auth.types';

	let userData: RegisterData = {
		email: '',
		username: '',
		password: '',
		password_confirm: '',
		first_name: '',
		last_name: '',
		phone_number: '',
		user_type: 'regular'
	};

	let loading = false;
	let errors: Record<string, string> = {};

	const dispatch = createEventDispatcher();

	// Password validation regex patterns
	const hasLowerCase = /[a-z]/;
	const hasUpperCase = /[A-Z]/;
	const hasNumber = /\d/;
	const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/;
	const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

	function validateForm(): boolean {
		errors = {};

		// Email validation
		if (!userData.email) {
			errors.email = 'Email is required';
		} else if (!emailRegex.test(userData.email)) {
			errors.email = 'Please enter a valid email address';
		}

		// Username validation
		if (!userData.username) {
			errors.username = 'Username is required';
		} else if (userData.username.length < 3) {
			errors.username = 'Username must be at least 3 characters long';
		} else if (!/^[a-zA-Z0-9_]+$/.test(userData.username)) {
			errors.username = 'Username can only contain letters, numbers, and underscores';
		}

		// Password validation
		if (!userData.password) {
			errors.password = 'Password is required';
		} else if (userData.password.length < 8) {
			errors.password = 'Password must be at least 8 characters long';
		} else {
			// Check password complexity
			let complexityErrors = [];

			if (!hasLowerCase.test(userData.password)) {
				complexityErrors.push('lowercase letter');
			}

			if (!hasUpperCase.test(userData.password)) {
				complexityErrors.push('uppercase letter');
			}

			if (!hasNumber.test(userData.password)) {
				complexityErrors.push('number');
			}

			if (!hasSpecialChar.test(userData.password)) {
				complexityErrors.push('special character');
			}

			if (complexityErrors.length > 0) {
				errors.password = `Password must include at least one ${complexityErrors.join(', ')}`;
			}
		}

		// Confirm password
		if (userData.password !== userData.password_confirm) {
			errors.password_confirm = 'Passwords do not match';
		}

		// Basic name validation (optional fields)
		if (userData.first_name && userData.first_name.length > 30) {
			errors.first_name = 'First name is too long (maximum 30 characters)';
		}

		if (userData.last_name && userData.last_name.length > 30) {
			errors.last_name = 'Last name is too long (maximum 30 characters)';
		}

		// Phone number validation (optional field)
		if (userData.phone_number && !/^\+?[0-9\s\-()]{7,15}$/.test(userData.phone_number)) {
			errors.phone_number = 'Please enter a valid phone number';
		}

		return Object.keys(errors).length === 0;
	}

	async function handleSubmit() {
		if (!validateForm()) {
			return;
		}

		loading = true;
		authStore.clearError();

		try {
			const success = await authService.register(userData);

			if (success) {
				dispatch('success');

				// Store email in local storage for verification page
				localStorage.setItem('verification_email', userData.email);

				// Redirect to verification page
				goto('/auth/verify-email');
			}
		} catch (error) {
			console.error('Error during registration:', error);
		} finally {
			loading = false;
		}
	}
</script>

<form on:submit|preventDefault={handleSubmit} class="space-y-4">
	<!-- Error Alert -->
	{#if $authError}
		<Alert type="error" dismissible={true} on:dismiss={() => authStore.clearError()}>
			{$authError}
		</Alert>
	{/if}

	<!-- Email and Username Row -->
	<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
		<Input
			type="email"
			label="Email"
			bind:value={userData.email}
			placeholder="your@email.com"
			error={errors.email}
			disabled={loading}
			required
		/>

		<Input
			type="text"
			label="Username"
			bind:value={userData.username}
			placeholder="username"
			error={errors.username}
			disabled={loading}
			required
		/>
	</div>

	<!-- Name Row -->
	<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
		<Input
			type="text"
			label="First Name"
			bind:value={userData.first_name}
			placeholder="John"
			error={errors.first_name}
			disabled={loading}
		/>

		<Input
			type="text"
			label="Last Name"
			bind:value={userData.last_name}
			placeholder="Doe"
			error={errors.last_name}
			disabled={loading}
		/>
	</div>

	<!-- Phone Number -->
	<Input
		type="tel"
		label="Phone Number"
		bind:value={userData.phone_number}
		placeholder="+1234567890"
		error={errors.phone_number}
		disabled={loading}
	/>

	<!-- Hidden user_type field - always set to 'regular' for public registration -->
	<input type="hidden" bind:value={userData.user_type} />

	<!-- Password Requirements Info -->
	<div class="mb-4 text-sm text-gray-600">
		<p>Your password must:</p>
		<ul class="mt-1 list-disc pl-5">
			<li>Be at least 8 characters long</li>
			<li>Include at least one lowercase letter</li>
			<li>Include at least one uppercase letter</li>
			<li>Include at least one number</li>
			<li>Include at least one special character (!@#$%^&*)</li>
		</ul>
	</div>

	<!-- Password Row -->
	<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
		<Input
			type="password"
			label="Password"
			bind:value={userData.password}
			error={errors.password}
			disabled={loading}
			required
		/>

		<Input
			type="password"
			label="Confirm Password"
			bind:value={userData.password_confirm}
			error={errors.password_confirm}
			disabled={loading}
			required
		/>
	</div>

	<!-- Submit Button -->
	<Button type="submit" variant="primary" fullWidth={true} {loading} disabled={loading}>
		Create Account
	</Button>

	<!-- Login Link -->
	<div class="mt-4 text-center">
		<span class="text-gray-600">Already have an account?</span>
		<a href="/auth/login" class="text-primary hover:text-primary-dark ml-1"> Log in </a>
	</div>
</form>
