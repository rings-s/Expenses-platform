from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.http import HttpResponse, FileResponse
from django.utils import timezone
from django.shortcuts import get_object_or_404
from datetime import timedelta
import os
import json

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
    IsResourceOwner,  # Updated from IsOwner
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
import base64
import tempfile
import logging
logger = logging.getLogger(__name__)

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



class ReportListView(APIView):
    """
    List all reports or create a new report
    """
    permission_classes = [IsAuthenticated, EmailVerified]

    def get(self, request):
        """List all reports"""
        reports = Report.objects.filter(user=request.user)
        serializer = ReportSerializer(reports, many=True)
        return Response(serializer.data)

    def post(self, request):
        """Create a new report"""
        # Debug the incoming data
        logger = logging.getLogger(__name__)
        logger.info(f"Report data received: {request.data}")

        serializer = ReportSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        # Log validation errors
        logger.error(f"Report validation errors: {serializer.errors}")
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

# Add these imports at the top of the file
import logging
logger = logging.getLogger(__name__)

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
        logger.info(f"Budget creation request received: {request.data}")

        serializer = BudgetSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            budget = serializer.save()
            logger.info(f"Budget created successfully with ID: {budget.id}")
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        logger.error(f"Budget validation errors: {serializer.errors}")
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


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
        try:
            # Get chart data from request
            chart_data = request.data.get('chart_data')

            if not chart_data:
                return Response(
                    {"detail": "Chart data is required"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Remove data URL prefix if present
            if chart_data.startswith('data:image/png;base64,'):
                chart_data = chart_data.split(',')[1]

            try:
                # Decode base64 image
                image_data = base64.b64decode(chart_data)
            except Exception as decode_error:
                return Response(
                    {"detail": f"Invalid base64 data: {str(decode_error)}"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Create a temporary file
            temp_file = tempfile.NamedTemporaryFile(delete=False, suffix='.png')
            temp_filename = temp_file.name
            temp_file.write(image_data)
            temp_file.close()

            # Return file response
            response = FileResponse(
                open(temp_filename, 'rb'),
                content_type='image/png',
                as_attachment=True,
                filename="expense_chart.png"
            )

            # Use FileResponse's built-in file handling
            # FileResponse will close the file when the response is completed

            return response

        except Exception as e:
            import traceback
            print(f"Chart export error: {str(e)}")
            print(traceback.format_exc())
            return Response(
                {"detail": f"Error generating chart: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class ExpenseHeatmapView(APIView):
    """
    Generate a calendar heatmap of expenses
    """
    permission_classes = [IsAuthenticated, EmailVerified, IsExpenseAnalytics]

    def get(self, request):
        # Get year parameter (default to current year)
        year = int(request.query_params.get('year', timezone.now().year))

        # Get all expenses for the user in that year
        start_date = timezone.datetime(year, 1, 1).date()
        end_date = timezone.datetime(year, 12, 31).date()

        expenses = Expense.objects.filter(
            user=request.user,
            date__gte=start_date,
            date__lte=end_date
        ).values('date', 'amount')

        # Generate heatmap
        heatmap = generate_expense_heatmap(
            expense_data=list(expenses),
            year=year,
            title=f'Expense Calendar for {year}'
        )

        return Response({
            'chart': heatmap
        })
