<script>
	import { page } from '$app/stores';
	import Logo from '$lib/components/ui/Logo.svelte';

	export let title = '';
	export let subtitle = '';
</script>

<div class="flex min-h-screen flex-col justify-center bg-gray-50 py-12 sm:px-6 lg:px-8">
	<div class="sm:mx-auto sm:w-full sm:max-w-md">
		<div class="flex justify-center">
			<Logo size="lg" />
		</div>
		<h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
			{title}
		</h2>
		{#if subtitle}
			<p class="mt-2 text-center text-sm text-gray-600">
				{subtitle}
			</p>
		{/if}
	</div>

	<div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
		<div class="bg-white px-4 py-8 shadow sm:rounded-lg sm:px-10">
			<slot />
		</div>

		<div class="mt-6 text-center">
			<slot name="footer" />
		</div>
	</div>
</div>
