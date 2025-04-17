<!--
  Modal Component

  A versatile modal dialog component with:
  - Various sizes and positions
  - Header, body, and footer slots
  - Backdrop click handling
  - ESC key closing
  - Smooth animations
  - Focus trapping
  - Scroll locking
-->
<script lang="ts">
	import { onMount, createEventDispatcher, onDestroy } from 'svelte';
	import { fade, fly, scale } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';

	// Props with Svelte 5 runes
	const {
		// Display options
		open = false,
		title = '',
		size = 'md',
		position = 'center',

		// Behavior options
		closeOnClickOutside = true,
		closeOnEsc = true,
		preventScroll = true,
		closeButtonLabel = 'Close',

		// Animation options
		animation = 'scale',
		duration = 300,

		// Style options
		fullHeight = false,
		maxHeight = '',
		backdropBlur = true,
		showCloseButton = true,
		contentClass = ''
	} = $props();

	// Event dispatcher
	const dispatch = createEventDispatcher<{
		close: void;
		open: void;
	}>();

	// Internal state
	let modalElement = $state<HTMLDivElement | null>(null);
	let contentElement = $state<HTMLDivElement | null>(null);
	let previouslyFocused = $state<Element | null>(null);
	let hasFooterSlot = $state(false);

	// Size classes
	const sizeClasses = {
		xs: 'max-w-xs',
		sm: 'max-w-sm',
		md: 'max-w-md',
		lg: 'max-w-lg',
		xl: 'max-w-xl',
		'2xl': 'max-w-2xl',
		'3xl': 'max-w-3xl',
		'4xl': 'max-w-4xl',
		'5xl': 'max-w-5xl',
		full: 'max-w-full'
	};

	// Position classes
	const positionClasses = {
		center: 'items-center justify-center',
		top: 'items-start justify-center pt-16',
		bottom: 'items-end justify-center pb-16'
	};

	// Animation settings
	const animationProps = $derived({
		duration,
		easing: quintOut
	});

	// Get animation function based on animation prop
	function getAnimation(node: HTMLElement) {
		switch (animation) {
			case 'fade':
				return fade(animationProps);
			case 'fly':
				return fly({ y: -20, ...animationProps });
			case 'scale':
			default:
				return scale({ start: 0.95, opacity: 0, ...animationProps });
		}
	}

	// Handle escape key press
	function handleKeydown(event: KeyboardEvent) {
		if (open && event.key === 'Escape' && closeOnEsc) {
			event.preventDefault();
			closeModal();
		}
	}

	// Close the modal
	function closeModal() {
		dispatch('close');
	}

	// Handle backdrop click
	function handleBackdropClick(event: MouseEvent) {
		if (closeOnClickOutside && event.target === event.currentTarget) {
			closeModal();
		}
	}

	// Focus management
	function setupFocusTrap() {
		if (!modalElement) return;

		// Store previously focused element
		previouslyFocused = document.activeElement;

		// Find all focusable elements
		const focusableElements = modalElement.querySelectorAll(
			'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
		);

		if (focusableElements.length === 0) return;

		const firstElement = focusableElements[0] as HTMLElement;
		const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

		// Focus the first focusable element
		setTimeout(() => {
			firstElement.focus();
		}, 50);

		// Add keydown event listener for tab trapping
		modalElement.addEventListener('keydown', (event) => {
			if (event.key !== 'Tab') return;

			// Trap focus within the modal
			if (event.shiftKey && document.activeElement === firstElement) {
				event.preventDefault();
				lastElement.focus();
			} else if (!event.shiftKey && document.activeElement === lastElement) {
				event.preventDefault();
				firstElement.focus();
			}
		});
	}

	// Scroll locking
	function lockScroll() {
		if (!preventScroll) return;

		// Store current scroll position
		const scrollPosition = window.scrollY;

		// Apply scroll lock to body
		document.body.style.position = 'fixed';
		document.body.style.top = `-${scrollPosition}px`;
		document.body.style.width = '100%';
		document.body.style.overflow = 'hidden';

		// Return function to restore scroll
		return () => {
			document.body.style.position = '';
			document.body.style.top = '';
			document.body.style.width = '';
			document.body.style.overflow = '';
			window.scrollTo(0, scrollPosition);
		};
	}

	// Detect if the footer slot has content
	function checkFooterSlot() {
		if (contentElement) {
			const footerSlot = contentElement.querySelector('slot[name="footer"]');
			hasFooterSlot = !!(footerSlot && footerSlot.assignedNodes().length > 0);
		}
	}

	// Lifecycle hooks
	onMount(() => {
		checkFooterSlot();

		if (open) {
			const unlockScroll = lockScroll();
			setupFocusTrap();
			dispatch('open');

			return () => {
				if (unlockScroll) unlockScroll();
			};
		}
	});

	$effect(() => {
		if (open) {
			const unlockScroll = lockScroll();
			setupFocusTrap();
			dispatch('open');

			return () => {
				if (unlockScroll) unlockScroll();
			};
		}
	});

	onDestroy(() => {
		// Restore focus
		if (previouslyFocused && previouslyFocused instanceof HTMLElement) {
			previouslyFocused.focus();
		}
	});
</script>

<svelte:window on:keydown={handleKeydown} />

{#if open}
	<div
		class="fixed inset-0 z-50 flex overflow-auto p-4
    {positionClasses[position]} {backdropBlur ? 'backdrop-blur-sm' : ''}"
		bind:this={modalElement}
		on:click={handleBackdropClick}
		role="dialog"
		aria-modal="true"
		aria-labelledby={title ? 'modal-title' : undefined}
	>
		<!-- Backdrop -->
		<div class="bg-opacity-50 absolute inset-0 bg-black" transition:fade={{ duration }}></div>

		<!-- Modal content -->
		<div
			class="relative z-10 flex flex-col rounded-lg {sizeClasses[size]} w-full
      bg-white shadow-xl transition-all dark:bg-gray-800 {contentClass}
      {fullHeight ? 'h-full' : ''} {maxHeight ? `max-h-${maxHeight}` : 'max-h-[90vh]'}"
			bind:this={contentElement}
			transition:getAnimation
		>
			<!-- Header -->
			<div
				class="flex items-center justify-between border-b border-gray-200 px-6 py-4 dark:border-gray-700"
			>
				<h3 id="modal-title" class="text-lg font-medium text-gray-900 dark:text-white">
					{#if $$slots.title}
						<slot name="title" />
					{:else}
						{title}
					{/if}
				</h3>

				{#if showCloseButton}
					<button
						type="button"
						class="rounded p-1 text-gray-400 transition-colors hover:bg-gray-100
            hover:text-gray-600 focus:ring-2 focus:ring-gray-500 focus:outline-none
            dark:hover:bg-gray-700 dark:hover:text-gray-200"
						on:click={closeModal}
						aria-label={closeButtonLabel}
					>
						<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M6 18L18 6M6 6l12 12"
							/>
						</svg>
					</button>
				{/if}
			</div>

			<!-- Body with auto-scroll -->
			<div class="flex-1 overflow-auto px-6 py-4">
				<slot />
			</div>

			<!-- Footer (if provided) -->
			{#if $$slots.footer}
				<div class="border-t border-gray-200 px-6 py-4 dark:border-gray-700">
					<slot name="footer" />
				</div>
			{/if}
		</div>
	</div>
{/if}

<style>
	/* Ensure smooth transitions on all properties */
	div {
		backface-visibility: hidden;
		-webkit-font-smoothing: antialiased;
	}
</style>
