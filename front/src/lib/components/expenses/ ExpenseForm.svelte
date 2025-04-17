<!--
  Expense Form Component

  A comprehensive form for creating and editing expenses with:
  - Amount and currency fields
  - Date picker
  - Category selection
  - Receipt upload
  - Recurring expense option
  - Real-time validation
-->
<script lang="ts">
  import { createEventDispatcher, onMount } from 'svelte';
  import { formatCurrency } from '$lib/utils/format';
  import { validateNumber, validateInput } from '$lib/utils/validation';
  import { categories } from '$lib/stores/categories';
  import { defaultCurrency, expenseStore } from '$lib/stores/expenses';
  import { toastStore } from '$lib/stores/toast';
  import type { Expense, ExpenseFormData, Currency, PaymentMethod, Category } from '$lib/types/expenses';
  import { CURRENCY_SYMBOLS, PAYMENT_METHOD_LABELS } from '$lib/types/expenses';
  import Button from '$lib/components/ui/Button.svelte';
  import Input from '$lib/components/ui/Input.svelte';
  import Select from '$lib/components/ui/Select.svelte';
  import Textarea from '$lib/components/ui/Textarea.svelte';
  import Alert from '$lib/components/ui/Alert.svelte';

  // Props with Svelte 5 runes
  const {
    // Initial expense data (for editing)
    expense = null,
    // Initial form values
    initialValues = {},
    // Loading state
    loading = false,
    // Auto-focus first field
    autofocus = true,
    // Show compact form
    compact = false
  } = $props<{
    expense?: Expense | null;
    initialValues?: Partial<ExpenseFormData>;
    loading?: boolean;
    autofocus?: boolean;
    compact?: boolean;
  }>();

  // Event dispatcher
  const dispatch = createEventDispatcher<{
    submit: ExpenseFormData;
    cancel: void;
  }>();

  // Form state
  let formData = $state<ExpenseFormData>({
    amount: 0,
    currency: $defaultCurrency,
    description: '',
    date: new Date().toISOString().split('T')[0], // Default to today
    category: undefined,
    payment_method: 'cash',
    location: '',
    notes: '',
    is_recurring: false,
    receipt_image: null
  });

  // Validation state
  let errors = $state<Record<string, string>>({});
  let touched = $state<Record<string, boolean>>({});
  let isValid = $derived(Object.keys(errors).length === 0);

  // Receipt image preview
  let receiptPreview = $state<string | null>(null);
  let uploadInput = $state<HTMLInputElement | null>(null);

  // Format options for currency display
  let amountFormatOptions = $state<Intl.NumberFormatOptions>({
    style: 'currency',
    currency: formData.currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

  // Available currencies with symbols
  const currencyOptions = Object.entries(CURRENCY_SYMBOLS).map(([value, symbol]) => ({
    value,
    label: `${value} (${symbol})`
  }));

  // Payment method options
  const paymentMethodOptions = Object.entries(PAYMENT_METHOD_LABELS).map(([value, label]) => ({
    value,
    label
  }));

  // Initialize form data from props
  $effect(() => {
    // Merge data from expense or initialValues into formData
    const sourceData = expense || initialValues;

    if (sourceData) {
      // Convert date format if needed
      let dateValue = sourceData.date;
      if (dateValue && typeof dateValue === 'string' && dateValue.includes('T')) {
        dateValue = dateValue.split('T')[0];
      }

      // Update form data
      formData = {
        ...formData,
        ...sourceData,
        date: dateValue || formData.date
      };

      // Set receipt preview if there's an existing receipt
      if (sourceData.receipt_image && typeof sourceData.receipt_image === 'string') {
        receiptPreview = sourceData.receipt_image;
      }
    }

    // Update currency format options
    amountFormatOptions = {
      ...amountFormatOptions,
      currency: formData.currency
    };
  });

  // Validate entire form
  function validateForm(): boolean {
    errors = {};

    // Validate amount
    const amountResult = validateNumber(formData.amount, {
      required: true,
      min: 0.01,
      positive: true
    });

    if (!amountResult.valid) {
      errors.amount = amountResult.error || 'Please enter a valid amount';
    }

    // Validate description
    const descriptionResult = validateInput(formData.description, {
      required: true,
      minLength: 3,
      maxLength: 100
    });

    if (!descriptionResult.valid) {
      errors.description = descriptionResult.error || 'Please enter a valid description';
    }

    // Validate date
    if (!formData.date) {
      errors.date = 'Please select a date';
    }

    return Object.keys(errors).length === 0;
  }

  // Handle form submission
  function handleSubmit() {
    // Mark all fields as touched
    Object.keys(formData).forEach(key => {
      touched[key] = true;
    });

    // Validate the entire form
    if (!validateForm()) {
      toastStore.error('Please fix the errors in the form');
      return;
    }

    // Dispatch the submit event with form data
    dispatch('submit', formData);
  }

  // Handle cancel button click
  function handleCancel() {
    dispatch('cancel');
  }

  // Validate a field on blur
  function validateField(field: keyof ExpenseFormData) {
    touched[field] = true;

    switch (field) {
      case 'amount':
        const amountResult = validateNumber(formData.amount, {
          required: true,
          min: 0.01,
          positive: true
        });

        if (!amountResult.valid) {
          errors.amount = amountResult.error || 'Please enter a valid amount';
        } else {
          delete errors.amount;
        }
        break;

      case 'description':
        const descriptionResult = validateInput(formData.description, {
          required: true,
          minLength: 3,
          maxLength: 100
        });

        if (!descriptionResult.valid) {
          errors.description = descriptionResult.error || 'Please enter a valid description';
        } else {
          delete errors.description;
        }
        break;

      case 'date':
        if (!formData.date) {
          errors.date = 'Please select a date';
        } else {
          delete errors.date;
        }
        break;
    }
  }

  // Handle receipt image upload
  function handleReceiptUpload(event: Event) {
    const target = event.target as HTMLInputElement;

    if (target.files && target.files[0]) {
      const file = target.files[0];

      // Validate file type
      const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];
      if (!validTypes.includes(file.type)) {
        errors.receipt_image = 'Please upload a valid image or PDF file';
        receiptPreview = null;
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        errors.receipt_image = 'File size must be less than 5MB';
        receiptPreview = null;
        return;
      }

      // Clear any previous errors
      delete errors.receipt_image;

      // Store the file in form data
      formData.receipt_image = file;

      // Create preview for image files (not for PDF)
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          receiptPreview = e.target?.result as string;
        };
        reader.readAsDataURL(file);
      } else {
        // For PDFs, just show an icon or text
        receiptPreview = 'pdf';
      }
    }
  }

  // Remove uploaded receipt
  function removeReceipt() {
    formData.receipt_image = null;
    receiptPreview = null;
    if (uploadInput) {
      uploadInput.value = '';
    }
  }

  // Update currency format when currency changes
  $effect(() => {
    amountFormatOptions = {
      ...amountFormatOptions,
      currency: formData.currency
    };
  });

  // Life cycle: autofocus first field
  onMount(() => {
    // Auto-focus amount field if requested
    if (autofocus) {
      const amountInput = document.getElementById('expense-amount');
      if (amountInput) {
        amountInput.focus();
      }
    }
  });
