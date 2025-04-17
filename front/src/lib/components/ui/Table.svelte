<!--
  Table Component

  A comprehensive table component with:
  - Sortable columns
  - Column resizing
  - Row selection
  - Pagination
  - Loading states
  - Empty state handling
  - Responsive design
  - Customizable styling
  - Accessibility features
-->
<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	// Types
	export type ColumnDefinition<T = any> = {
		id: string;
		header: string;
		accessor?: keyof T | ((row: T) => any);
		cell?: (row: T) => string | HTMLElement | null;
		sortable?: boolean;
		sortFn?: (a: T, b: T) => number;
		width?: string;
		minWidth?: string;
		maxWidth?: string;
		align?: 'left' | 'center' | 'right';
		class?: string;
		headerClass?: string;
		cellClass?: string;
		visible?: boolean;
	};

	// Props with Svelte 5 runes
	const {
		// Data and columns
		data = [],
		columns = [],

		// Styling
		variant = 'default',
		size = 'md',
		striped = true,
		hoverable = true,
		bordered = false,
		highlightSelected = true,

		// Features
		sortable = true,
		selectable = false,
		multiSelect = false,
		resizable = false,

		// Loading and empty states
		loading = false,
		loadingText = 'Loading data...',
		emptyText = 'No data available',

		// Pagination
		paginated = false,
		page = 1,
		pageSize = 10,
		totalItems = 0,
		showPageSizeSelector = false,
		pageSizeOptions = [10, 25, 50, 100],

		// Initial state
		initialSortColumn = '',
		initialSortDirection = 'asc',

		// Additional styling
		class: className = '',
		containerClass = '',
		headerClass = '',
		bodyClass = '',
		rowClass = '',
		footerClass = ''
	} = $props();

	// Event dispatcher
	const dispatch = createEventDispatcher<{
		rowClick: { row: any; index: number };
		rowSelect: { rows: any[]; indexes: number[] };
		sort: { column: string; direction: 'asc' | 'desc' };
		pageChange: { page: number };
		pageSizeChange: { pageSize: number };
	}>();

	// Internal state
	let sortColumn = $state(initialSortColumn);
	let sortDirection = $state<'asc' | 'desc'>(initialSortDirection as 'asc' | 'desc');
	let selectedRows = $state<number[]>([]);
	let selectAll = $state(false);
	let columnWidths = $state<Record<string, string>>({});
	let resizingColumn = $state<string | null>(null);
	let startX = $state(0);
	let startWidth = $state(0);

	// Size classes
	const sizeClasses = {
		sm: 'text-xs',
		md: 'text-sm',
		lg: 'text-base'
	};

	// Cell padding classes by size
	const paddingClasses = {
		sm: 'px-2 py-1',
		md: 'px-3 py-2',
		lg: 'px-4 py-3'
	};

	// Variant classes
	const variantClasses = {
		default: 'bg-white dark:bg-gray-800',
		striped: 'bg-white dark:bg-gray-800',
		bordered: 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700',
		compact: 'bg-white dark:bg-gray-800'
	};

	// Get derived visible columns
	$derived.columns = columns.filter((col) => col.visible !== false);

	// Handle row selection
	function toggleRowSelection(index: number, event?: MouseEvent) {
		if (!selectable) return;

		if (multiSelect && event?.shiftKey && selectedRows.length > 0) {
			// Range selection with shift key
			const lastSelected = selectedRows[selectedRows.length - 1];
			const start = Math.min(lastSelected, index);
			const end = Math.max(lastSelected, index);

			// Create array of indexes in the range
			const newSelection = Array.from({ length: end - start + 1 }, (_, i) => start + i);

			// Add to existing selection, avoiding duplicates
			selectedRows = [...new Set([...selectedRows, ...newSelection])];
		} else if (multiSelect && event?.ctrlKey) {
			// Toggle selection with ctrl/cmd key
			if (selectedRows.includes(index)) {
				selectedRows = selectedRows.filter((i) => i !== index);
			} else {
				selectedRows = [...selectedRows, index];
			}
		} else {
			// Single selection
			selectedRows =
				selectedRows.includes(index) && multiSelect
					? selectedRows.filter((i) => i !== index)
					: [index];
		}

		// Dispatch selected rows
		const selectedData = selectedRows.map((i) => data[i]);
		dispatch('rowSelect', { rows: selectedData, indexes: selectedRows });
	}

	// Handle "select all" action
	function toggleSelectAll() {
		if (selectAll) {
			selectedRows = [];
		} else {
			selectedRows = Array.from({ length: data.length }, (_, i) => i);
		}

		selectAll = !selectAll;

		// Dispatch selected rows
		const selectedData = selectedRows.map((i) => data[i]);
		dispatch('rowSelect', { rows: selectedData, indexes: selectedRows });
	}

	// Handle column sorting
	function handleSort(column: ColumnDefinition) {
		if (!sortable || column.sortable === false) return;

		if (sortColumn === column.id) {
			// Toggle direction if already sorting by this column
			sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
		} else {
			// Set new sort column and default to ascending
			sortColumn = column.id;
			sortDirection = 'asc';
		}

		dispatch('sort', { column: sortColumn, direction: sortDirection });
	}

	// Handle row click
	function handleRowClick(row: any, index: number) {
		dispatch('rowClick', { row, index });

		// If selectable, also toggle selection
		if (selectable) {
			toggleRowSelection(index);
		}
	}

	// Handle page change
	function changePage(newPage: number) {
		if (newPage < 1 || newPage > totalPages) return;
		dispatch('pageChange', { page: newPage });
	}

	// Handle page size change
	function changePageSize(event: Event) {
		const select = event.target as HTMLSelectElement;
		const newSize = parseInt(select.value, 10);
		dispatch('pageSizeChange', { pageSize: newSize });
	}

	// Column resizing handlers
	function startResize(columnId: string, event: MouseEvent) {
		if (!resizable) return;

		resizingColumn = columnId;
		startX = event.clientX;

		const colWidth = columnWidths[columnId] || 'auto';
		startWidth =
			colWidth === 'auto'
				? (event.target as HTMLElement).parentElement?.offsetWidth || 100
				: parseInt(colWidth, 10);

		// Add event listeners
		window.addEventListener('mousemove', handleMouseMove);
		window.addEventListener('mouseup', stopResize);

		event.preventDefault();
	}

	function handleMouseMove(event: MouseEvent) {
		if (!resizingColumn) return;

		const diff = event.clientX - startX;
		const newWidth = Math.max(50, startWidth + diff); // Minimum width of 50px

		columnWidths = {
			...columnWidths,
			[resizingColumn]: `${newWidth}px`
		};
	}

	function stopResize() {
		resizingColumn = null;
		window.removeEventListener('mousemove', handleMouseMove);
		window.removeEventListener('mouseup', stopResize);
	}

	// Helper to get cell value
	function getCellValue(row: any, column: ColumnDefinition) {
		if (column.cell) {
			return column.cell(row);
		}

		if (column.accessor) {
			if (typeof column.accessor === 'function') {
				return column.accessor(row);
			}
			return row[column.accessor];
		}

		return '';
	}

	// Get pagination info
	const totalPages = $derived(Math.max(1, Math.ceil(totalItems / pageSize)));
	const showingFrom = $derived(paginated ? (page - 1) * pageSize + 1 : 1);
	const showingTo = $derived(paginated ? Math.min(page * pageSize, totalItems) : data.length);

	// Get cell alignment class
	function getAlignClass(align: 'left' | 'center' | 'right' = 'left') {
		switch (align) {
			case 'center':
				return 'text-center';
			case 'right':
				return 'text-right';
			default:
				return 'text-left';
		}
	}

	// Check if a column is the current sort column
	function isSortColumn(columnId: string) {
		return sortColumn === columnId;
	}

	// Get the visible data based on pagination
	const visibleData = $derived(
		paginated ? data.slice((page - 1) * pageSize, page * pageSize) : data
	);
