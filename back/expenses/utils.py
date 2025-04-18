from django.db.models import Sum, Count, Avg, Max, F, Q
from django.utils import timezone
from datetime import timedelta, datetime
import datetime as dt
import csv
import tempfile
import calendar
from decimal import Decimal
import json

from .models import Expense, Category, Budget


def get_date_range(period, custom_start=None, custom_end=None):
    """
    Get date range based on period name or custom dates
    """
    today = timezone.now().date()

    if custom_start and custom_end:
        # Convert string dates to date objects if needed
        if isinstance(custom_start, str):
            custom_start = datetime.strptime(custom_start, '%Y-%m-%d').date()
        if isinstance(custom_end, str):
            custom_end = datetime.strptime(custom_end, '%Y-%m-%d').date()
        return custom_start, custom_end

    if period == 'today':
        return today, today
    elif period == 'yesterday':
        yesterday = today - timedelta(days=1)
        return yesterday, yesterday
    elif period == 'this_week':
        start_of_week = today - timedelta(days=today.weekday())
        return start_of_week, today
    elif period == 'last_week':
        end_of_last_week = today - timedelta(days=today.weekday() + 1)
        start_of_last_week = end_of_last_week - timedelta(days=6)
        return start_of_last_week, end_of_last_week
    elif period == 'this_month':
        start_of_month = today.replace(day=1)
        return start_of_month, today
    elif period == 'last_month':
        first_of_month = today.replace(day=1)
        last_of_prev_month = first_of_month - timedelta(days=1)
        first_of_prev_month = last_of_prev_month.replace(day=1)
        return first_of_prev_month, last_of_prev_month
    elif period == 'this_year':
        first_of_year = today.replace(month=1, day=1)
        return first_of_year, today
    elif period == 'last_year':
        first_of_this_year = today.replace(month=1, day=1)
        last_of_prev_year = first_of_this_year - timedelta(days=1)
        first_of_prev_year = last_of_prev_year.replace(month=1, day=1)
        return first_of_prev_year, last_of_prev_year
    elif period == 'all_time':
        # Default to last 5 years if no expenses exist
        oldest_expense = Expense.objects.order_by('date').first()
        if oldest_expense:
            return oldest_expense.date, today
        else:
            return today - timedelta(days=365*5), today

    # Default to last 30 days
    return today - timedelta(days=30), today


def get_expenses_summary(user, start_date=None, end_date=None, category=None, currency='USD'):
    """
    Get summary statistics for expenses
    """
    # Set default date range to current month if not specified
    if not start_date or not end_date:
        today = timezone.now().date()
        start_date = today.replace(day=1)
        end_date = today
    else:
        # Convert string dates to date objects if needed
        if isinstance(start_date, str):
            start_date = datetime.strptime(start_date, '%Y-%m-%d').date()
        if isinstance(end_date, str):
            end_date = datetime.strptime(end_date, '%Y-%m-%d').date()

    # Base queryset filtered by user, date range, and currency
    queryset = Expense.objects.filter(
        user=user,
        date__gte=start_date,
        date__lte=end_date,
        currency=currency
    )

    # Add category filter if specified
    if category:
        queryset = queryset.filter(category=category)

    # Calculate summary statistics
    summary = queryset.aggregate(
        total_expenses=Sum('amount'),
        expense_count=Count('id'),
        average_expense=Avg('amount'),
        highest_expense=Max('amount')
    )

    # Handle case where no expenses exist in the period
    if summary['total_expenses'] is None:
        summary['total_expenses'] = Decimal('0.00')
    if summary['average_expense'] is None:
        summary['average_expense'] = Decimal('0.00')
    if summary['highest_expense'] is None:
        summary['highest_expense'] = Decimal('0.00')

    # Add date range to summary
    summary['start_date'] = start_date
    summary['end_date'] = end_date

    return summary


