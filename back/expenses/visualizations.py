import matplotlib
# Force matplotlib to use the Agg backend (compatible with headless servers)
matplotlib.use('Agg')

import matplotlib.pyplot as plt
import matplotlib.dates as mdates
from matplotlib.colors import LinearSegmentedColormap
import matplotlib.ticker as ticker
import numpy as np
import io
import base64
from datetime import timedelta
import os
import tempfile

# Set default matplotlib styles for better appearance
plt.style.use('ggplot')


def generate_expense_by_category_chart(category_data, chart_type='pie', title='Expenses by Category'):
    """Generate a pie or bar chart for expenses by category"""
    # Create figure and axis
    plt.figure(figsize=(10, 6), dpi=100)

    # Extract data from category_data
    labels = [item['category_name'] for item in category_data]
    sizes = [float(item['total_amount']) for item in category_data]
    colors = [item['category_color'] for item in category_data]

    # If no data, create an empty chart with a message
    if not sizes or all(size == 0 for size in sizes):
        plt.text(0.5, 0.5, 'No expense data available',
                horizontalalignment='center', verticalalignment='center',
                transform=plt.gca().transAxes, fontsize=14)
        plt.axis('off')
    else:
        if chart_type == 'pie':
            # Create pie chart
            plt.pie(sizes, colors=colors, autopct='%1.1f%%', startangle=140, shadow=False)
            plt.axis('equal')  # Equal aspect ratio ensures that pie is drawn as a circle

            # Add legend
            plt.legend(labels, loc='upper left', bbox_to_anchor=(-0.1, 1.),
                      fontsize='small')

        elif chart_type == 'bar':
            # Create bar chart
            bars = plt.bar(range(len(labels)), sizes, color=colors)
            plt.xticks(range(len(labels)), labels, rotation=45, ha='right')
            plt.subplots_adjust(bottom=0.3)

            # Add labels on top of bars
            for bar in bars:
                height = bar.get_height()
                plt.text(bar.get_x() + bar.get_width()/2., height + 0.1,
                        f'${height:.2f}', ha='center', va='bottom')

            # Format y-axis to show currency
            plt.gca().yaxis.set_major_formatter(ticker.StrMethodFormatter('${x:,.2f}'))

            # Add grid for bar chart
            plt.grid(axis='y', linestyle='--', alpha=0.7)

    # Add title
    plt.title(title)
    plt.tight_layout()

    # Save figure to a bytes buffer
    buf = io.BytesIO()
    plt.savefig(buf, format='png')
    plt.close()

    # Encode the image as base64
    buf.seek(0)
    image_base64 = base64.b64encode(buf.read()).decode('utf-8')

    return f"data:image/png;base64,{image_base64}"


