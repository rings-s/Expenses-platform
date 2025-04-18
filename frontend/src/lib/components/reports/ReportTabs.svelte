<!-- frontend/src/lib/components/reports/ReportTabs.svelte -->
<script>
	export let activeTab = 'summary';
	export let onTabChange = (tab) => {};

	const tabs = [
		{ id: 'summary', label: 'Summary' },
		{ id: 'by-category', label: 'By Category' },
		{ id: 'trends', label: 'Trends' },
		{ id: 'heatmap', label: 'Heatmap' },
		{ id: 'saved', label: 'Saved Reports' }
	];

	function setActiveTab(tab) {
		onTabChange(tab);
	}
</script>

<nav class="flex flex-wrap">
	{#each tabs as tab}
		<button
			class={`px-4 py-3 text-sm font-medium ${activeTab === tab.id ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
			on:click={() => setActiveTab(tab.id)}
		>
			{tab.label}
		</button>
	{/each}
</nav>
