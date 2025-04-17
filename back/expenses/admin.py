from django.contrib import admin
from .models import Category, Expense, Budget, Report


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'user', 'is_default', 'created_at')
    list_filter = ('is_default', 'created_at')
    search_fields = ('name', 'user__email', 'user__username')
    ordering = ('name',)


@admin.register(Expense)
class ExpenseAdmin(admin.ModelAdmin):
    list_display = ('description', 'amount', 'currency', 'date', 'category', 'user')
    list_filter = ('currency', 'date', 'payment_method', 'is_recurring')
    search_fields = ('description', 'user__email', 'user__username')
    date_hierarchy = 'date'
    ordering = ('-date',)
    autocomplete_fields = ('user', 'category')
    list_per_page = 20


@admin.register(Budget)
class BudgetAdmin(admin.ModelAdmin):
    list_display = ('category', 'amount', 'currency', 'period', 'start_date', 'user')
    list_filter = ('currency', 'period', 'start_date')
    search_fields = ('user__email', 'user__username', 'category__name')
    date_hierarchy = 'start_date'
    ordering = ('-start_date',)
    autocomplete_fields = ('user', 'category')


@admin.register(Report)
class ReportAdmin(admin.ModelAdmin):
    list_display = ('name', 'report_type', 'chart_type', 'user', 'is_favorite', 'created_at')
    list_filter = ('report_type', 'chart_type', 'is_favorite', 'created_at')
    search_fields = ('name', 'description', 'user__email', 'user__username')
    date_hierarchy = 'created_at'
    ordering = ('-created_at',)
    autocomplete_fields = ('user',)
    filter_horizontal = ('categories',)
