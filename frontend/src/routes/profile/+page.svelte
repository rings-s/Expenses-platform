<script>
	import { onMount } from 'svelte';
	import AppLayout from '$lib/components/layout/AppLayout.svelte';
	import { userStore } from '$lib/stores/userStore';
	import FormField from '$lib/components/ui/FormField.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Alert from '$lib/components/ui/Alert.svelte';
	import { fileToDataUrl } from '$lib/utils/formatters';

	let formData = {
		username: '',
		first_name: '',
		last_name: '',
		phone_number: '',
		bio: ''
	};

	let profileImage = null;
	let profileImagePreview = null;
	let isLoading = false;
	let isSaving = false;
	let error = null;
	let successMessage = null;

	onMount(async () => {
		isLoading = true;

		try {
			// Load user profile
			const profile = await userStore.loadProfile();

			// Populate form data
			formData = {
				username: profile.username || '',
				first_name: profile.first_name || '',
				last_name: profile.last_name || '',
				phone_number: profile.phone_number || '',
				bio: profile.bio || ''
			};

			if (profile.profile_image) {
				profileImagePreview = profile.profile_image;
			}
		} catch (err) {
			error = err.message || 'Failed to load profile';
		} finally {
			isLoading = false;
		}
	});

	async function handleImageChange(event) {
		const file = event.target.files[0];
		if (!file) return;

		// Check file type
		if (!file.type.match('image.*')) {
			error = 'Please select an image file';
			return;
		}

		// Check file size (max 5MB)
		if (file.size > 5 * 1024 * 1024) {
			error = 'Image size must be less than 5MB';
			return;
		}

		try {
			profileImage = file;
			profileImagePreview = await fileToDataUrl(file);
		} catch (err) {
			error = 'Failed to load image';
		}
	}

	async function handleSubmit() {
		error = null;
		successMessage = null;
		isSaving = true;

		try {
			// Create FormData to handle file upload
			const data = new FormData();

			// Add form fields
			Object.entries(formData).forEach(([key, value]) => {
				if (value !== null && value !== undefined) {
					data.append(key, value);
				}
			});

			// Add profile image if selected
			if (profileImage) {
				data.append('profile_image', profileImage);
			}

			// Update profile
			await userStore.updateProfile(formData);

			successMessage = 'Profile updated successfully';
		} catch (err) {
			error = err.message || 'Failed to update profile';
		} finally {
			isSaving = false;
		}
	}
</script>

<svelte:head>
	<title>Profile - Expensis</title>
</svelte:head>

