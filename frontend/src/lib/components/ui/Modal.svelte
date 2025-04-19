<script>
	import { createEventDispatcher } from 'svelte';
	import Button from './Button.svelte';

	export let isOpen = false;
	export let title = '';
	export let size = 'default'; // default, small, large, full

	const dispatch = createEventDispatcher();

	function closeModal() {
		dispatch('close');
	}

	function handleKeydown(event) {
		if (event.key === 'Escape' && isOpen) {
			closeModal();
		}
	}

	// Size classes
	const sizeClasses = {
		small: 'max-w-md',
		default: 'max-w-2xl',
		large: 'max-w-4xl',
		full: 'max-w-full mx-4'
	};

	// Handle outside clicks
	function handleOutsideClick(event) {
		if (event.target === event.currentTarget) {
			closeModal();
		}
	}
</script>

<svelte:window on:keydown={handleKeydown} />

{#if isOpen}
	<div
		class="fixed inset-0 z-50 overflow-y-auto"
		aria-labelledby={title}
		role="dialog"
		aria-modal="true"
	>
		<div
			class="flex min-h-screen items-end justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0"
			on:click={handleOutsideClick}
		>
			<!-- Background overlay -->
			<div
				class="bg-opacity-75 fixed inset-0 bg-gray-500 transition-opacity"
				aria-hidden="true"
			></div>

			<!-- Modal panel -->
			<div
				class="inline-block transform overflow-hidden rounded-lg bg-white text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:align-middle {sizeClasses[
					size
				]}"
			>
				<!-- Header -->
				<div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
					<div class="flex items-center justify-between">
						<h3 class="text-lg leading-6 font-medium text-gray-900" id="modal-title">
							{title}
						</h3>
						<button
							class="rounded-md text-gray-400 hover:text-gray-500 focus:outline-none"
							on:click={closeModal}
						>
							<span class="sr-only">Close</span>
							<svg
								class="h-6 w-6"
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M6 18L18 6M6 6l12 12"
								/>
							</svg>
						</button>
					</div>
				</div>

				<!-- Content -->
				<div class="bg-white px-4 pt-0 pb-4 sm:p-6 sm:pt-0 sm:pb-4">
					<slot />
				</div>

				<!-- Footer -->
				{#if $$slots.footer}
					<div class="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
						<slot name="footer" />
					</div>
				{/if}
			</div>
		</div>
	</div>
{/if}
