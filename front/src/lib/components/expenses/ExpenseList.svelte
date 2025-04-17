<!--
  Expense List Component

  A feature-rich expense list with:
  - Selectable items
  - Sorting functionality
  - Category color coding
  - Amount formatting
  - Pagination controls
  - Loading states
  - Empty state handling
-->
<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { fly, fade } from 'svelte/transition';
  import { formatCurrency, formatDate, DateFormat } from '$lib/utils/format';
  import { PAYMENT_METHOD_LABELS } from '$lib/types/expenses';
  import { categories, categoryMap } from '$lib/stores/categories';
  import type { Expense } from '$lib/types/expenses';
  import Button from '$lib/components/ui/Button.svelte';
  import Alert from '$lib/components/ui/Alert.svelte';

  // Props with Svelte 5 runes
  const {
    // Expenses data
    expenses = [],
    // Loading state
    loading = false,
    // Error message
    error = null,
    // Pagination
    currentPage = 1,
    totalPages = 1,
    // Selection
    selectedExpenseId = null,
    selectable = true,
    // Date format
    dateFormat = DateFormat.MEDIUM,
    // Additional configuration
    showActions = true,
    showPagination = true,
    miniView = false,
    limit = undefined
  } = $props<{
    expenses: Expense[];
    loading?: boolean;
    error?: string | null;
    currentPage?: number;
    totalPages?: number;
    selectedExpenseId?: string | null;
    selectable?: boolean;
    dateFormat?: DateFormat;
    showActions?: boolean;
    showPagination?: boolean;
    miniView?: boolean;
    limit?: number;
  }>();

  // Event dispatcher
  const dispatch = createEventDispatcher<{
    select: Expense;
    edit: Expense;
    delete: Expense;
    paginate: number;
    sort: { field: string; direction: 'asc' | 'desc' };
  }>();

  // Internal state
  let sortField = $state('date');
  let sortDirection = $state<'asc' | 'desc'>('desc');
  let sortedExpenses = $derived(getSortedExpenses());
  let displayExpenses = $derived(
    limit ? sortedExpenses.slice(0, limit) : sortedExpenses
  );

  // Handle item selection
  function selectExpense(expense: Expense) {
    if (selectable) {
      dispatch('select', expense);
    }
  }

  // Handle edit button click
  function editExpense(expense: Expense, event: Event) {
    event.stopPropagation();
    dispatch('edit', expense);
  }

  // Handle delete button click
  function deleteExpense(expense: Expense, event: Event) {
    event.stopPropagation();
    dispatch('delete', expense);
  }

  // Handle pagination
  function changePage(page: number) {
    if (page >= 1 && page <= totalPages) {
      dispatch('paginate', page);
    }
  }

  // Handle sorting
  function sortBy(field: string) {
    // If clicking the current sort field, toggle direction
    if (field === sortField) {
      sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      // Otherwise, set new field and default to descending
      sortField = field;
      sortDirection = 'desc';
    }

    dispatch('sort', { field: sortField, direction: sortDirection });
  }

  // Get sorted expenses based on sort field and direction
  function getSortedExpenses(): Expense[] {
    // Return the expenses as is if empty or loading (sorting will be handled by API)
    if (!expenses.length || loading) return expenses;

    return [...expenses].sort((a, b) => {
      let valA, valB;

      // Handle different field types
      if (sortField === 'date') {
        valA = new Date(a.date).getTime();
        valB = new Date(b.date).getTime();
      } else if (sortField === 'amount') {
        valA = a.amount;
        valB = b.amount;
      } else if (sortField === 'category') {
        valA = a.category_name || 'Uncategorized';
        valB = b.category_name || 'Uncategorized';
      } else {
        valA = a[sortField as keyof Expense];
        valB = b[sortField as keyof Expense];
      }

      // String comparison for string values
      if (typeof valA === 'string' && typeof valB === 'string') {
        return sortDirection === 'asc'
          ? valA.localeCompare(valB)
          : valB.localeCompare(valA);
      }

      // Number comparison for numeric values
      return sortDirection === 'asc'
        ? (valA as number) - (valB as number)
        : (valB as number) - (valA as number);
    });
  }

  // Get category color for an expense
  function getCategoryColor(expense: Expense): string {
    // If category color is already included in the expense
    if (expense.category_color) {
      return expense.category_color;
    }

    // Try to find category in the store
    if (expense.category && typeof expense.category === 'string' && $categoryMap) {
      const category = $categoryMap[expense.category];
      return category?.color || '#CCCCCC';
    }

    return '#CCCCCC'; // Default gray
  }

  // Get pagination range for display
  function getPaginationRange(): number[] {
    // Show all pages if there are 7 or fewer
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    // Otherwise show first, last, current and pages around current
    const range = [];

    // Always show first page
    range.push(1);

    // Show ellipsis after first page if current page is > 3
    if (currentPage > 3) {
      range.push(-1); // -1 represents ellipsis
    }

    // Show pages around current page
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
      range.push(i);
    }

    // Show ellipsis before last page if current page is < totalPages - 2
    if (currentPage < totalPages - 2) {
      range.push(-1); // -1 represents ellipsis
    }

    // Always show last page
    range.push(totalPages);

    return range;
  }
