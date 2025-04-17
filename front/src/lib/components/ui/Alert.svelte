<!--
  Alert Component

  A versatile alert component for notifications and messages with:
  - Multiple variants (success, error, warning, info)
  - Dismissible option with animation
  - Icons for each variant
  - Customizable appearance
  - Accessibility features
  - Subtle animations
-->
<script lang="ts">
	import { createEventDispatcher, onMount } from 'svelte';
	import { fly, fade } from 'svelte/transition';

	// Props with Svelte 5 runes
	const {
		// Alert type
		type = 'info',

		// Dismissible options
		dismissible = false,
		autoDismiss = false,
		dismissTimeout = 5000,

		// Visual options
		border = 'left',
		rounded = 'md',
		variant = 'light',
		withIcon = true,
		elevated = false,

		// Animation options
		entryAnimation = 'fade',
		exitAnimation = 'fade',

		// Additional styling
		class: className = ''
	} = $props();

	// Internal state
	let visible = $state(true);
	let timer = $state<number | null>(null);

	// Event dispatcher for dismiss events
	const dispatch = createEventDispatcher<{
		dismiss: void;
	}>();

	// Dismiss the alert
	function dismiss() {
		visible = false;
		if (timer) {
			clearTimeout(timer);
			timer = null;
		}
		dispatch('dismiss');
	}

	// Setup auto-dismiss if enabled
	$effect(() => {
		if (autoDismiss && visible) {
			timer = window.setTimeout(() => {
				dismiss();
			}, dismissTimeout);
		}

		return () => {
			if (timer) {
				clearTimeout(timer);
			}
		};
	});

	// Define variant styles for different alert types
	const typeStyles = {
		success: {
			light:
				'bg-green-50 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-200 dark:border-green-800',
			solid: 'bg-green-600 text-white border-green-700 dark:bg-green-700 dark:border-green-800',
			outline:
				'bg-white text-green-700 border-green-500 dark:bg-gray-900 dark:text-green-400 dark:border-green-700'
		},
		error: {
			light:
				'bg-red-50 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-200 dark:border-red-800',
			solid: 'bg-red-600 text-white border-red-700 dark:bg-red-700 dark:border-red-800',
			outline:
				'bg-white text-red-700 border-red-500 dark:bg-gray-900 dark:text-red-400 dark:border-red-700'
		},
		warning: {
			light:
				'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-900/20 dark:text-amber-200 dark:border-amber-800',
			solid: 'bg-amber-500 text-white border-amber-600 dark:bg-amber-600 dark:border-amber-700',
			outline:
				'bg-white text-amber-700 border-amber-500 dark:bg-gray-900 dark:text-amber-400 dark:border-amber-700'
		},
		info: {
			light:
				'bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-200 dark:border-blue-800',
			solid: 'bg-blue-600 text-white border-blue-700 dark:bg-blue-700 dark:border-blue-800',
			outline:
				'bg-white text-blue-700 border-blue-500 dark:bg-gray-900 dark:text-blue-400 dark:border-blue-700'
		}
	};

	// Icon styles for each alert type
	const iconStyles = {
		success: {
			light: 'text-green-500 dark:text-green-400',
			solid: 'text-white/90',
			outline: 'text-green-500 dark:text-green-400'
		},
		error: {
			light: 'text-red-500 dark:text-red-400',
			solid: 'text-white/90',
			outline: 'text-red-500 dark:text-red-400'
		},
		warning: {
			light: 'text-amber-500 dark:text-amber-400',
			solid: 'text-white/90',
			outline: 'text-amber-500 dark:text-amber-400'
		},
		info: {
			light: 'text-blue-500 dark:text-blue-400',
			solid: 'text-white/90',
			outline: 'text-blue-500 dark:text-blue-400'
		}
	};

	// Border styles for different positions
	const borderStyles = {
		none: 'border-0',
		left: 'border-l-4',
		right: 'border-r-4',
		top: 'border-t-4',
		bottom: 'border-b-4',
		all: 'border'
	};

	// Rounded corner styles
	const roundedStyles = {
		none: 'rounded-none',
		sm: 'rounded-sm',
		md: 'rounded-md',
		lg: 'rounded-lg',
		xl: 'rounded-xl',
		full: 'rounded-full'
	};

	// Calculate final classes based on props
	const alertClass = $derived(`
    ${typeStyles[type][variant]}
    ${borderStyles[border]}
    ${roundedStyles[rounded]}
    ${elevated ? 'shadow-md' : ''}
    p-4
    relative
    ${className}
  `);

	const iconClass = $derived(iconStyles[type][variant]);

	// Get appropriate icon based on alert type
	function getIcon(alertType: string) {
		switch (alertType) {
			case 'success':
				return `
          <svg class="${iconClass}" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path fill-rule="evenodd" clip-rule="evenodd" d="M10 18C14.4183 18 18 14.4183 18 10C18 5.58172 14.4183 2 10 2C5.58172 2 2 5.58172 2 10C2 14.4183 5.58172 18 10 18ZM13.7071 9.29289C14.0976 9.68342 14.0976 10.3166 13.7071 10.7071L10.7071 13.7071C10.3166 14.0976 9.68342 14.0976 9.29289 13.7071L7.29289 11.7071C6.90237 11.3166 6.90237 10.6834 7.29289 10.2929C7.68342 9.90237 8.31658 9.90237 8.70711 10.2929L10 11.5858L12.2929 9.29289C12.6834 8.90237 13.3166 8.90237 13.7071 9.29289Z" fill="currentColor"/>
          </svg>
        `;
			case 'error':
				return `
          <svg class="${iconClass}" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path fill-rule="evenodd" clip-rule="evenodd" d="M10 18C14.4183 18 18 14.4183 18 10C18 5.58172 14.4183 2 10 2C5.58172 2 2 5.58172 2 10C2 14.4183 5.58172 18 10 18ZM8.70711 7.29289C8.31658 6.90237 7.68342 6.90237 7.29289 7.29289C6.90237 7.68342 6.90237 8.31658 7.29289 8.70711L8.58579 10L7.29289 11.2929C6.90237 11.6834 6.90237 12.3166 7.29289 12.7071C7.68342 13.0976 8.31658 13.0976 8.70711 12.7071L10 11.4142L11.2929 12.7071C11.6834 13.0976 12.3166 13.0976 12.7071 12.7071C13.0976 12.3166 13.0976 11.6834 12.7071 11.2929L11.4142 10L12.7071 8.70711C13.0976 8.31658 13.0976 7.68342 12.7071 7.29289C12.3166 6.90237 11.6834 6.90237 11.2929 7.29289L10 8.58579L8.70711 7.29289Z" fill="currentColor"/>
          </svg>
        `;
			case 'warning':
				return `
          <svg class="${iconClass}" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path fill-rule="evenodd" clip-rule="evenodd" d="M8.25699 3.09876C9.02121 1.73916 10.9788 1.73916 11.743 3.09876L17.9159 14.0498C18.7023 15.4389 17.7077 17.1 16.173 17.1H3.82701C2.29237 17.1 1.29775 15.4389 2.0841 14.0498L8.25699 3.09876ZM10 6.1C10.5523 6.1 11 6.54772 11 7.1V10.1C11 10.6523 10.5523 11.1 10 11.1C9.44772 11.1 9 10.6523 9 10.1V7.1C9 6.54772 9.44772 6.1 10 6.1ZM10 14.1C10.5523 14.1 11 13.6523 11 13.1C11 12.5477 10.5523 12.1 10 12.1C9.44772 12.1 9 12.5477 9 13.1C9 13.6523 9.44772 14.1 10 14.1Z" fill="currentColor"/>
          </svg>
        `;
			case 'info':
			default:
				return `
          <svg class="${iconClass}" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path fill-rule="evenodd" clip-rule="evenodd" d="M18 10C18 14.4183 14.4183 18 10 18C5.58172 18 2 14.4183 2 10C2 5.58172 5.58172 2 10 2C14.4183 2 18 5.58172 18 10ZM11 6C11 6.55228 10.5523 7 10 7C9.44772 7 9 6.55228 9 6C9 5.44772 9.44772 5 10 5C10.5523 5 11 5.44772 11 6ZM9 9C8.44772 9 8 9.44772 8 10C8 10.5523 8.44772 11 9 11V14C9 14.5523 9.44772 15 10 15H11C11.5523 15 12 14.5523 12 14C12 13.4477 11.5523 13 11 13V10C11 9.44772 10.5523 9 10 9H9Z" fill="currentColor"/>
          </svg>
        `;
		}
	}

	// Calculate transition parameters
	const transitionParams = {
		duration: 300
	};

	// Get the proper entry animation
	function getEntryAnimation() {
		switch (entryAnimation) {
			case 'slide':
				return fly({ y: -20, ...transitionParams });
			case 'fade':
			default:
				return fade(transitionParams);
		}
	}

	// Get the proper exit animation
	function getExitAnimation() {
		switch (exitAnimation) {
			case 'slide':
				return fly({ y: -20, ...transitionParams });
			case 'fade':
			default:
				return fade(transitionParams);
		}
	}