def get_expenses_by_category(user, start_date=None, end_date=None, currency='USD'):
    """
    Get expenses grouped by category for pie/bar charts
    """
    # Set default date range to current month if not specified
    if not start_date or not end_date:
        today = timezone.now().date()
        start_date = today.replace(day=1)
        end_date = today
    else:
        # Convert string dates to date objects if needed
        if isinstance(start_date, str):
            start_date = datetime.strptime(start_date, '%Y-%m-%d').date()
        if isinstance(end_date, str):
            end_date = datetime.strptime(end_date, '%Y-%m-%d').date()

    # Get total expenses for the period for percentage calculation
    total_expenses = Expense.objects.filter(
        user=user,
        date__gte=start_date,
        date__lte=end_date,
        currency=currency
    ).aggregate(total=Sum('amount'))['total'] or Decimal('0.00')

    # Get expenses by category with aggregates
    expenses_by_category = []

    # Include uncategorized expenses
    categorized_expenses = Expense.objects.filter(
        user=user,
        date__gte=start_date,
        date__lte=end_date,
        currency=currency
    ).values(
        'category'
    ).annotate(
        total_amount=Sum('amount'),
        expense_count=Count('id')
    ).order_by('-total_amount')

    # Process each category result
    for item in categorized_expenses:
        category_id = item['category']

        # Handle uncategorized expenses
        if category_id is None:
            category_name = "Uncategorized"
            category_color = "#CCCCCC"  # Gray for uncategorized
        else:
            # Get category details
            try:
                category = Category.objects.get(id=category_id)
                category_name = category.name
                category_color = category.color
            except Category.DoesNotExist:
                category_name = "Unknown"
                category_color = "#CCCCCC"

        # Calculate percentage
        total_amount = item['total_amount']
        percentage = 0
        if total_expenses > 0:
            percentage = float(total_amount / total_expenses) * 100

        # Add to results
        expenses_by_category.append({
            'category_id': category_id,
            'category_name': category_name,
            'category_color': category_color,
            'total_amount': total_amount,
            'expense_count': item['expense_count'],
            'percentage': round(percentage, 2)
        })

    return expenses_by_category


def get_expense_time_series(user, start_date, end_date, group_by='day', currency='USD', category=None):
    """
    Get time series data for expenses (for line/bar charts)
    Group by day, week, month, or year
    """
    # Convert string dates to date objects if needed
    if isinstance(start_date, str):
        start_date = datetime.strptime(start_date, '%Y-%m-%d').date()
    if isinstance(end_date, str):
        end_date = datetime.strptime(end_date, '%Y-%m-%d').date()

    # Base queryset
    queryset = Expense.objects.filter(
        user=user,
        date__gte=start_date,
        date__lte=end_date,
        currency=currency
    )

    # Add category filter if specified
    if category:
        queryset = queryset.filter(category=category)

    # Get the date difference
    delta = end_date - start_date

    # Determine appropriate grouping
    if group_by == 'auto':
        # Auto-determine grouping based on date range
        if delta.days <= 31:
            group_by = 'day'
        elif delta.days <= 90:
            group_by = 'week'
        elif delta.days <= 365:
            group_by = 'month'
        else:
            group_by = 'year'

    # Create time series data
    time_series = []

    if group_by == 'day':
        # Group by day
        current_date = start_date
        while current_date <= end_date:
            daily_expenses = queryset.filter(date=current_date)
            time_series.append({
                'date': current_date,
                'amount': daily_expenses.aggregate(Sum('amount'))['amount__sum'] or Decimal('0.00'),
                'count': daily_expenses.count()
            })
            current_date += timedelta(days=1)

    elif group_by == 'week':
        # Group by week (starting from start_date)
        current_date = start_date
        while current_date <= end_date:
            week_end = min(current_date + timedelta(days=6), end_date)
            weekly_expenses = queryset.filter(date__gte=current_date, date__lte=week_end)
            time_series.append({
                'date': current_date,
                'amount': weekly_expenses.aggregate(Sum('amount'))['amount__sum'] or Decimal('0.00'),
                'count': weekly_expenses.count()
            })
            current_date = week_end + timedelta(days=1)

    elif group_by == 'month':
        # Group by month
        current_date = start_date.replace(day=1)
        while current_date <= end_date:
            # Get last day of month
            if current_date.month == 12:
                next_month = current_date.replace(year=current_date.year + 1, month=1)
            else:
                next_month = current_date.replace(month=current_date.month + 1)

            month_end = next_month - timedelta(days=1)
            month_end = min(month_end, end_date)

            monthly_expenses = queryset.filter(date__gte=current_date, date__lte=month_end)
            time_series.append({
                'date': current_date,
                'amount': monthly_expenses.aggregate(Sum('amount'))['amount__sum'] or Decimal('0.00'),
                'count': monthly_expenses.count()
            })
            current_date = next_month

    elif group_by == 'year':
        # Group by year
        current_year = start_date.year
        end_year = end_date.year

        while current_year <= end_year:
            year_start = max(dt.date(current_year, 1, 1), start_date)
            year_end = min(dt.date(current_year, 12, 31), end_date)

            yearly_expenses = queryset.filter(date__gte=year_start, date__lte=year_end)
            time_series.append({
                'date': year_start,
                'amount': yearly_expenses.aggregate(Sum('amount'))['amount__sum'] or Decimal('0.00'),
                'count': yearly_expenses.count()
            })
            current_year += 1

    return time_series


