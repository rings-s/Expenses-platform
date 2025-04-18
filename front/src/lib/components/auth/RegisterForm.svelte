<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { authService } from '$lib/services/auth_services';
	import { authStore, authError } from '$lib/stores/auth';
	import Button from '$lib/components/ui/Button.svelte';
	import Input from '$lib/components/ui/Input.svelte';
	import Alert from '$lib/components/ui/Alert.svelte';
	import Select from '$lib/components/ui/Select.svelte';
	import type { RegisterData } from '$lib/types/auth.types';

	// State with runes
	let userData = $state<RegisterData>({
		email: '',
		username: '',
		password: '',
		password_confirm: '',
		first_name: '',
		last_name: '',
		phone_number: '',
		user_type: 'regular'
	});

	let loading = $state(false);
	let errors = $state<Record<string, string>>({});

	const dispatch = createEventDispatcher();

	// User type options - removed Administrator option
	const userTypeOptions = [
		{ value: 'regular', label: 'Regular User' },
		{ value: 'manager', label: 'Manager' }
	];

	// Password validation regex patterns
	const hasLowerCase = /[a-z]/;
	const hasUpperCase = /[A-Z]/;
	const hasNumber = /\d/;
	const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/;
	const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

	// Clear errors when input values change
	$effect(() => {
		if (userData.email && emailRegex.test(userData.email) && errors.email) {
			errors.email = '';
		}
	});

	$effect(() => {
		if (userData.username && userData.username.length >= 3 && errors.username) {
			errors.username = '';
		}
	});

	$effect(() => {
		if (userData.password && userData.password.length >= 8 && errors.password) {
			errors.password = '';
		}
	});

	$effect(() => {
		if (userData.password === userData.password_confirm && errors.password_confirm) {
			errors.password_confirm = '';
		}
	});

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

	async function handleSubmit(e) {
		e.preventDefault(); // Always prevent default form submission

		authStore.clearError();

		if (!validateForm()) {
			return;
		}

		loading = true;

		try {
			const result = await authService.register(userData);

			if (result.success) {
				dispatch('success');

				// Store email in local storage for verification page
				if (typeof localStorage !== 'undefined') {
					localStorage.setItem('verification_email', userData.email);
				}

				// Add null checks before navigating
				if (typeof window !== 'undefined') {
					goto('/auth/verify-email');
				}
			}
		} catch (error) {
			console.error('Error during registration:', error);
		} finally {
			loading = false;
		}
	}
</script>

<form on:submit={handleSubmit} class="space-y-6">
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

	<!-- Phone Number and User Type Row -->
	<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
		<Input
			type="tel"
			label="Phone Number"
			bind:value={userData.phone_number}
			placeholder="+1234567890"
			error={errors.phone_number}
			disabled={loading}
		/>

		<Select
			label="Account Type"
			bind:value={userData.user_type}
			options={userTypeOptions}
			error={errors.user_type}
			disabled={loading}
			required
		/>
	</div>

	<!-- Password Requirements Info -->
	<div class="mb-4 text-sm text-gray-600 dark:text-gray-400">
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

	<!-- User Type Explanation -->
	<div class="rounded-md bg-blue-50 p-4 dark:bg-blue-900/30">
		<div class="flex">
			<div class="flex-shrink-0">
				<svg
					class="h-5 w-5 text-blue-400"
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 20 20"
					fill="currentColor"
					aria-hidden="true"
				>
					<path
						fill-rule="evenodd"
						d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
						clip-rule="evenodd"
					/>
				</svg>
			</div>
			<div class="ml-3 flex-1 md:flex md:justify-between">
				<p class="text-sm text-blue-700 dark:text-blue-300">
					<strong>Regular User:</strong> For personal expense tracking<br />
					<strong>Manager:</strong> Can approve expenses and generate reports<br />
					<strong>Administrator:</strong> Has full access to all platform features
				</p>
			</div>
		</div>
	</div>

	<!-- Submit Button -->
	<Button type="submit" variant="primary" fullWidth={true} {loading} disabled={loading}>
		Create Account
	</Button>

	<!-- Login Link -->
	<div class="mt-4 text-center">
		<span class="text-gray-600 dark:text-gray-400">Already have an account?</span>
		<a
			href="/auth/login"
			class="text-primary hover:text-primary-dark dark:text-primary-400 dark:hover:text-primary-300 ml-1"
		>
			Log in
		</a>
	</div>
</form>
