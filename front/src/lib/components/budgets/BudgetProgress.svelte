<!--
  BudgetProgress Component

  A visually engaging component for displaying budget progress:
  - Progress bar with color-coded status
  - Budgeted vs actual spending metrics
  - Category information
  - Responsive design with animations
  - Optional action buttons
-->
<script lang="ts">
	import { onMount, createEventDispatcher } from 'svelte';
	import { tweened } from 'svelte/motion';
	import { cubicOut } from 'svelte/easing';
	import { fade, fly, scale } from 'svelte/transition';
	import { formatCurrency } from '$lib/utils/format';
	import { isLightColor } from '$lib/utils/helpers';
	import Button from '$lib/components/ui/Button.svelte';
	import type { Budget } from '$lib/types/expenses';

	// Props with Svelte 5 runes
	const {
		budget = null,
		simplified = false,
		showActions = true,
		showCategoryInfo = true,
		height = 'auto',
		animate = true
	} = $props();

	// State variables
	let isLoading = $state(false);
	let isExpandedView = $state(false);
	let progressColor = $state('');
	let progressTextColor = $state('');
	let remainingTextClass = $state('');

	// Tweened progress value for smooth animation
	const progress = tweened(0, {
		duration: animate ? 800 : 0,
		easing: cubicOut
	});

	// Event dispatcher
	const dispatch = createEventDispatcher<{
		edit: { budget: Budget };
		delete: { budget: Budget };
		click: { budget: Budget };
	}>();

	// Handle edit action
	function handleEdit(event: MouseEvent) {
		event.stopPropagation();
		dispatch('edit', { budget });
	}

	// Handle delete action
	function handleDelete(event: MouseEvent) {
		event.stopPropagation();
		dispatch('delete', { budget });
	}

	// Toggle expanded view
	function toggleExpandedView() {
		isExpandedView = !isExpandedView;
	}

	// Handle click on the component
	function handleClick() {
		dispatch('click', { budget });
	}

	// Determine status color based on percentage
	function updateColors() {
		if (!budget) return;

		// Get percentage or default to 0
		const percentage = budget.percentage_used || 0;

		// Set color based on percentage
		if (percentage >= 100) {
			progressColor = '#ef4444'; // Red - over budget
		} else if (percentage >= 85) {
			progressColor = '#f59e0b'; // Amber - approaching limit
		} else if (percentage >= 70) {
			progressColor = '#f97316'; // Orange - getting closer
		} else {
			progressColor = '#10b981'; // Green - healthy
		}

		// Determine if we need light or dark text
		progressTextColor = isLightColor(progressColor) ? '#000000' : '#ffffff';

		// Determine class for remaining amount text
		if (percentage >= 100) {
			remainingTextClass = 'text-red-600 dark:text-red-400';
		} else if (percentage >= 85) {
			remainingTextClass = 'text-amber-600 dark:text-amber-400';
		} else {
			remainingTextClass = 'text-green-600 dark:text-green-400';
		}
	}

	// Calculate if we're over budget
	const isOverBudget = $derived(budget?.percentage_used ? budget.percentage_used > 100 : false);

	// Calculate the percentage to display
	const displayPercentage = $derived(
		budget?.percentage_used ? Math.min(100, Math.round(budget.percentage_used)) : 0
	);

	// Format the budget amounts
	const formattedBudgeted = $derived(
		budget ? formatCurrency(budget.amount, budget.currency) : '$0.00'
	);

	const formattedSpent = $derived(
		budget && budget.spent_amount !== undefined
			? formatCurrency(budget.spent_amount, budget.currency)
			: '$0.00'
	);

	const formattedRemaining = $derived(
		budget && budget.remaining_amount !== undefined
			? formatCurrency(budget.remaining_amount, budget.currency)
			: '$0.00'
	);

	// Dynamic classes based on status
	const progressBarClass = $derived(
		`h-full rounded-full transition-all duration-500 ${isOverBudget ? 'bg-red-500' : ''}`
	);

	// Initialize the component
	onMount(() => {
		if (budget) {
			updateColors();

			// Animate the progress bar
			progress.set(displayPercentage / 100);
		}
	});

	// Update when budget changes
	$effect(() => {
		if (budget) {
			updateColors();
			progress.set(displayPercentage / 100);
		}
	});
</script>