def get_budget_comparison(user, period='current_month', currency='USD'):
    """
    Get budget vs actual spending data
    """
    # Define date range based on period
    today = timezone.now().date()

    if period == 'current_month':
        start_date = today.replace(day=1)
        # Calculate last day of month
        if today.month == 12:
            next_month = today.replace(year=today.year + 1, month=1, day=1)
        else:
            next_month = today.replace(month=today.month + 1, day=1)
        end_date = next_month - timedelta(days=1)
    elif period == 'current_year':
        start_date = today.replace(month=1, day=1)
        end_date = today.replace(month=12, day=31)
    else:
        # Custom period handled by the view
        return []

    # Get all budgets for the user with the specified currency
    budgets = Budget.objects.filter(
        user=user,
        currency=currency,
        period__in=['monthly', 'yearly']
    )

    # Filter budgets based on period
    if period == 'current_month':
        budgets = budgets.filter(period='monthly')
    elif period == 'current_year':
        budgets = budgets.filter(period='yearly')

    # Get all categories for the user
    categories = Category.objects.filter(user=user)

    # Initialize results
    results = []

    # For each category, get budget and actual spending
    for category in categories:
        # Get budget for this category
        category_budget = budgets.filter(category=category).first()

        # Get actual spending for this category in the period
        actual_spending = Expense.objects.filter(
            user=user,
            category=category,
            date__gte=start_date,
            date__lte=end_date,
            currency=currency
        ).aggregate(total=Sum('amount'))['total'] or Decimal('0.00')

        # Budget amount (if exists)
        budget_amount = category_budget.amount if category_budget else Decimal('0.00')

        # Calculate percentage spent
        percentage = 0
        if budget_amount > 0:
            percentage = min(100, round((actual_spending / budget_amount) * 100, 2))

        # Add to results
        results.append({
            'category_id': category.id,
            'category_name': category.name,
            'category_color': category.color,
            'budget_amount': budget_amount,
            'actual_amount': actual_spending,
            'remaining': max(Decimal('0.00'), budget_amount - actual_spending),
            'percentage': percentage,
            'is_over_budget': actual_spending > budget_amount
        })

    # Sort by percentage spent (descending)
    results = sorted(results, key=lambda x: x['percentage'], reverse=True)

    return results


def generate_expense_csv(user, start_date, end_date, category=None):
    """
    Generate CSV data for expenses
    """
    # Convert string dates to date objects if needed
    if isinstance(start_date, str):
        start_date = datetime.strptime(start_date, '%Y-%m-%d').date()
    if isinstance(end_date, str):
        end_date = datetime.strptime(end_date, '%Y-%m-%d').date()

    # Base queryset
    queryset = Expense.objects.filter(
        user=user,
        date__gte=start_date,
        date__lte=end_date
    ).order_by('date')

    # Add category filter if specified
    if category:
        queryset = queryset.filter(category=category)

    # Create a temporary file for CSV data
    with tempfile.NamedTemporaryFile(mode='w+', newline='', delete=False, suffix='.csv') as temp_file:
        # Create CSV writer
        fieldnames = ['Date', 'Description', 'Category', 'Amount', 'Currency',
                     'Payment Method', 'Location', 'Notes']
        writer = csv.DictWriter(temp_file, fieldnames=fieldnames)

        # Write header
        writer.writeheader()

        # Write data
        for expense in queryset:
            category_name = expense.category.name if expense.category else 'Uncategorized'
            writer.writerow({
                'Date': expense.date.strftime('%Y-%m-%d'),
                'Description': expense.description,
                'Category': category_name,
                'Amount': float(expense.amount),
                'Currency': expense.currency,
                'Payment Method': expense.get_payment_method_display(),
                'Location': json.dumps(expense.location) if expense.location else '',
                'Notes': expense.notes
            })

        return temp_file.name
