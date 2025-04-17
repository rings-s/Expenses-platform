from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.http import HttpResponse, FileResponse
from django.utils import timezone
from django.shortcuts import get_object_or_404
from datetime import timedelta
import os

from .models import Category, Expense, Budget, Report
from .serializers import (
    CategorySerializer,
    ExpenseSerializer,
    BudgetSerializer,
    ReportSerializer,
    ExpenseSummarySerializer,
    CategoryExpenseSerializer,
    TimeSeriesDataSerializer
)
from .permissions import (
    IsExpenseOwner,
    IsCategoryOwner,
    IsBudgetOwner,
    IsReportOwner,
    IsExpenseAnalytics
)
from .utils import (
    get_date_range,
    get_expenses_summary,
    get_expenses_by_category,
    get_expense_time_series,
    get_budget_comparison,
    generate_expense_csv
)
from .visualizations import (
    generate_expense_by_category_chart,
    generate_expense_time_series_chart,
    generate_budget_comparison_chart,
    generate_expense_summary_chart,
    generate_expense_heatmap,
    save_chart_to_file
)
from accounts.permissions import EmailVerified


# Category Views
class CategoryListView(APIView):
    """
    List all categories or create a new category
    """
    permission_classes = [IsAuthenticated, EmailVerified]

    def get(self, request):
        categories = Category.objects.filter(user=request.user)
        serializer = CategorySerializer(categories, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = CategorySerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class CategoryDetailView(APIView):
    """
    Retrieve, update or delete a category
    """
    permission_classes = [IsAuthenticated, EmailVerified, IsCategoryOwner]

    def get_object(self, pk, user):
        category = get_object_or_404(Category, pk=pk)
        self.check_object_permissions(self.request, category)
        return category

    def get(self, request, pk):
        category = self.get_object(pk, request.user)
        serializer = CategorySerializer(category)
        return Response(serializer.data)

    def put(self, request, pk):
        category = self.get_object(pk, request.user)
        serializer = CategorySerializer(category, data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        category = self.get_object(pk, request.user)
        # Check if category has expenses
        if category.expenses.exists():
            return Response(
                {"detail": "Cannot delete category with expenses. Reassign or delete expenses first."},
                status=status.HTTP_400_BAD_REQUEST
            )
        category.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


# Expense Views
class ExpenseListView(APIView):
    """
    List all expenses or create a new expense
    """
    permission_classes = [IsAuthenticated, EmailVerified]

    def get(self, request):
        # Get filter parameters
        category_id = request.query_params.get('category')
        min_amount = request.query_params.get('min_amount')
        max_amount = request.query_params.get('max_amount')
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')
        payment_method = request.query_params.get('payment_method')

        # Base queryset filtered by user
        expenses = Expense.objects.filter(user=request.user)

        # Apply filters if provided
        if category_id:
            expenses = expenses.filter(category__id=category_id)
        if min_amount:
            expenses = expenses.filter(amount__gte=min_amount)
        if max_amount:
            expenses = expenses.filter(amount__lte=max_amount)
        if start_date:
            expenses = expenses.filter(date__gte=start_date)
        if end_date:
            expenses = expenses.filter(date__lte=end_date)
        if payment_method:
            expenses = expenses.filter(payment_method=payment_method)

        serializer = ExpenseSerializer(expenses, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = ExpenseSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ExpenseDetailView(APIView):
    """
    Retrieve, update or delete an expense
    """
    permission_classes = [IsAuthenticated, EmailVerified, IsExpenseOwner]

    def get_object(self, pk, user):
        expense = get_object_or_404(Expense, pk=pk)
        self.check_object_permissions(self.request, expense)
        return expense

    def get(self, request, pk):
        expense = self.get_object(pk, request.user)
        serializer = ExpenseSerializer(expense)
        return Response(serializer.data)

    def put(self, request, pk):
        expense = self.get_object(pk, request.user)
        serializer = ExpenseSerializer(expense, data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        expense = self.get_object(pk, request.user)
        expense.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


# Budget Views
class BudgetListView(APIView):
    """
    List all budgets or create a new budget
    """
    permission_classes = [IsAuthenticated, EmailVerified]

    def get(self, request):
        budgets = Budget.objects.filter(user=request.user)
        serializer = BudgetSerializer(budgets, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = BudgetSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class BudgetDetailView(APIView):
    """
    Retrieve, update or delete a budget
    """
    permission_classes = [IsAuthenticated, EmailVerified, IsBudgetOwner]

    def get_object(self, pk, user):
        budget = get_object_or_404(Budget, pk=pk)
        self.check_object_permissions(self.request, budget)
        return budget

    def get(self, request, pk):
        budget = self.get_object(pk, request.user)
        serializer = BudgetSerializer(budget)
        return Response(serializer.data)

    def put(self, request, pk):
        budget = self.get_object(pk, request.user)
        serializer = BudgetSerializer(budget, data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        budget = self.get_object(pk, request.user)
        budget.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


# Report Views
class ReportListView(APIView):
    """
    List all reports or create a new report
    """
    permission_classes = [IsAuthenticated, EmailVerified]

    def get(self, request):
        reports = Report.objects.filter(user=request.user)
        serializer = ReportSerializer(reports, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = ReportSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ReportDetailView(APIView):
    """
    Retrieve, update or delete a report
    """
    permission_classes = [IsAuthenticated, EmailVerified, IsReportOwner]

    def get_object(self, pk, user):
        report = get_object_or_404(Report, pk=pk)
        self.check_object_permissions(self.request, report)
        return report

    def get(self, request, pk):
        report = self.get_object(pk, request.user)
        serializer = ReportSerializer(report)
        return Response(serializer.data)

    def put(self, request, pk):
        report = self.get_object(pk, request.user)
        serializer = ReportSerializer(report, data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        report = self.get_object(pk, request.user)
        report.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


# Analytics Views
class ExpenseSummaryView(APIView):
    """
    Get expense summary statistics
    """
    permission_classes = [IsAuthenticated, EmailVerified, IsExpenseAnalytics]

    def get(self, request):
        # Get period parameter
        period = request.query_params.get('period', 'this_month')
        category_id = request.query_params.get('category')
        currency = request.query_params.get('currency', 'USD')
        custom_start = request.query_params.get('start_date')
        custom_end = request.query_params.get('end_date')

        # Get date range
        start_date, end_date = get_date_range(period, custom_start, custom_end)

        # Get category if specified
        category = None
        if category_id:
            category = get_object_or_404(Category, pk=category_id, user=request.user)

        # Get summary data
        summary_data = get_expenses_summary(
            user=request.user,
            start_date=start_date,
            end_date=end_date,
            category=category,
            currency=currency
        )

        # Add period name for chart title
        period_name = period.replace('_', ' ').title()

        # Serialize and return
        serializer = ExpenseSummarySerializer(summary_data)

        return Response({
            'summary': serializer.data,
            'chart': generate_expense_summary_chart(summary_data, period_name, currency)
        })


class ExpensesByCategoryView(APIView):
    """
    Get expenses grouped by category
    """
    permission_classes = [IsAuthenticated, EmailVerified, IsExpenseAnalytics]

    def get(self, request):
        # Get parameters
        period = request.query_params.get('period', 'this_month')
        chart_type = request.query_params.get('chart_type', 'pie')
        currency = request.query_params.get('currency', 'USD')
        custom_start = request.query_params.get('start_date')
        custom_end = request.query_params.get('end_date')

        # Get date range
        start_date, end_date = get_date_range(period, custom_start, custom_end)

        # Get expenses by category
        category_data = get_expenses_by_category(
            user=request.user,
            start_date=start_date,
            end_date=end_date,
            currency=currency
        )

        # Add period name for chart title
        period_name = period.replace('_', ' ').title()
        title = f'Expenses by Category - {period_name}'

        # Generate chart
        chart = generate_expense_by_category_chart(
            category_data=category_data,
            chart_type=chart_type,
            title=title
        )

        # Serialize and return
        serializer = CategoryExpenseSerializer(category_data, many=True)

        return Response({
            'data': serializer.data,
            'chart': chart
        })


class ExpensesTimeSeriesView(APIView):
    """
    Get expenses over time
    """
    permission_classes = [IsAuthenticated, EmailVerified, IsExpenseAnalytics]

    def get(self, request):
        # Get parameters
        period = request.query_params.get('period', 'this_month')
        chart_type = request.query_params.get('chart_type', 'line')
        group_by = request.query_params.get('group_by', 'auto')
        currency = request.query_params.get('currency', 'USD')
        category_id = request.query_params.get('category')
        custom_start = request.query_params.get('start_date')
        custom_end = request.query_params.get('end_date')

        # Get date range
        start_date, end_date = get_date_range(period, custom_start, custom_end)

        # Get category if specified
        category = None
        if category_id:
            category = get_object_or_404(Category, pk=category_id, user=request.user)

        # Get time series data
        time_series_data = get_expense_time_series(
            user=request.user,
            start_date=start_date,
            end_date=end_date,
            group_by=group_by,
            currency=currency,
            category=category
        )

        # Add period name for chart title
        period_name = period.replace('_', ' ').title()
        category_name = category.name if category else 'All Categories'
        title = f'Expenses Over Time - {category_name} - {period_name}'

        # Generate chart
        chart = generate_expense_time_series_chart(
            time_series_data=time_series_data,
            chart_type=chart_type,
            title=title,
            currency=currency
        )

        # Serialize and return
        serializer = TimeSeriesDataSerializer(time_series_data, many=True)

        return Response({
            'data': serializer.data,
            'chart': chart
        })


class BudgetComparisonView(APIView):
    """
    Get budget vs actual spending
    """
    permission_classes = [IsAuthenticated, EmailVerified, IsExpenseAnalytics]

    def get(self, request):
        # Get parameters
        period = request.query_params.get('period', 'current_month')
        chart_type = request.query_params.get('chart_type', 'bar')
        currency = request.query_params.get('currency', 'USD')

        # Get budget comparison data
        budget_data = get_budget_comparison(
            user=request.user,
            period=period,
            currency=currency
        )

        # Add period name for chart title
        period_name = period.replace('_', ' ').title()
        title = f'Budget vs Actual - {period_name}'

        # Generate chart
        chart = generate_budget_comparison_chart(
            budget_data=budget_data,
            chart_type=chart_type,
            title=title
        )

        return Response({
            'data': budget_data,
            'chart': chart
        })


class ExpenseExportView(APIView):
    """
    Export expense data as CSV
    """
    permission_classes = [IsAuthenticated, EmailVerified]

    def get(self, request):
        # Get parameters
        period = request.query_params.get('period', 'this_month')
        category_id = request.query_params.get('category')
        custom_start = request.query_params.get('start_date')
        custom_end = request.query_params.get('end_date')

        # Get date range
        start_date, end_date = get_date_range(period, custom_start, custom_end)

        # Get category if specified
        category = None
        if category_id:
            category = get_object_or_404(Category, pk=category_id, user=request.user)

        # Generate CSV
        csv_file = generate_expense_csv(
            user=request.user,
            start_date=start_date,
            end_date=end_date,
            category=category
        )

        # Period name for filename
        period_name = period.replace('_', '-')
        filename = f"expenses_{period_name}.csv"

        # Return file response
        response = FileResponse(
            open(csv_file, 'rb'),
            content_type='text/csv',
            as_attachment=True,
            filename=filename
        )

        # Clean up the temporary file after response is sent
        response._closable_objects.append(open(csv_file, 'rb'))

        return response


class ChartExportView(APIView):
    """
    Export chart as image file
    """
    permission_classes = [IsAuthenticated, EmailVerified]

    def post(self, request):
        # Get chart data from request
        chart_data = request.data.get('chart_data')
        if not chart_data:
            return Response(
                {"detail": "Chart data is required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Save chart to temporary file
        chart_file = save_chart_to_file(chart_data)

        # Return file response
        response = FileResponse(
            open(chart_file, 'rb'),
            content_type='image/png',
            as_attachment=True,
            filename="expense_chart.png"
        )

        # Clean up the temporary file after response is sent
        response._closable_objects.append(open(chart_file, 'rb'))

        return response
