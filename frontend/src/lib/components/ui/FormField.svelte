<script>
	export let label = '';
	export let type = 'text';
	export let name = '';
	export let value = '';
	export let placeholder = '';
	export let required = false;
	export let error = '';
	export let disabled = false;

	function handleInput(e) {
		value = type === 'number' ? Number(e.target.value) : e.target.value;
	}
</script>

<div class="mb-4">
	{#if label}
		<label for={name} class="block text-sm font-medium text-gray-700 mb-1">
			{label}
			{required ? '*' : ''}
		</label>
	{/if}

	<input
		{type}
		id={name}
		{name}
		{placeholder}
		{disabled}
		{required}
		value={value || ''}
		on:input={handleInput}
		class="appearance-none rounded-md relative block w-full px-3 py-2 border {error
			? 'border-red-300'
			: 'border-gray-300'} placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm {disabled
			? 'bg-gray-100'
			: ''}"
		aria-invalid={!!error}
		aria-describedby={error ? `${name}-error` : undefined}
	/>

	{#if error}
		<p class="mt-1 text-sm text-red-600" id="{name}-error">{error}</p>
	{/if}
</div>
