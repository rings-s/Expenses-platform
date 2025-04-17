import { redirect } from '@sveltejs/kit';
import type { LayoutLoad } from './$types';
import { authStore } from '$lib/stores/auth';
import { browser } from '$app/environment';

export const load: LayoutLoad = async ({ url }) => {
	// This guards all routes under this layout to ensure they're only accessible to authenticated users
	let isAuthenticated = false;
	let isLoading = true;
	let user = null;

	const unsubscribe = authStore.subscribe((auth) => {
		isAuthenticated = auth.isAuthenticated;
		isLoading = auth.isLoading;
		user = auth.user;
	});

	unsubscribe();

	// Wait for auth to finish loading before deciding to redirect
	if (!isLoading && !isAuthenticated) {
		// Store the current URL so we can redirect back after login
		const returnUrl = encodeURIComponent(url.pathname + url.search);
		throw redirect(302, `/auth/login?redirect=${returnUrl}`);
	}

	// Check email verification if required
	if (!isLoading && isAuthenticated && user && !user.email_verified) {
		// If the route is not in the verification-exempt list, redirect to verification page
		const exemptPaths = [
			'/verify-email',
			'/request-verification',
			'/profile',
			'/auth/verify-email',
			'/auth/request-verification'
		];

		const currentPath = url.pathname;

		if (!exemptPaths.some((path) => currentPath.includes(path))) {
			throw redirect(302, '/auth/request-verification?unverified=true');
		}
	}

	return {
		user
	};
};
