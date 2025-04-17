# Expense Management System

This document provides an overview of the expenses app, which is designed to work alongside the existing accounts app to create a comprehensive expense tracking and visualization system.

## Features

- **Expense Tracking**: Create, read, update, and delete expenses with detailed information
- **Categorization**: Organize expenses into customizable categories
- **Budgeting**: Set budgets for different categories and periods
- **Reports**: Save and reuse report configurations
- **Data Visualization**: Generate charts and graphs using matplotlib
- **Analytics**: View spending trends, category breakdowns, and budget comparisons
- **Export**: Export expense data as CSV and charts as images

## Installation

1. Make sure Python 3.13 and Django 5.1.4 are installed
2. Install the required packages:

```bash
pip install matplotlib pandas numpy
```

3. Run database migrations:

```bash
python manage.py makemigrations expenses
python manage.py migrate
```

4. Load sample data (optional):

```bash
python manage.py loaddata expenses/fixtures/sample_data.json
```

5. Run the development server:

```bash
python manage.py runserver
```

## API Endpoints

### Categories

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/expenses/categories/` | GET | List all categories |
| `/api/expenses/categories/` | POST | Create a new category |
| `/api/expenses/categories/{id}/` | GET | Get category details |
| `/api/expenses/categories/{id}/` | PUT | Update a category |
| `/api/expenses/categories/{id}/` | DELETE | Delete a category |

### Expenses

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/expenses/expenses/` | GET | List all expenses |
| `/api/expenses/expenses/` | POST | Create a new expense |
| `/api/expenses/expenses/{id}/` | GET | Get expense details |
| `/api/expenses/expenses/{id}/` | PUT | Update an expense |
| `/api/expenses/expenses/{id}/` | DELETE | Delete an expense |

### Budgets

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/expenses/budgets/` | GET | List all budgets |
| `/api/expenses/budgets/` | POST | Create a new budget |
| `/api/expenses/budgets/{id}/` | GET | Get budget details |
| `/api/expenses/budgets/{id}/` | PUT | Update a budget |
| `/api/expenses/budgets/{id}/` | DELETE | Delete a budget |

### Reports

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/expenses/reports/` | GET | List all saved reports |
| `/api/expenses/reports/` | POST | Create a new report |
| `/api/expenses/reports/{id}/` | GET | Get report details |
| `/api/expenses/reports/{id}/` | PUT | Update a report |
| `/api/expenses/reports/{id}/` | DELETE | Delete a report |

### Analytics

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/expenses/analytics/summary/` | GET | Get expense summary stats |
| `/api/expenses/analytics/by-category/` | GET | Get expenses by category |
| `/api/expenses/analytics/time-series/` | GET | Get time series expense data |
| `/api/expenses/analytics/budget-comparison/` | GET | Compare budgets with actual spending |

### Export

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/expenses/export/csv/` | GET | Export expenses as CSV |
| `/api/expenses/export/chart/` | POST | Export charts as images |

## Data Models

### Category

The `Category` model stores expense categories:

- `id`: UUID primary key
- `name`: Category name
- `description`: Optional category description
- `color`: Hex color code for visualizations
- `icon`: Optional icon name
- `user`: Foreign key to user who owns the category
- `is_default`: Boolean flag for default categories

### Expense

The `Expense` model stores individual expenses:

- `id`: UUID primary key
- `amount`: Decimal amount of the expense
- `currency`: Currency code (USD, EUR, etc.)
- `description`: Description of the expense
- `date`: Date of the expense
- `user`: Foreign key to user who created the expense
- `category`: Foreign key to category
- `payment_method`: Method of payment (cash, credit card, etc.)
- `location`: Optional location information
- `notes`: Additional notes about the expense
- `is_recurring`: Flag for recurring expenses
- `receipt_image`: Optional uploaded receipt image

### Budget

The `Budget` model stores budget targets:

- `id`: UUID primary key
- `amount`: Decimal amount of the budget
- `currency`: Currency code (USD, EUR, etc.)
- `period`: Budget period (daily, weekly, monthly, etc.)
- `start_date`: Start date of the budget period
- `user`: Foreign key to user who created the budget
- `category`: Foreign key to category (optional for overall budget)

### Report

The `Report` model stores saved report configurations:

- `id`: UUID primary key
- `name`: Report name
- `description`: Report description
- `report_type`: Type of report (by category, over time, etc.)
- `chart_type`: Type of chart to display (bar, line, pie, etc.)
- `start_date`: Start date for report data
- `end_date`: End date for report data
- `parameters`: JSON field for additional parameters
- `user`: Foreign key to user who created the report
- `categories`: Many-to-many relationship to categories

## Data Visualization

The app uses matplotlib to generate visualizations of expense data:

### Types of Charts

1. **Pie Charts**: Show expense distribution by category
2. **Bar Charts**: Compare expenses across categories or time periods
3. **Line Charts**: Show expense trends over time
4. **Stacked Bar Charts**: Compare budget versus actual spending

### Visualization Features

- **Responsive Design**: Charts adapt to different date ranges
- **Color Coding**: Categories use consistent colors across visualizations
- **Interactive Elements**: Tooltips and legends for better readability
- **Export Options**: Save charts as PNG images
- **Customization**: Configure chart types and parameters

## Query Parameters

Analytics endpoints accept the following query parameters:

- `period`: Predefined periods like `today`, `this_week`, `this_month`, `last_year`
- `start_date`: Custom start date (YYYY-MM-DD)
- `end_date`: Custom end date (YYYY-MM-DD)
- `category`: Category ID to filter by
- `currency`: Currency code to filter by (default: USD)
- `chart_type`: Type of chart to generate (pie, bar, line)
- `group_by`: Time grouping (day, week, month, year, auto)

## Frontend Integration

To integrate with a frontend application:

1. The API returns both data and chart images (as base64 encoded strings)
2. Frontend can display the charts directly using the encoded image data
3. For interactive charts, frontend can use the raw data with a JavaScript charting library

## Best Practices

1. **Budget Management**: Create budgets for major expense categories
2. **Regular Tracking**: Add expenses promptly for accurate reporting
3. **Categorization**: Use consistent categories for better analysis
4. **Data Export**: Regularly export data for backup purposes
5. **Report Configuration**: Save frequently used report configurations

## Security Considerations

The app implements:

- **Object-level permissions**: Users can only access their own data
- **JWT Authentication**: Secure authentication with the accounts app
- **Input validation**: Strict validation of input data
- **Email verification**: Integration with the accounts app email verification

## Dependencies

- **Django 5.1.4**: Web framework
- **Django REST Framework**: API development
- **Matplotlib**: Data visualization library
- **NumPy**: Numerical calculations
- **Python 3.13**: Programming language

## Future Enhancements

1. **Mobile App Integration**: Add mobile-specific API endpoints
2. **Currency Conversion**: Support for currency conversion in reports
3. **Advanced Analytics**: Machine learning for expense predictions
4. **Sharing**: Share reports with other users
5. **Notifications**: Budget alerts and reminders
