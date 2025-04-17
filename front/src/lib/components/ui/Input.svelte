<script lang="ts">
	export let type: string = 'text';
	export let label: string = '';
	export let value: string = '';
	export let placeholder: string = '';
	export let disabled: boolean = false;
	export let required: boolean = false;
	export let error: string | undefined = undefined;
	export let id: string = `input-${Math.random().toString(36).slice(2, 11)}`;

	$: hasError = !!error;
</script>

<div>
	{#if label}
		<label for={id} class="mb-1 block text-sm font-medium text-gray-700">
			{label}
			{#if required}
				<span class="text-red-500">*</span>
			{/if}
		</label>
	{/if}

	<input
		{id}
		{type}
		bind:value
		{placeholder}
		{disabled}
		{required}
		class="focus:ring-primary focus:border-primary w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none
      {hasError ? 'border-red-500' : 'border-gray-300'}"
		aria-invalid={hasError}
		aria-errormessage={hasError ? `${id}-error` : undefined}
		{...$$restProps}
	/>

	{#if hasError}
		<p id="{id}-error" class="mt-1 text-sm text-red-600">{error}</p>
	{/if}
</div>