</script>

{#if visible}
	<div
		role="alert"
		class={alertClass}
		in:getEntryAnimation()
		out:getExitAnimation()
		on:mouseenter={() => {
			// Pause auto-dismiss timer on hover
			if (autoDismiss && timer) {
				clearTimeout(timer);
				timer = null;
			}
		}}
		on:mouseleave={() => {
			// Resume auto-dismiss timer on leave
			if (autoDismiss && !timer) {
				timer = window.setTimeout(() => {
					dismiss();
				}, dismissTimeout);
			}
		}}
	>
		<div class="flex items-start">
			{#if withIcon}
				<div class="mt-0.5 flex-shrink-0">
					{@html getIcon(type)}
				</div>
			{/if}

			<div class="ml-3 flex-1">
				<div class={`text-sm ${withIcon ? '' : 'ml-1'}`}>
					<slot />
				</div>
			</div>

			{#if dismissible}
				<div class="ml-auto pl-3">
					<button
						type="button"
						class="focus:ring-opacity-50 inline-flex rounded-md focus:ring-2 focus:ring-offset-2 focus:outline-none focus:ring-${type}-500"
						on:click={dismiss}
						aria-label="Dismiss"
					>
						<span class="sr-only">Dismiss</span>
						<svg
							class="h-5 w-5 opacity-60 transition-opacity duration-200 hover:opacity-100"
							viewBox="0 0 20 20"
							fill="currentColor"
						>
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
{/if}