<AppLayout title="Profile">
	{#if isLoading}
		<div class="flex justify-center items-center h-64">
			<div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
		</div>
	{:else}
		<div class="bg-white shadow rounded-lg overflow-hidden">
			<div class="md:grid md:grid-cols-3 md:gap-6">
				<!-- Profile image section -->
				<div class="md:col-span-1 bg-gray-50 px-4 py-6">
					<h3 class="text-lg font-medium leading-6 text-gray-900">Profile Picture</h3>
					<p class="mt-1 text-sm text-gray-500">
						This information will be displayed publicly so be careful what you share.
					</p>

					<div class="mt-6">
						<div class="flex flex-col items-center">
							<div class="h-40 w-40 relative rounded-full overflow-hidden bg-gray-100">
								{#if profileImagePreview}
									<img src={profileImagePreview} alt="Profile" class="h-full w-full object-cover" />
								{:else}
									<div
										class="h-full w-full flex items-center justify-center bg-blue-100 text-blue-700 text-4xl font-bold"
									>
										{$userStore.profile?.first_name?.charAt(0) ||
											$userStore.profile?.username?.charAt(0) ||
											'U'}
									</div>
								{/if}
							</div>

							<label
								class="mt-4 w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer"
							>
								<span>Change picture</span>
								<input type="file" accept="image/*" on:change={handleImageChange} class="sr-only" />
							</label>
						</div>

						<div class="mt-4 text-center text-sm text-gray-500">JPG, GIF or PNG. Max size 5MB.</div>
					</div>
				</div>

				<!-- Form section -->
				<div class="mt-5 md:mt-0 md:col-span-2">
					<form on:submit|preventDefault={handleSubmit}>
						<div class="px-4 py-5 bg-white space-y-6 sm:p-6">
							{#if error}
								<Alert type="error">{error}</Alert>
							{/if}

							{#if successMessage}
								<Alert type="success">{successMessage}</Alert>
							{/if}

							<div class="grid grid-cols-6 gap-6">
								<div class="col-span-6 sm:col-span-3">
									<FormField
										label="First Name"
										name="first_name"
										bind:value={formData.first_name}
									/>
								</div>

								<div class="col-span-6 sm:col-span-3">
									<FormField label="Last Name" name="last_name" bind:value={formData.last_name} />
								</div>

								<div class="col-span-6 sm:col-span-4">
									<FormField label="Username" name="username" bind:value={formData.username} />
								</div>

								<div class="col-span-6 sm:col-span-4">
									<FormField
										label="Email Address"
										type="email"
										name="email"
										value={$userStore.profile?.email || ''}
										disabled={true}
									/>
								</div>

								<div class="col-span-6 sm:col-span-4">
									<FormField
										label="Phone Number"
										name="phone_number"
										bind:value={formData.phone_number}
									/>
								</div>

								<div class="col-span-6">
									<label for="bio" class="block text-sm font-medium text-gray-700"> Bio </label>
									<div class="mt-1">
										<textarea
											id="bio"
											name="bio"
											rows="3"
											bind:value={formData.bio}
											class="shadow-sm focus:ring-blue-500 focus:border-blue-500 mt-1 block w-full sm:text-sm border border-gray-300 rounded-md p-2"
											placeholder="Brief description for your profile"
										></textarea>
									</div>
									<p class="mt-2 text-sm text-gray-500">Brief description for your profile.</p>
								</div>
							</div>
						</div>

						<div class="px-4 py-3 bg-gray-50 text-right sm:px-6">
							<Button type="submit" variant="primary" loading={isSaving}>Save Changes</Button>
						</div>
					</form>
				</div>
			</div>
		</div>

		<!-- Account Settings Section -->
		<div class="bg-white shadow rounded-lg overflow-hidden mt-10">
			<div class="px-4 py-5 sm:px-6">
				<h3 class="text-lg leading-6 font-medium text-gray-900">Account Settings</h3>
				<p class="mt-1 max-w-2xl text-sm text-gray-500">
					Manage your account settings and security.
				</p>
			</div>

			<div class="border-t border-gray-200 px-4 py-5 sm:p-6">
				<div class="space-y-6">
					<div>
						<h4 class="text-md font-medium text-gray-900">Email Verification</h4>
						<div class="mt-2 flex items-center">
							{#if $userStore.profile?.email_verified}
								<span
									class="inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium bg-green-100 text-green-800"
								>
									Verified
								</span>
							{:else}
								<span
									class="inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium bg-yellow-100 text-yellow-800"
								>
									Not Verified
								</span>
								<button type="button" class="ml-4 text-sm text-blue-600 hover:text-blue-500">
									Resend verification email
								</button>
							{/if}
						</div>
					</div>

					<div>
						<h4 class="text-md font-medium text-gray-900">Password</h4>
						<div class="mt-2">
							<a
								href="/change-password"
								class="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
							>
								Change Password
							</a>
						</div>
					</div>

					<div>
						<h4 class="text-md font-medium text-gray-900">Account Type</h4>
						<div class="mt-2">
							<span
								class="inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium bg-blue-100 text-blue-800"
							>
								{$userStore.profile?.user_type === 'admin'
									? 'Administrator'
									: $userStore.profile?.user_type === 'manager'
										? 'Manager'
										: 'Regular User'}
							</span>
						</div>
					</div>

					<div>
						<h4 class="text-md font-medium text-gray-900">Delete Account</h4>
						<div class="mt-2">
							<button
								type="button"
								class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
							>
								Delete My Account
							</button>
							<p class="mt-1 text-sm text-gray-500">
								This action cannot be undone. All of your data will be permanently removed.
							</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	{/if}
</AppLayout>
