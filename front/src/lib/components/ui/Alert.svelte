<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	export let type: 'success' | 'error' | 'warning' | 'info' = 'info';
	export let dismissible: boolean = false;

	const dispatch = createEventDispatcher();

	function dismiss() {
		dispatch('dismiss');
	}

	const typeStyles = {
		success: 'bg-green-50 text-green-800 border-green-200',
		error: 'bg-red-50 text-red-800 border-red-200',
		warning: 'bg-yellow-50 text-yellow-800 border-yellow-200',
		info: 'bg-blue-50 text-blue-800 border-blue-200'
	};

	const iconStyles = {
		success: 'text-green-400',
		error: 'text-red-400',
		warning: 'text-yellow-400',
		info: 'text-blue-400'
	};

	$: alertClass = `${typeStyles[type]} p-4 rounded-md border ${$$props.class || ''}`;
	$: iconClass = iconStyles[type];
</script>

<div role="alert" class={alertClass}>
	<div class="flex items-start">
		<div class="flex-shrink-0">
			{#if type === 'success'}
				<svg
					class={iconClass}
					width="20"
					height="20"
					viewBox="0 0 20 20"
					fill="none"
					xmlns="http://www.w3.org/2000/svg"
				>
					<path
						fill-rule="evenodd"
						clip-rule="evenodd"
						d="M10 18C14.4183 18 18 14.4183 18 10C18 5.58172 14.4183 2 10 2C5.58172 2 2 5.58172 2 10C2 14.4183 5.58172 18 10 18ZM13.7071 9.29289C14.0976 9.68342 14.0976 10.3166 13.7071 10.7071L10.7071 13.7071C10.3166 14.0976 9.68342 14.0976 9.29289 13.7071L7.29289 11.7071C6.90237 11.3166 6.90237 10.6834 7.29289 10.2929C7.68342 9.90237 8.31658 9.90237 8.70711 10.2929L10 11.5858L12.2929 9.29289C12.6834 8.90237 13.3166 8.90237 13.7071 9.29289Z"
						fill="currentColor"
					/>
				</svg>
			{:else if type === 'error'}
				<svg
					class={iconClass}
					width="20"
					height="20"
					viewBox="0 0 20 20"
					fill="none"
					xmlns="http://www.w3.org/2000/svg"
				>
					<path
						fill-rule="evenodd"
						clip-rule="evenodd"
						d="M10 18C14.4183 18 18 14.4183 18 10C18 5.58172 14.4183 2 10 2C5.58172 2 2 5.58172 2 10C2 14.4183 5.58172 18 10 18ZM8.70711 7.29289C8.31658 6.90237 7.68342 6.90237 7.29289 7.29289C6.90237 7.68342 6.90237 8.31658 7.29289 8.70711L8.58579 10L7.29289 11.2929C6.90237 11.6834 6.90237 12.3166 7.29289 12.7071C7.68342 13.0976 8.31658 13.0976 8.70711 12.7071L10 11.4142L11.2929 12.7071C11.6834 13.0976 12.3166 13.0976 12.7071 12.7071C13.0976 12.3166 13.0976 11.6834 12.7071 11.2929L11.4142 10L12.7071 8.70711C13.0976 8.31658 13.0976 7.68342 12.7071 7.29289C12.3166 6.90237 11.6834 6.90237 11.2929 7.29289L10 8.58579L8.70711 7.29289Z"
						fill="currentColor"
					/>
				</svg>
			{:else if type === 'warning'}
				<svg
					class={iconClass}
					width="20"
					height="20"
					viewBox="0 0 20 20"
					fill="none"
					xmlns="http://www.w3.org/2000/svg"
				>
					<path
						fill-rule="evenodd"
						clip-rule="evenodd"
						d="M8.25699 3.09876C9.02121 1.73916 10.9788 1.73916 11.743 3.09876L17.9159 14.0498C18.7023 15.4389 17.7077 17.1 16.173 17.1H3.82701C2.29237 17.1 1.29775 15.4389 2.0841 14.0498L8.25699 3.09876ZM10 6.1C10.5523 6.1 11 6.54772 11 7.1V10.1C11 10.6523 10.5523 11.1 10 11.1C9.44772 11.1 9 10.6523 9 10.1V7.1C9 6.54772 9.44772 6.1 10 6.1ZM10 14.1C10.5523 14.1 11 13.6523 11 13.1C11 12.5477 10.5523 12.1 10 12.1C9.44772 12.1 9 12.5477 9 13.1C9 13.6523 9.44772 14.1 10 14.1Z"
						fill="currentColor"
					/>
				</svg>
			{:else}
				<svg
					class={iconClass}
					width="20"
					height="20"
					viewBox="0 0 20 20"
					fill="none"
					xmlns="http://www.w3.org/2000/svg"
				>
					<path
						fill-rule="evenodd"
						clip-rule="evenodd"
						d="M18 10C18 14.4183 14.4183 18 10 18C5.58172 18 2 14.4183 2 10C2 5.58172 5.58172 2 10 2C14.4183 2 18 5.58172 18 10ZM11 6C11 6.55228 10.5523 7 10 7C9.44772 7 9 6.55228 9 6C9 5.44772 9.44772 5 10 5C10.5523 5 11 5.44772 11 6ZM9 9C8.44772 9 8 9.44772 8 10C8 10.5523 8.44772 11 9 11V14C9 14.5523 9.44772 15 10 15H11C11.5523 15 12 14.5523 12 14C12 13.4477 11.5523 13 11 13V10C11 9.44772 10.5523 9 10 9H9Z"
						fill="currentColor"
					/>
				</svg>
			{/if}
		</div>

		<div class="ml-3 flex-1">
			<div class="text-sm">
				<slot />
			</div>
		</div>

		{#if dismissible}
			<div class="ml-auto pl-3">
				<button
					type="button"
					class="focus:ring-primary inline-flex rounded-md text-gray-400 hover:text-gray-500 focus:ring-2 focus:ring-offset-2 focus:outline-none"
					on:click={dismiss}
				>
					<span class="sr-only">Dismiss</span>
					<svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
						<path
							fill-rule="evenodd"
							d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
							clip-rule="evenodd"
						/>
					</svg>
				</button>
			</div>
		{/if}
	</div>
</div>