{#if isLoading}
	<div
		class="flex h-32 items-center justify-center rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800"
		style={height !== 'auto' ? `height: ${height};` : ''}
	>
		<div class="h-8 w-8 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600"></div>
	</div>
{:else if !budget}
	<div
		class="flex h-32 items-center justify-center rounded-lg border border-gray-200 bg-white text-center dark:border-gray-700 dark:bg-gray-800"
		style={height !== 'auto' ? `height: ${height};` : ''}
	>
		<p class="text-gray-500 dark:text-gray-400">No budget data available</p>
	</div>
{:else}
	<div
		class="rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-all duration-300 hover:shadow-md dark:border-gray-700 dark:bg-gray-800 {!simplified
			? 'cursor-pointer'
			: ''}"
		on:click={simplified ? undefined : handleClick}
		style={height !== 'auto' ? `height: ${height};` : ''}
		in:scale={{
			duration: 300,
			delay: 100,
			start: 0.96
		}}
	>
		{#if showCategoryInfo && budget.category_name}
			<div class="mb-2 flex items-center justify-between">
				<div class="flex items-center">
					<div
						class="mr-2 h-3 w-3 rounded-full"
						style={budget.category_color
							? `background-color: ${budget.category_color};`
							: 'background-color: #cccccc;'}
					></div>
					<h3 class="text-sm font-medium text-gray-700 dark:text-gray-300">
						{budget.category_name}
					</h3>
				</div>

				<div class="text-xs font-medium text-gray-500 dark:text-gray-400">
					{budget.period.charAt(0).toUpperCase() + budget.period.slice(1)}
				</div>
			</div>
		{/if}

		<!-- Main budget info -->
		<div class="mb-1 flex items-center justify-between">
			<div>
				<span class="text-sm font-medium text-gray-700 dark:text-gray-300">
					{!showCategoryInfo || !budget.category_name ? 'All Categories' : 'Budget'}
				</span>
			</div>
			<div class="text-sm font-bold">
				{formattedBudgeted}
			</div>
		</div>

		<!-- Progress bar container -->
		<div class="mt-2 h-5 w-full rounded-full bg-gray-200 dark:bg-gray-700">
			<!-- Actual progress bar -->
			<div
				class={progressBarClass}
				style={`width: ${$progress * 100}%; background-color: ${progressColor};`}
				in:scale={{
					duration: 700,
					delay: 200,
					start: 0,
					opacity: 1
				}}
			>
				{#if displayPercentage >= 15}
					<div
						class="flex h-full items-center justify-end px-2 text-xs font-medium"
						style={`color: ${progressTextColor};`}
					>
						{displayPercentage}%
					</div>
				{/if}
			</div>
		</div>

		<!-- Additional details -->
		<div class="mt-2 grid grid-cols-2 gap-2">
			<div>
				<p class="text-xs text-gray-500 dark:text-gray-400">Spent</p>
				<p class="text-sm font-medium text-gray-900 dark:text-white">
					{formattedSpent}
				</p>
			</div>
			<div>
				<p class="text-xs text-gray-500 dark:text-gray-400">Remaining</p>
				<p class="text-sm font-medium {remainingTextClass}">
					{isOverBudget ? '-' : ''}{formattedRemaining}
				</p>
			</div>
		</div>

		<!-- Status badge for simple view -->
		{#if simplified}
			<div class="mt-2 flex justify-end">
				{#if isOverBudget}
					<span
						class="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800 dark:bg-red-900/30 dark:text-red-300"
					>
						Over Budget
					</span>
				{:else if displayPercentage >= 85}
					<span
						class="inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
					>
						Near Limit
					</span>
				{:else if displayPercentage >= 50}
					<span
						class="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
					>
						In Progress
					</span>
				{:else}
					<span
						class="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900/30 dark:text-green-300"
					>
						On Track
					</span>
				{/if}
			</div>
		{/if}

		<!-- Extended details section -->
		{#if !simplified && isExpandedView}
			<div
				class="mt-4 rounded-md bg-gray-50 p-3 dark:bg-gray-700/50"
				transition:slide={{ duration: 200 }}
			>
				<div class="grid grid-cols-2 gap-4">
					<div>
						<p class="text-xs text-gray-500 dark:text-gray-400">Start Date</p>
						<p class="text-sm font-medium text-gray-900 dark:text-white">
							{new Date(budget.start_date).toLocaleDateString()}
						</p>
					</div>
					<div>
						<p class="text-xs text-gray-500 dark:text-gray-400">Created</p>
						<p class="text-sm font-medium text-gray-900 dark:text-white">
							{new Date(budget.created_at).toLocaleDateString()}
						</p>
					</div>
				</div>
			</div>
		{/if}

		<!-- Action buttons -->
		{#if showActions && !simplified}
			<div class="mt-4 flex justify-between">
				<Button variant="ghost" size="xs" on:click={toggleExpandedView}>
					{isExpandedView ? 'Less details' : 'More details'}
				</Button>

				<div class="flex space-x-2">
					<Button
						variant="secondary"
						size="xs"
						on:click={handleEdit}
						icon={`<svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>`}
					>
						Edit
					</Button>

					<Button
						variant="danger"
						size="xs"
						on:click={handleDelete}
						icon={`<svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>`}
					>
						Delete
					</Button>
				</div>
			</div>
		{/if}
	</div>
{/if}

<style>
	/* Subtle animations */
	.hover\:shadow-md {
		transition: all 0.3s ease;
	}

	.hover\:shadow-md:hover {
		transform: translateY(-2px);
	}

	/* Smooth progress bar animation */
	.h-full {
		transition: width 0.8s ease-out;
	}
</style>
