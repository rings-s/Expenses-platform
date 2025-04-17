/**
 * Expense Type Definitions
 *
 * This module defines all the TypeScript interfaces related to expenses
 * and their management in the application.
 */

import type { User } from './auth.types';

/**
 * Currency Types
 * List of supported currencies in the application
 */
export type Currency = 'USD' | 'EUR' | 'GBP' | 'INR' | 'JPY' | 'CNY' | 'CAD' | 'AUD';

/**
 * Payment Methods
 * Available payment methods for expenses
 */
export type PaymentMethod =
	| 'cash'
	| 'credit_card'
	| 'debit_card'
	| 'bank_transfer'
	| 'mobile_payment'
	| 'other';

/**
 * Display names for payment methods
 */
export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
	cash: 'Cash',
	credit_card: 'Credit Card',
	debit_card: 'Debit Card',
	bank_transfer: 'Bank Transfer',
	mobile_payment: 'Mobile Payment',
	other: 'Other'
};

/**
 * Currency Symbols
 * Currency symbols for display
 */
export const CURRENCY_SYMBOLS: Record<Currency, string> = {
	USD: '$',
	EUR: '€',
	GBP: '£',
	INR: '₹',
	JPY: '¥',
	CNY: '¥',
	CAD: 'CA$',
	AUD: 'A$'
};

/**
 * Category Model
 * Represents an expense category
 */
export interface Category {
	id: string;
	name: string;
	description: string;
	color: string;
	icon: string;
	is_default: boolean;
	user: string | User;
	created_at: string;
	updated_at: string;
}

/**
 * Expense Model
 * Represents an individual expense
 */
export interface Expense {
	id: string;
	amount: number;
	currency: Currency;
	description: string;
	date: string;
	user: string | User;
	category?: string | Category;
	category_name?: string;
	category_color?: string;
	payment_method: PaymentMethod;
	location?: string;
	notes?: string;
	is_recurring: boolean;
	receipt_image?: string;
	created_at: string;
	updated_at: string;
}

/**
 * Budget Period
 * Available time periods for budgets
 */
export type BudgetPeriod = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';

/**
 * Display names for budget periods
 */
export const BUDGET_PERIOD_LABELS: Record<BudgetPeriod, string> = {
	daily: 'Daily',
	weekly: 'Weekly',
	monthly: 'Monthly',
	quarterly: 'Quarterly',
	yearly: 'Yearly'
};

/**
 * Budget Model
 * Represents a spending budget
 */
export interface Budget {
	id: string;
	amount: number;
	currency: Currency;
	period: BudgetPeriod;
	start_date: string;
	user: string | User;
	category?: string | Category;
	category_name?: string;
	created_at: string;
	updated_at: string;

	// Calculated fields (may come from backend or be calculated client-side)
	spent_amount?: number;
	remaining_amount?: number;
	percentage_used?: number;
}

/**
 * Report Type
 * Types of predefined reports
 */
export type ReportType =
	| 'expenses_by_category'
	| 'expenses_over_time'
	| 'budget_vs_actual'
	| 'spending_trends'
	| 'custom';

/**
 * Chart Type
 * Supported chart visualization types
 */
export type ChartType = 'bar' | 'line' | 'pie' | 'scatter' | 'stacked_bar';

/**
 * Report Model
 * Represents a saved report configuration
 */
export interface Report {
	id: string;
	name: string;
	description: string;
	report_type: ReportType;
	chart_type: ChartType;
	start_date?: string;
	end_date?: string;
	parameters: Record<string, any>;
	user: string | User;
	categories?: string[] | Category[];
	categories_data?: Category[];
	is_favorite: boolean;
	created_at: string;
	updated_at: string;
}

/**
 * Expense Filter
 * Filter options for listing expenses
 */
export interface ExpenseFilter {
	start_date?: string;
	end_date?: string;
	category_id?: string;
	min_amount?: number;
	max_amount?: number;
	payment_method?: PaymentMethod;
	currency?: Currency;
	search?: string;
	is_recurring?: boolean;
}

/**
 * Category Create/Update Data
 * Data for creating or updating a category
 */
export interface CategoryFormData {
	name: string;
	description: string;
	color: string;
	icon: string;
	is_default?: boolean;
}

/**
 * Expense Create/Update Data
 * Data for creating or updating an expense
 */
export interface ExpenseFormData {
	amount: number;
	currency: Currency;
	description: string;
	date: string;
	category?: string;
	payment_method: PaymentMethod;
	location?: string;
	notes?: string;
	is_recurring?: boolean;
	receipt_image?: File | string | null;
}

/**
 * Budget Create/Update Data
 * Data for creating or updating a budget
 */
export interface BudgetFormData {
	amount: number;
	currency: Currency;
	period: BudgetPeriod;
	start_date: string;
	category?: string;
}

/**
 * Expense Summary
 * Summary statistics for expenses
 */
export interface ExpenseSummary {
	total_expenses: number;
	expense_count: number;
	average_expense: number;
	highest_expense: number;
	start_date: string;
	end_date: string;
}

/**
 * Category Expense Data
 * Summary of expenses by category
 */
export interface CategoryExpenseData {
	category_id: string | null;
	category_name: string;
	category_color: string;
	total_amount: number;
	expense_count: number;
	percentage: number;
}

/**
 * Time Series Data
 * Data point for time-series charts
 */
export interface TimeSeriesData {
	date: string;
	amount: number;
	count: number;
}

/**
 * Budget Comparison Item
 * Data for budget vs actual spending comparison
 */
export interface BudgetComparisonItem {
	category_id: string;
	category_name: string;
	category_color: string;
	budget_amount: number;
	actual_amount: number;
	remaining: number;
	percentage: number;
	is_over_budget: boolean;
}

/**
 * Export Format
 * Supported formats for exporting expense data
 */
export type ExportFormat = 'csv' | 'pdf' | 'excel';

/**
 * Time Period
 * Predefined time periods for reports and filters
 */
export type TimePeriod =
	| 'today'
	| 'yesterday'
	| 'this_week'
	| 'last_week'
	| 'this_month'
	| 'last_month'
	| 'this_year'
	| 'last_year'
	| 'all_time'
	| 'custom';

/**
 * Group By Option
 * Options for grouping time series data
 */
export type GroupByOption = 'day' | 'week' | 'month' | 'year' | 'auto';
