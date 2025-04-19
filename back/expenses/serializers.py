from rest_framework import serializers
from django.db.models import Sum
from django.utils import timezone
from .models import Category, Expense, Budget, Report


class CategorySerializer(serializers.ModelSerializer):
    expense_count = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = ['id', 'name', 'description', 'color', 'icon', 'is_default',
                 'created_at', 'updated_at', 'expense_count']
        read_only_fields = ['id', 'created_at', 'updated_at', 'expense_count']

    def get_expense_count(self, obj):
        return obj.expenses.count()

    def create(self, validated_data):
        # Set the user from the request
        user = self.context['request'].user
        validated_data['user'] = user
        return super().create(validated_data)


class ExpenseSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    category_color = serializers.CharField(source='category.color', read_only=True)

    class Meta:
        model = Expense
        fields = ['id', 'amount', 'currency', 'description', 'date', 'category',
                 'category_name', 'category_color', 'payment_method', 'location',
                 'notes', 'is_recurring', 'receipt_image', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at', 'category_name', 'category_color']

    def validate_category(self, value):
        # Ensure the category belongs to the user
        if value and value.user != self.context['request'].user:
            raise serializers.ValidationError("You don't have permission to use this category.")
        return value

    def create(self, validated_data):
        # Set the user from the request
        user = self.context['request'].user
        validated_data['user'] = user
        return super().create(validated_data)


class BudgetSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    spent_amount = serializers.SerializerMethodField()
    remaining_amount = serializers.SerializerMethodField()
    percentage_used = serializers.SerializerMethodField()

    class Meta:
        model = Budget
        fields = ['id', 'amount', 'currency', 'period', 'start_date', 'category',
                 'category_name', 'spent_amount', 'remaining_amount',
                 'percentage_used', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at', 'category_name',
                          'spent_amount', 'remaining_amount', 'percentage_used']

    def get_spent_amount(self, obj):
        return obj.get_spent_amount()

    def get_remaining_amount(self, obj):
        spent = self.get_spent_amount(obj)
        return float(obj.amount) - float(spent)

    def get_percentage_used(self, obj):
        spent = float(self.get_spent_amount(obj))
        if float(obj.amount) > 0:
            return round((spent / float(obj.amount)) * 100, 2)
        return 0.0

    def validate_category(self, value):
        # Ensure the category belongs to the user if specified
        if value and value.user != self.context['request'].user:
            raise serializers.ValidationError("You don't have permission to use this category.")
        return value

    def create(self, validated_data):
        # Set the user from the request
        user = self.context['request'].user
        validated_data['user'] = user
        return super().create(validated_data)



class ReportSerializer(serializers.ModelSerializer):
    categories_data = CategorySerializer(source='categories', many=True, read_only=True)

    class Meta:
        model = Report
        fields = ['id', 'name', 'description', 'report_type', 'chart_type',
                 'start_date', 'end_date', 'parameters', 'categories',
                 'categories_data', 'is_favorite', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at', 'categories_data']

    def validate(self, data):
        # Convert parameters to a string if it's a dict
        if 'parameters' in data and isinstance(data['parameters'], dict):
            import json
            data['parameters'] = json.dumps(data['parameters'])
        return data

    def validate_categories(self, categories):
        # Allow empty category list
        if not categories:
            return categories

        # Ensure all categories belong to the user
        user = self.context['request'].user
        for category in categories:
            if category.user != user:
                raise serializers.ValidationError(
                    f"You don't have permission to use category: {category.name}"
                )
        return categories

    def create(self, validated_data):
        # Handle many-to-many relationship manually
        categories = validated_data.pop('categories', [])

        # Set the user from the request
        user = self.context['request'].user
        validated_data['user'] = user

        # Create the report
        report = Report.objects.create(**validated_data)

        # Add categories
        report.categories.set(categories)

        return report



class ExpenseSummarySerializer(serializers.Serializer):
    """Serializer for expense summary data"""
    total_expenses = serializers.DecimalField(max_digits=12, decimal_places=2)
    expense_count = serializers.IntegerField()
    average_expense = serializers.DecimalField(max_digits=12, decimal_places=2)
    highest_expense = serializers.DecimalField(max_digits=12, decimal_places=2)
    start_date = serializers.DateField()
    end_date = serializers.DateField()

    # No need for create/update methods as this is a read-only serializer


class CategoryExpenseSerializer(serializers.Serializer):
    """Serializer for category-based expense analytics"""
    category_id = serializers.UUIDField()
    category_name = serializers.CharField()
    category_color = serializers.CharField()
    total_amount = serializers.DecimalField(max_digits=12, decimal_places=2)
    expense_count = serializers.IntegerField()
    percentage = serializers.FloatField()

    # No need for create/update methods as this is a read-only serializer


class TimeSeriesDataSerializer(serializers.Serializer):
    """Serializer for time-based expense analytics"""
    date = serializers.DateField()
    amount = serializers.DecimalField(max_digits=12, decimal_places=2)
    count = serializers.IntegerField()

    # No need for create/update methods as this is a read-only serializer