</script>

<div class={`overflow-x-auto ${containerClass}`}>
	<table
		class={`w-full border-collapse ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
	>
		<thead class={`bg-gray-50 dark:bg-gray-700 ${headerClass}`}>
			<tr>
				<!-- Selection column -->
				{#if selectable}
					<th class={`${paddingClasses[size]} w-10 font-semibold text-gray-800 dark:text-gray-200`}>
						{#if multiSelect}
							<input
								type="checkbox"
								checked={selectAll}
								on:change={toggleSelectAll}
								class="form-checkbox h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
							/>
						{/if}
					</th>
				{/if}

				<!-- Data columns -->
				{#each $columns as column, i}
					<th
						class={`${paddingClasses[size]} font-semibold text-gray-800 dark:text-gray-200
              ${getAlignClass(column.align)} ${column.headerClass || ''}`}
						style={columnWidths[column.id]
							? `width: ${columnWidths[column.id]};`
							: column.width
								? `width: ${column.width};`
								: ''}
					>
						<div class="group flex items-center justify-between">
							<button
								class={`flex flex-1 items-center ${sortable && column.sortable !== false ? 'cursor-pointer hover:text-gray-600 dark:hover:text-gray-300' : ''}`}
								on:click={() => handleSort(column)}
								disabled={!sortable || column.sortable === false}
								tabindex={!sortable || column.sortable === false ? -1 : 0}
							>
								<span>{column.header}</span>

								{#if sortable && column.sortable !== false && isSortColumn(column.id)}
									<span class="ml-1">
										{#if sortDirection === 'asc'}
											<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path
													stroke-linecap="round"
													stroke-linejoin="round"
													stroke-width="2"
													d="M5 15l7-7 7 7"
												/>
											</svg>
										{:else}
											<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path
													stroke-linecap="round"
													stroke-linejoin="round"
													stroke-width="2"
													d="M19 9l-7 7-7-7"
												/>
											</svg>
										{/if}
									</span>
								{/if}
							</button>

							{#if resizable && i < $columns.length - 1}
								<div
									class="h-5 w-1 cursor-col-resize bg-gray-300 opacity-0 transition-opacity duration-200 group-hover:opacity-100 dark:bg-gray-600"
									on:mousedown={(e) => startResize(column.id, e)}
								></div>
							{/if}
						</div>
					</th>
				{/each}
			</tr>
		</thead>

		<tbody class={bodyClass}>
			{#if loading}
				<!-- Loading state -->
				<tr>
					<td
						class="p-4 text-center text-gray-500 dark:text-gray-400"
						colspan={selectable ? $columns.length + 1 : $columns.length}
					>
						<div class="flex items-center justify-center space-x-2">
							<svg
								class="h-5 w-5 animate-spin text-blue-500"
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 24 24"
							>
								<circle
									class="opacity-25"
									cx="12"
									cy="12"
									r="10"
									stroke="currentColor"
									stroke-width="4"
								></circle>
								<path
									class="opacity-75"
									fill="currentColor"
									d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
								></path>
							</svg>
							<span>{loadingText}</span>
						</div>
					</td>
				</tr>
			{:else if visibleData.length === 0}
				<!-- Empty state -->
				<tr>
					<td
						class="p-4 text-center text-gray-500 dark:text-gray-400"
						colspan={selectable ? $columns.length + 1 : $columns.length}
					>
						{emptyText}
					</td>
				</tr>
			{:else}
				<!-- Data rows -->
				{#each visibleData as row, i}
					{@const rowIndex = paginated ? (page - 1) * pageSize + i : i}
					{@const isSelected = selectedRows.includes(rowIndex)}
					<tr
						class={`
              ${hoverable ? 'hover:bg-gray-50 dark:hover:bg-gray-700/50' : ''}
              ${striped && i % 2 === 1 ? 'bg-gray-50/50 dark:bg-gray-800/50' : ''}
              ${isSelected && highlightSelected ? 'bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/30' : ''}
              ${bordered ? 'border-t border-gray-200 dark:border-gray-700' : ''}
              ${rowClass}
              transition-colors duration-150
            `}
						on:click={() => handleRowClick(row, rowIndex)}
					>
						{#if selectable}
							<td class={paddingClasses[size]}>
								<input
									type="checkbox"
									checked={isSelected}
									on:click={(e) => e.stopPropagation()}
									on:change={(e) => toggleRowSelection(rowIndex, e)}
									class="form-checkbox h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
								/>
							</td>
						{/if}

						{#each $columns as column}
							<td
								class={`${paddingClasses[size]} text-gray-700 dark:text-gray-300
                  ${getAlignClass(column.align)} ${column.cellClass || ''}`}
							>
								{getCellValue(row, column)}
							</td>
						{/each}
					</tr>
				{/each}
			{/if}
		</tbody>

		{#if paginated}
			<tfoot class={`bg-gray-50 dark:bg-gray-700 ${footerClass}`}>
				<tr>
					<td colspan={selectable ? $columns.length + 1 : $columns.length} class="px-4 py-3">
						<div class="flex flex-col sm:flex-row sm:items-center sm:justify-between">
							<!-- Pagination info -->
							<div class="text-sm text-gray-700 dark:text-gray-300">
								Showing <span class="font-medium">{showingFrom}</span> to
								<span class="font-medium">{showingTo}</span>
								of <span class="font-medium">{totalItems}</span> results
							</div>

							<!-- Pagination controls -->
							<div class="mt-2 flex items-center space-x-2 sm:mt-0">
								{#if showPageSizeSelector}
									<select
										class="rounded-md border-gray-300 py-1 pr-8 pl-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300"
										value={pageSize}
										on:change={changePageSize}
									>
										{#each pageSizeOptions as size}
											<option value={size}>{size} per page</option>
										{/each}
									</select>
								{/if}

								<nav class="flex items-center space-x-1">
									<!-- First page -->
									<button
										class="rounded p-1 text-gray-500 hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50 dark:text-gray-400 dark:hover:bg-gray-600"
										disabled={page === 1}
										on:click={() => changePage(1)}
										aria-label="First page"
									>
										<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path
												stroke-linecap="round"
												stroke-linejoin="round"
												stroke-width="2"
												d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
											/>
										</svg>
									</button>

									<!-- Previous page -->
									<button
										class="rounded p-1 text-gray-500 hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50 dark:text-gray-400 dark:hover:bg-gray-600"
										disabled={page === 1}
										on:click={() => changePage(page - 1)}
										aria-label="Previous page"
									>
										<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path
												stroke-linecap="round"
												stroke-linejoin="round"
												stroke-width="2"
												d="M15 19l-7-7 7-7"
											/>
										</svg>
									</button>

									<!-- Page info -->
									<span class="px-2 text-sm text-gray-700 dark:text-gray-300">
										{page} / {totalPages}
									</span>

									<!-- Next page -->
									<button
										class="rounded p-1 text-gray-500 hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50 dark:text-gray-400 dark:hover:bg-gray-600"
										disabled={page === totalPages}
										on:click={() => changePage(page + 1)}
										aria-label="Next page"
									>
										<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path
												stroke-linecap="round"
												stroke-linejoin="round"
												stroke-width="2"
												d="M9 5l7 7-7 7"
											/>
										</svg>
									</button>

									<!-- Last page -->
									<button
										class="rounded p-1 text-gray-500 hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50 dark:text-gray-400 dark:hover:bg-gray-600"
										disabled={page === totalPages}
										on:click={() => changePage(totalPages)}
										aria-label="Last page"
									>
										<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path
												stroke-linecap="round"
												stroke-linejoin="round"
												stroke-width="2"
												d="M13 5l7 7-7 7M5 5l7 7-7 7"
											/>
										</svg>
									</button>
								</nav>
							</div>
						</div>
					</td>
				</tr>
			</tfoot>
		{/if}
	</table>
</div>

<style>
	/* Better table styling */
	table {
		border-spacing: 0;
	}

	th {
		text-transform: uppercase;
		letter-spacing: 0.05em;
		font-weight: 600;
		transition: background-color 0.2s;
	}

	/* Improve accessibility with focus styles */
	button:focus-visible {
		outline: 2px solid #3b82f6;
		outline-offset: 2px;
	}
</style>
