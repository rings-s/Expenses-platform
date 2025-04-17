from django.urls import path
from .views import (
    CategoryListView,
    CategoryDetailView,
    ExpenseListView,
    ExpenseDetailView,
    BudgetListView,
    BudgetDetailView,
    ReportListView,
    ReportDetailView,
    ExpenseSummaryView,
    ExpensesByCategoryView,
    ExpensesTimeSeriesView,
    BudgetComparisonView,
    ExpenseExportView,
    ChartExportView
)

app_name = 'expenses'

urlpatterns = [
    # Category endpoints
    path('categories/', CategoryListView.as_view(), name='category-list'),
    path('categories/<uuid:pk>/', CategoryDetailView.as_view(), name='category-detail'),

    # Expense endpoints
    path('expenses/', ExpenseListView.as_view(), name='expense-list'),
    path('expenses/<uuid:pk>/', ExpenseDetailView.as_view(), name='expense-detail'),

    # Budget endpoints
    path('budgets/', BudgetListView.as_view(), name='budget-list'),
    path('budgets/<uuid:pk>/', BudgetDetailView.as_view(), name='budget-detail'),

    # Report endpoints
    path('reports/', ReportListView.as_view(), name='report-list'),
    path('reports/<uuid:pk>/', ReportDetailView.as_view(), name='report-detail'),

    # Analytics endpoints
    path('analytics/summary/', ExpenseSummaryView.as_view(), name='expense-summary'),
    path('analytics/by-category/', ExpensesByCategoryView.as_view(), name='expenses-by-category'),
    path('analytics/time-series/', ExpensesTimeSeriesView.as_view(), name='expenses-time-series'),
    path('analytics/budget-comparison/', BudgetComparisonView.as_view(), name='budget-comparison'),

    # Export endpoints
    path('export/csv/', ExpenseExportView.as_view(), name='export-csv'),
    path('export/chart/', ChartExportView.as_view(), name='export-chart'),
]
