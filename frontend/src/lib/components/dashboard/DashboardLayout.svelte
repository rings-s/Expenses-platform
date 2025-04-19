<script>
	export let title = 'Dashboard';
	export let loading = false;
</script>

<div class="space-y-6">
	{#if loading}
		<div class="flex h-64 items-center justify-center rounded-lg bg-white shadow">
			<div class="h-12 w-12 animate-spin rounded-full border-t-2 border-b-2 border-blue-500"></div>
		</div>
	{:else}
		<slot />
	{/if}
</div>
