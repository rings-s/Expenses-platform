from django.contrib import admin
from .models import Category, Expense, Budget, Report

class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'user', 'is_default', 'created_at')
    list_filter = ('is_default', 'user')
    search_fields = ('name', 'description')

class ExpenseAdmin(admin.ModelAdmin):
    list_display = ('description', 'amount', 'currency', 'date', 'category', 'user')
    list_filter = ('date', 'currency', 'payment_method', 'is_recurring')
    search_fields = ('description', 'notes')
    date_hierarchy = 'date'

class BudgetAdmin(admin.ModelAdmin):
    list_display = ('amount', 'currency', 'period', 'category', 'user', 'start_date')
    list_filter = ('period', 'currency')
    search_fields = ('user__email', 'category__name')

class ReportAdmin(admin.ModelAdmin):
    list_display = ('name', 'report_type', 'user', 'is_favorite', 'created_at')
    list_filter = ('report_type', 'is_favorite')
    search_fields = ('name', 'description')

# Register models
admin.site.register(Category, CategoryAdmin)
admin.site.register(Expense, ExpenseAdmin)
admin.site.register(Budget, BudgetAdmin)
admin.site.register(Report, ReportAdmin)