def generate_expense_time_series_chart(time_series_data, chart_type='line', title='Expenses Over Time', currency='USD'):
    """Generate a line or bar chart for expenses over time"""
    # Create figure and axis
    plt.figure(figsize=(12, 6), dpi=100)

    # Extract data
    dates = [item['date'] for item in time_series_data]
    amounts = [float(item['amount']) for item in time_series_data]

    # If no data, create an empty chart with a message
    if not dates or all(amount == 0 for amount in amounts):
        plt.text(0.5, 0.5, 'No expense data available',
                horizontalalignment='center', verticalalignment='center',
                transform=plt.gca().transAxes, fontsize=14)
        plt.axis('off')
    else:
        # Determine date formatting based on date range
        date_range = (max(dates) - min(dates)).days

        if chart_type == 'line':
            # Create line chart
            plt.plot(dates, amounts, marker='o', linestyle='-', color='#0066cc', markersize=4)

            # Add area under the line with light color
            plt.fill_between(dates, amounts, alpha=0.2, color='#0066cc')

        elif chart_type == 'bar':
            # Create bar chart
            plt.bar(dates, amounts, color='#0066cc', width=0.8)

        # Format x-axis based on date range
        if date_range <= 31:
            # Daily data
            plt.gca().xaxis.set_major_formatter(mdates.DateFormatter('%b %d'))
            plt.gca().xaxis.set_major_locator(mdates.DayLocator(interval=max(1, date_range // 10)))
        elif date_range <= 365:
            # Monthly data
            plt.gca().xaxis.set_major_formatter(mdates.DateFormatter('%b %Y'))
            plt.gca().xaxis.set_major_locator(mdates.MonthLocator())
        else:
            # Yearly data
            plt.gca().xaxis.set_major_formatter(mdates.DateFormatter('%Y'))
            plt.gca().xaxis.set_major_locator(mdates.YearLocator())

        # Rotate date labels for better readability
        plt.xticks(rotation=45, ha='right')

        # Format y-axis to show currency
        plt.gca().yaxis.set_major_formatter(ticker.StrMethodFormatter('${x:,.2f}'))

        # Add grid
        plt.grid(True, linestyle='--', alpha=0.7)

        # Add currency label to y-axis
        plt.ylabel(f'Amount ({currency})')

    # Add title
    plt.title(title)
    plt.tight_layout()

    # Save figure to a bytes buffer
    buf = io.BytesIO()
    plt.savefig(buf, format='png')
    plt.close()

    # Encode the image as base64
    buf.seek(0)
    image_base64 = base64.b64encode(buf.read()).decode('utf-8')

    return f"data:image/png;base64,{image_base64}"


def generate_budget_comparison_chart(budget_data, title='Budget vs Actual', chart_type='bar'):
    """Generate a bar chart comparing budget vs actual spending"""
    # Create figure and axis
    plt.figure(figsize=(12, 6), dpi=100)

    # Extract data
    categories = [item['category_name'] for item in budget_data]
    budget_amounts = [float(item['budget_amount']) for item in budget_data]
    actual_amounts = [float(item['actual_amount']) for item in budget_data]

    # If no data, create an empty chart with a message
    if not categories:
        plt.text(0.5, 0.5, 'No budget data available',
                horizontalalignment='center', verticalalignment='center',
                transform=plt.gca().transAxes, fontsize=14)
        plt.axis('off')
    else:
        # Set up x positions
        x = np.arange(len(categories))
        width = 0.35

        # Create grouped bar chart
        plt.bar(x - width/2, budget_amounts, width, label='Budget', color='#3A86FF')
        plt.bar(x + width/2, actual_amounts, width, label='Actual', color='#FF006E')

        # Label settings
        plt.xticks(x, categories, rotation=45, ha='right')
        plt.legend()

        # Format y-axis to show currency
        plt.gca().yaxis.set_major_formatter(ticker.StrMethodFormatter('${x:,.2f}'))

        # Add grid
        plt.grid(axis='y', linestyle='--', alpha=0.7)

        # Add data labels on top of bars
        for i, budget in enumerate(budget_amounts):
            if budget > 0:
                plt.text(i - width/2, budget + 10, f'${budget:.0f}',
                        ha='center', va='bottom', fontsize=8)

        for i, actual in enumerate(actual_amounts):
            if actual > 0:
                plt.text(i + width/2, actual + 10, f'${actual:.0f}',
                        ha='center', va='bottom', fontsize=8)

                # Highlight over-budget categories
                if actual > budget_amounts[i] and budget_amounts[i] > 0:
                    plt.text(i, max(actual, budget_amounts[i]) + 30, '⚠️ Over Budget',
                            ha='center', va='bottom', fontsize=8, color='red')

    # Add title
    plt.title(title)
    plt.tight_layout()

    # Save figure to a bytes buffer
    buf = io.BytesIO()
    plt.savefig(buf, format='png')
    plt.close()

    # Encode the image as base64
    buf.seek(0)
    image_base64 = base64.b64encode(buf.read()).decode('utf-8')

    return f"data:image/png;base64,{image_base64}"


def generate_expense_summary_chart(summary_data, period_name, currency='USD'):
    """Generate a summary dashboard with key metrics"""
    # Create figure with subplots
    fig, axs = plt.subplots(2, 2, figsize=(12, 8), dpi=100)
    fig.suptitle(f'Expense Summary for {period_name}', fontsize=16)

    # Extract data
    total = float(summary_data.get('total_expenses', 0))
    count = summary_data.get('expense_count', 0)
    average = float(summary_data.get('average_expense', 0))
    highest = float(summary_data.get('highest_expense', 0))

    # Define color based on total amount
    # Use a gradient from green (low) to red (high)
    if total > 0:
        # Create a color map based on total amount
        # This is just an example, adjust thresholds as needed
        if total < 100:
            color = '#3FB618'  # Green
        elif total < 500:
            color = '#FFBC05'  # Yellow
        else:
            color = '#FF0039'  # Red
    else:
        color = '#3FB618'  # Default green

    # 1. Total Expenses - Large number display
    axs[0, 0].text(0.5, 0.5, f"${total:,.2f}", ha='center', va='center', fontsize=24, color=color)
    axs[0, 0].text(0.5, 0.85, "Total Expenses", ha='center', va='center', fontsize=14)
    axs[0, 0].text(0.5, 0.15, f"Currency: {currency}", ha='center', va='center', fontsize=10)
    axs[0, 0].axis('off')

    # 2. Expense Count - Large number display
    axs[0, 1].text(0.5, 0.5, f"{count}", ha='center', va='center', fontsize=24)
    axs[0, 1].text(0.5, 0.85, "Number of Expenses", ha='center', va='center', fontsize=14)
    axs[0, 1].axis('off')

    # 3. Average Expense - Large number display
    axs[1, 0].text(0.5, 0.5, f"${average:,.2f}", ha='center', va='center', fontsize=24)
    axs[1, 0].text(0.5, 0.85, "Average Expense", ha='center', va='center', fontsize=14)
    axs[1, 0].axis('off')

    # 4. Highest Expense - Large number display
    axs[1, 1].text(0.5, 0.5, f"${highest:,.2f}", ha='center', va='center', fontsize=24)
    axs[1, 1].text(0.5, 0.85, "Highest Expense", ha='center', va='center', fontsize=14)
    axs[1, 1].axis('off')

    # Add period range in the figure
    start_date = summary_data.get('start_date')
    end_date = summary_data.get('end_date')
    if start_date and end_date:
        date_range = f"Period: {start_date.strftime('%Y-%m-%d')} to {end_date.strftime('%Y-%m-%d')}"
        fig.text(0.5, 0.02, date_range, ha='center', fontsize=10)

    plt.tight_layout(rect=[0, 0.03, 1, 0.95])

    # Save figure to a bytes buffer
    buf = io.BytesIO()
    plt.savefig(buf, format='png')
    plt.close()

    # Encode the image as base64
    buf.seek(0)
    image_base64 = base64.b64encode(buf.read()).decode('utf-8')

    return f"data:image/png;base64,{image_base64}"


def generate_expense_heatmap(expense_data, year, title='Monthly Expense Heatmap'):
    """Generate a calendar heatmap of daily expenses"""
    # Earlier code...

    # Create a colormap from green to red
    cmap = LinearSegmentedColormap.from_list('GreenToRed', ['#3FB618', '#FFBC05', '#FF0039'])

    # For each month
    for month_idx, (month, ax) in enumerate(zip(range(1, 13), axs)):
        # Set title as month name
        ax.set_title(month_names[month_idx])

        # Create heatmap
        im = ax.imshow(data, cmap=cmap, aspect='auto', vmin=0, vmax=max_daily_expense)

        # Remove axis ticks
        ax.set_xticks([])
        ax.set_yticks([])

        # Add day of week labels
        days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
        for i, day in enumerate(days):
            ax.text(i, -0.5, day, ha='center', va='center')

    # Add colorbar
    cbar = fig.colorbar(im, ax=axs, orientation='horizontal', pad=0.05)
    cbar.set_label(f'Daily Expense Amount ($)')

    # Add title
    fig.suptitle(title, fontsize=16)
    plt.tight_layout(rect=[0, 0.03, 1, 0.95])

    # Save figure to a bytes buffer
    buf = io.BytesIO()
    plt.savefig(buf, format='png')
    plt.close()

    # Encode the image as base64
    buf.seek(0)
    image_base64 = base64.b64encode(buf.read()).decode('utf-8')

    return f"data:image/png;base64,{image_base64}"


def save_chart_to_file(chart_data, filename=None):
    """Save base64 chart data to a file"""
    if filename is None:
        # Create a temporary file
        temp_file = tempfile.NamedTemporaryFile(delete=False, suffix='.png')
        filename = temp_file.name

    # Remove data URL prefix
    if chart_data.startswith('data:image/png;base64,'):
        chart_data = chart_data.replace('data:image/png;base64,', '')

    # Decode base64 and save to file
    with open(filename, 'wb') as f:
        f.write(base64.b64decode(chart_data))

    return filename