</script>

<div class="w-full">
  {#if error}
    <Alert type="error" class="mb-4">
      {error}
    </Alert>
  {/if}

  {#if loading}
    <div
      class="flex min-h-[200px] w-full items-center justify-center"
      in:fade={{ duration: 300 }}
    >
      <div class="flex flex-col items-center space-y-3 text-gray-500 dark:text-gray-400">
        <div class="h-8 w-8 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
        <p>Loading expenses...</p>
      </div>
    </div>
  {:else if displayExpenses.length === 0}
    <div
      class="flex min-h-[200px] w-full flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-6 text-center dark:border-gray-700 dark:bg-gray-800"
      in:fade={{ duration: 300 }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="mb-3 h-12 w-12 text-gray-400"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
      </svg>
      <h3 class="mb-1 text-lg font-medium text-gray-900 dark:text-white">No expenses found</h3>
      <p class="text-gray-500 dark:text-gray-400">
        {#if miniView}
          There are no recent expenses to display.
        {:else}
          Try adjusting your filters or add a new expense.
        {/if}
      </p>
      {#if !miniView}
        <div class="mt-4">
          <Button
            variant="primary"
            href="/expenses/new"
          >
            Add Expense
          </Button>
        </div>
      {/if}
    </div>
  {:else}
    <!-- Expense Table -->
    <div
      class="w-full overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800"
      in:fly={{ y: 20, duration: 300 }}
    >
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead class="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th
                scope="col"
                class="cursor-pointer px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400"
                on:click={() => sortBy('date')}
              >
                <div class="flex items-center space-x-1">
                  <span>Date</span>
                  {#if sortField === 'date'}
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      class="h-4 w-4 text-gray-500 dark:text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      {#if sortDirection === 'asc'}
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
                      {:else}
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                      {/if}
                    </svg>
                  {/if}
                </div>
              </th>
              <th
                scope="col"
                class="cursor-pointer px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400"
                on:click={() => sortBy('description')}
              >
                <div class="flex items-center space-x-1">
                  <span>Description</span>
                  {#if sortField === 'description'}
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      class="h-4 w-4 text-gray-500 dark:text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      {#if sortDirection === 'asc'}
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
                      {:else}
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                      {/if}
                    </svg>
                  {/if}
                </div>
              </th>
              <th
                scope="col"
                class="cursor-pointer px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400"
                on:click={() => sortBy('category')}
              >
                <div class="flex items-center space-x-1">
                  <span>Category</span>
                  {#if sortField === 'category'}
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      class="h-4 w-4 text-gray-500 dark:text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      {#if sortDirection === 'asc'}
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
                      {:else}
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                      {/if}
                    </svg>
                  {/if}
                </div>
              </th>
              <th
                scope="col"
                class="cursor-pointer px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400"
                on:click={() => sortBy('amount')}
              >
                <div class="flex items-center justify-end space-x-1">
                  <span>Amount</span>
                  {#if sortField === 'amount'}
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      class="h-4 w-4 text-gray-500 dark:text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      {#if sortDirection === 'asc'}
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
                      {:else}
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                      {/if}
                    </svg>
                  {/if}
                </div>
              </th>
              {#if showActions}
                <th scope="col" class="relative px-4 py-3">
                  <span class="sr-only">Actions</span>
                </th>
              {/if}
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
            {#each displayExpenses as expense (expense.id)}
              <tr
                class="group transition duration-150 ease-in-out hover:bg-gray-50 dark:hover:bg-gray-700"
                class:bg-blue-50={expense.id === selectedExpenseId}
                class:dark:bg-blue-900/20={expense.id === selectedExpenseId}
                on:click={() => selectExpense(expense)}
                on:keydown={e => e.key === 'Enter' && selectExpense(expense)}
                tabindex={selectable ? 0 : -1}
                role={selectable ? 'button' : undefined}
              >
                <td class="whitespace-nowrap px-4 py-4 text-sm text-gray-500 dark:text-gray-400">
                  <div class="flex items-center">
                    <span>{formatDate(expense.date, dateFormat)}</span>
                    {#if expense.is_recurring}
                      <span
                        class="ml-2 inline-flex h-4 w-4 items-center justify-center rounded-full bg-blue-100 text-xs text-blue-600 dark:bg-blue-800 dark:text-blue-300"
                        title="Recurring expense"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                      </span>
                    {/if}
                  </div>
                </td>
                <td class="px-4 py-4 text-sm text-gray-900 dark:text-white">
                  <div class="max-w-xs overflow-hidden text-ellipsis whitespace-nowrap">
                    {expense.description}
                  </div>
                  {#if !miniView && expense.payment_method}
                    <div class="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      {PAYMENT_METHOD_LABELS[expense.payment_method as keyof typeof PAYMENT_METHOD_LABELS] || expense.payment_method}
                    </div>
                  {/if}
                </td>
                <td class="px-4 py-4 text-sm text-gray-500 dark:text-gray-400">
                  <div class="flex items-center">
                    <span
                      class="mr-2 h-3 w-3 flex-shrink-0 rounded-full"
                      style={`background-color: ${getCategoryColor(expense)}`}
                    ></span>
                    <span>{expense.category_name || 'Uncategorized'}</span>
                  </div>
                </td>
                <td class="whitespace-nowrap px-4 py-4 text-right text-sm font-medium">
                  <span class="font-semibold text-gray-900 dark:text-white">
                    {formatCurrency(expense.amount, expense.currency)}
                  </span>
                </td>
                {#if showActions}
                  <td class="whitespace-nowrap px-4 py-4 text-right text-sm font-medium">
                    <div class="flex justify-end space-x-2 opacity-0 transition-opacity duration-150 ease-in-out group-hover:opacity-100">
                      <button
                        type="button"
                        class="text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
                        on:click={e => editExpense(expense, e)}
                        title="Edit expense"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        type="button"
                        class="text-gray-600 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400"
                        on:click={e => deleteExpense(expense, e)}
                        title="Delete expense"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </td>
                {/if}
              </tr>
            {/each}
          </tbody>
        </table>
      </div>

      {#if showPagination && totalPages > 1}
        <nav class="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 dark:border-gray-700 dark:bg-gray-800 sm:px-6" aria-label="Pagination">
          <div class="hidden sm:block">
            <p class="text-sm text-gray-700 dark:text-gray-300">
              Showing page <span class="font-medium">{currentPage}</span> of <span class="font-medium">{totalPages}</span>
            </p>
          </div>
          <div class="flex flex-1 justify-between sm:justify-end">
            <Button
              variant={currentPage > 1 ? 'secondary' : 'ghost'}
              disabled={currentPage <= 1}
              size="sm"
              on:click={() => changePage(currentPage - 1)}
            >
              Previous
            </Button>

            <div class="mx-4 hidden space-x-1 sm:flex">
              {#each getPaginationRange() as page}
                {#if page === -1}
                  <span class="inline-flex h-8 w-8 items-center justify-center text-sm text-gray-500 dark:text-gray-400">
                    ...
                  </span>
                {:else}
                  <button
                    class={`inline-flex h-8 w-8 items-center justify-center rounded-md text-sm font-medium ${
                      page === currentPage
                        ? 'bg-primary text-white dark:bg-primary-600'
                        : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                    }`}
                    on:click={() => changePage(page)}
                  >
                    {page}
                  </button>
                {/if}
              {/each}
            </div>

            <Button
              variant={currentPage < totalPages ? 'secondary' : 'ghost'}
              disabled={currentPage >= totalPages}
              size="sm"
              on:click={() => changePage(currentPage + 1)}
            >
              Next
            </Button>
          </div>
        </nav>
      {/if}
    </div>
  {/if}
</div>
