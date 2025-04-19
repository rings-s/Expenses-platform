from django.db import models
from django.conf import settings
from django.utils import timezone
import uuid


class Category(models.Model):
    """
    Expense category model for organizing expenses
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    color = models.CharField(max_length=7, default="#0066cc")  # Hex color code
    icon = models.CharField(max_length=50, blank=True)  # Optional icon name

    # Meta fields
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='expense_categories')
    is_default = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name_plural = "Categories"
        ordering = ['name']
        # Ensure uniqueness of category name for each user
        unique_together = ['name', 'user']
        indexes = [
            models.Index(fields=['user']),
            models.Index(fields=['is_default']),
        ]

    def __str__(self):
        return self.name


class Expense(models.Model):
    """
    Main expense model for tracking expenses
    """
    PAYMENT_METHODS = (
        ('cash', 'Cash'),
        ('credit_card', 'Credit Card'),
        ('debit_card', 'Debit Card'),
        ('bank_transfer', 'Bank Transfer'),
        ('mobile_payment', 'Mobile Payment'),
        ('other', 'Other'),
    )

    CURRENCIES = (
        ('SAR', 'Saudi Riyal'),
        ('USD', 'US Dollar'),
        ('EUR', 'Euro'),
        ('GBP', 'British Pound'),
        ('CAD', 'Canadian Dollar'),
        ('AUD', 'Australian Dollar'),
    )

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=3, choices=CURRENCIES, default='USD')
    description = models.CharField(max_length=255)
    date = models.DateField(default=timezone.now)

    # Relations
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='expenses')
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, related_name='expenses')

    # Additional fields
    payment_method = models.CharField(max_length=20, choices=PAYMENT_METHODS, default='cash')
    location = models.JSONField(default=dict, blank=True)
    notes = models.TextField(blank=True)
    is_recurring = models.BooleanField(default=False)
    receipt_image = models.ImageField(upload_to='receipts/', blank=True, null=True)

    # Meta fields
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-date', '-created_at']
        indexes = [
            models.Index(fields=['user']),
            models.Index(fields=['category']),
            models.Index(fields=['date']),
            models.Index(fields=['is_recurring']),
        ]

    def __str__(self):
        return f"{self.description} - {self.amount} {self.currency}"


class Budget(models.Model):
    """
    Budget model for setting spending limits
    """
    PERIOD_CHOICES = (
        ('daily', 'Daily'),
        ('weekly', 'Weekly'),
        ('monthly', 'Monthly'),
        ('quarterly', 'Quarterly'),
        ('yearly', 'Yearly'),
    )

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=3, choices=Expense.CURRENCIES, default='USD')
    period = models.CharField(max_length=10, choices=PERIOD_CHOICES, default='monthly')
    start_date = models.DateField(default=timezone.now)

    # Relations
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='budgets')
    category = models.ForeignKey(Category, on_delete=models.CASCADE, null=True, blank=True,
                                related_name='budgets')

    # Meta fields
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-start_date']
        indexes = [
            models.Index(fields=['user']),
            models.Index(fields=['category']),
            models.Index(fields=['period']),
        ]

    def __str__(self):
        category_name = self.category.name if self.category else "All Categories"
        return f"{category_name} Budget: {self.amount} {self.currency} ({self.period})"

    def get_spent_amount(self):
        """Calculate total amount spent for this budget period"""
        from django.db.models import Sum
        from django.utils.timezone import now
        import calendar
        from datetime import datetime

        # Get start and end dates based on period
        start_date = self.start_date

        if self.period == 'daily':
            end_date = start_date
        elif self.period == 'weekly':
            end_date = start_date + timezone.timedelta(days=6)  # 7 days total including start
        elif self.period == 'monthly':
            # Calculate correct last day of month
            year = start_date.year
            month = start_date.month

            # Get last day of month
            _, last_day = calendar.monthrange(year, month)
            end_date = datetime(year, month, last_day).date()
        elif self.period == 'quarterly':
            # Calculate end of quarter
            month = start_date.month
            quarter_end_month = ((month - 1) // 3) * 3 + 3  # Last month of quarter
            year = start_date.year
            if quarter_end_month > 12:
                quarter_end_month = 12

            _, last_day = calendar.monthrange(year, quarter_end_month)
            end_date = datetime(year, quarter_end_month, last_day).date()
        elif self.period == 'yearly':
            end_date = datetime(start_date.year, 12, 31).date()

        # If category is specified, filter by it
        if self.category:
            expenses = Expense.objects.filter(
                user=self.user,
                category=self.category,
                date__gte=start_date,
                date__lte=end_date,
                currency=self.currency
            )
        else:
            expenses = Expense.objects.filter(
                user=self.user,
                date__gte=start_date,
                date__lte=end_date,
                currency=self.currency
            )

        result = expenses.aggregate(Sum('amount'))
        return result.get('amount__sum') or 0




class Report(models.Model):
    """
    Saved report configurations
    """
    REPORT_TYPES = (
        ('expense_summary', 'Expense Summary'),
        ('expenses_by_category', 'Expenses by Category'),
        ('expenses_over_time', 'Expenses Over Time'),
        ('expense_heatmap', 'Expense Heatmap'),
        ('budget_vs_actual', 'Budget vs Actual'),
        ('spending_trends', 'Spending Trends'),
        ('custom', 'Custom Report'),
    )

    CHART_TYPES = (
        ('bar', 'Bar Chart'),
        ('line', 'Line Chart'),
        ('pie', 'Pie Chart'),
        ('doughnut', 'Doughnut Chart'),
        ('scatter', 'Scatter Plot'),
        ('stacked_bar', 'Stacked Bar Chart'),
    )

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)
    report_type = models.CharField(max_length=50, choices=REPORT_TYPES)
    chart_type = models.CharField(max_length=20, choices=CHART_TYPES, default='bar')

    # Date filters
    start_date = models.DateField(null=True, blank=True)
    end_date = models.DateField(null=True, blank=True)

    # Configuration options stored as JSON
    parameters = models.JSONField(default=dict, blank=True, null=True)

    # Relations
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='expense_reports')
    categories = models.ManyToManyField(Category, blank=True, related_name='reports')

    # Meta fields
    is_favorite = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user']),
            models.Index(fields=['report_type']),
            models.Index(fields=['is_favorite']),
        ]

    def __str__(self):
        return self.name