</script>

<form
  on:submit|preventDefault={handleSubmit}
  class={`space-y-6 ${compact ? 'text-sm' : ''}`}
>
  <div class="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-6">
    <!-- Amount and Currency Row -->
    <div class="sm:col-span-3">
      <Input
        id="expense-amount"
        type="number"
        label="Amount"
        bind:value={formData.amount}
        error={touched.amount ? errors.amount : undefined}
        required
        step="0.01"
        min="0.01"
        prefix={CURRENCY_SYMBOLS[formData.currency]}
        on:blur={() => validateField('amount')}
        helpText={formData.amount ? formatCurrency(formData.amount, formData.currency) : ''}
      />
    </div>

    <div class="sm:col-span-3">
      <Select
        label="Currency"
        bind:value={formData.currency}
        options={currencyOptions}
        error={touched.currency ? errors.currency : undefined}
        required
      />
    </div>

    <!-- Description Row -->
    <div class="sm:col-span-6">
      <Input
        id="expense-description"
        type="text"
        label="Description"
        bind:value={formData.description}
        error={touched.description ? errors.description : undefined}
        required
        maxlength="100"
        placeholder="What was this expense for?"
        on:blur={() => validateField('description')}
      />
    </div>

    <!-- Date and Category Row -->
    <div class="sm:col-span-3">
      <Input
        id="expense-date"
        type="date"
        label="Date"
        bind:value={formData.date}
        error={touched.date ? errors.date : undefined}
        required
        on:blur={() => validateField('date')}
        max={new Date().toISOString().split('T')[0]} /* Limit to today or earlier */
      />
    </div>

    <div class="sm:col-span-3">
      <Select
        label="Category"
        bind:value={formData.category}
        options={$categories.map(cat => ({
          value: cat.id,
          label: cat.name,
          icon: `<span class="inline-block w-3 h-3 rounded-full mr-2" style="background-color: ${cat.color}"></span>`
        }))}
        error={touched.category ? errors.category : undefined}
        allowClear={true}
        placeholder="Select a category"
      />
    </div>

    <!-- Payment Method and Location Row -->
    <div class="sm:col-span-3">
      <Select
        label="Payment Method"
        bind:value={formData.payment_method}
        options={paymentMethodOptions}
        error={touched.payment_method ? errors.payment_method : undefined}
        required
      />
    </div>

    <div class="sm:col-span-3">
      <Input
        id="expense-location"
        type="text"
        label="Location"
        bind:value={formData.location}
        error={touched.location ? errors.location : undefined}
        placeholder="Where was this expense made? (optional)"
      />
    </div>

    <!-- Notes Row -->
    {#if !compact}
      <div class="sm:col-span-6">
        <Textarea
          label="Notes"
          bind:value={formData.notes}
          error={touched.notes ? errors.notes : undefined}
          placeholder="Add any additional details (optional)"
          rows={3}
        />
      </div>
    {/if}

    <!-- Receipt Upload -->
    {#if !compact}
      <div class="sm:col-span-6">
        <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
          Receipt Image (optional)
        </label>

        {#if receiptPreview}
          <div class="mt-1 flex items-center space-x-4">
            {#if receiptPreview === 'pdf'}
              <div class="flex h-24 w-24 items-center justify-center rounded bg-gray-100 dark:bg-gray-800">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clip-rule="evenodd" />
                </svg>
              </div>
            {:else}
              <div class="h-24 w-24 overflow-hidden rounded border border-gray-200 dark:border-gray-700">
                <img src={receiptPreview} alt="Receipt preview" class="h-full w-full object-cover" />
              </div>
            {/if}

            <Button
              type="button"
              variant="danger"
              size="sm"
              on:click={removeReceipt}
            >
              Remove
            </Button>
          </div>
        {:else}
          <div class="mt-1 flex items-center justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md dark:border-gray-700">
            <div class="space-y-1 text-center">
              <svg class="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
              <div class="flex text-sm text-gray-600 dark:text-gray-400">
                <label for="receipt-upload" class="relative cursor-pointer rounded-md font-medium text-primary hover:text-primary-dark focus-within:outline-none focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2 dark:text-primary-400 dark:hover:text-primary-300">
                  <span>Upload a file</span>
                  <input
                    id="receipt-upload"
                    bind:this={uploadInput}
                    name="receipt-upload"
                    type="file"
                    class="sr-only"
                    accept="image/*,.pdf"
                    on:change={handleReceiptUpload}
                  />
                </label>
                <p class="pl-1">or drag and drop</p>
              </div>
              <p class="text-xs text-gray-500 dark:text-gray-400">
                PNG, JPG, GIF or PDF up to 5MB
              </p>
            </div>
          </div>
        {/if}

        {#if errors.receipt_image}
          <p class="mt-1 text-sm text-red-600 dark:text-red-400">{errors.receipt_image}</p>
        {/if}
      </div>
    {/if}

    <!-- Recurring Expense Checkbox -->
    <div class="sm:col-span-6">
      <div class="flex items-center">
        <input
          id="is-recurring"
          type="checkbox"
          bind:checked={formData.is_recurring}
          class="h-4 w-4 text-primary focus:ring-primary rounded border-gray-300 dark:border-gray-600 dark:bg-gray-700"
        />
        <label for="is-recurring" class="ml-2 text-sm text-gray-700 dark:text-gray-300">
          This is a recurring expense
        </label>
      </div>
    </div>
  </div>

  <!-- Form Actions -->
  <div class="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
    <Button
      type="button"
      variant="ghost"
      on:click={handleCancel}
      disabled={loading}
    >
      Cancel
    </Button>

    <Button
      type="submit"
      variant="primary"
      disabled={!isValid || loading}
      loading={loading}
    >
      {expense ? 'Update' : 'Create'} Expense
    </Button>
  </div>
</form>
