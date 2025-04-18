<!-- frontend/src/lib/components/reports/ReportInsights.svelte -->
<script>
	import { formatCurrency, formatPercentage } from '$lib/utils/formatters';

	export let summary = null;
	export let categoryData = [];
	export let timeSeriesData = [];

	// Generate insights based on the data
	$: insights = generateInsights(summary, categoryData, timeSeriesData);

	function generateInsights(summary, categoryData, timeSeriesData) {
		const insights = [];

		// Add summary insights
		if (summary) {
			if (summary.expense_count > 0) {
				insights.push({
					type: 'summary',
					title: 'Overall Spending',
					description: `You spent ${formatCurrency(summary.total_expenses)} across ${summary.expense_count} transactions with an average of ${formatCurrency(summary.average_expense)} per expense.`,
					icon: 'money'
				});

				if (summary.highest_expense > summary.average_expense * 2) {
					insights.push({
						type: 'alert',
						title: 'Large Expense Detected',
						description: `Your highest expense of ${formatCurrency(summary.highest_expense)} is significantly above your average spending of ${formatCurrency(summary.average_expense)}.`,
						icon: 'alert'
					});
				}
			}
		}

		// Add category insights
		if (categoryData && categoryData.length > 0) {
			// Find top spending category
			const topCategory = [...categoryData].sort((a, b) => b.total_amount - a.total_amount)[0];
			if (topCategory) {
				insights.push({
					type: 'category',
					title: 'Top Spending Category',
					description: `Your highest spending is in ${topCategory.category_name} at ${formatCurrency(topCategory.total_amount)} (${formatPercentage(topCategory.percentage)} of total spending).`,
					icon: 'category',
					color: topCategory.category_color
				});
			}

			// Find categories with only one expense
			const singleExpenseCategories = categoryData.filter((c) => c.expense_count === 1);
			if (singleExpenseCategories.length > 0) {
				insights.push({
					type: 'info',
					title: 'One-time Expenses',
					description: `You have one-time expenses in ${singleExpenseCategories.length} categories.`,
					icon: 'info'
				});
			}
		}

		// Add time series insights
		if (timeSeriesData && timeSeriesData.length > 3) {
			// Check for spending trend
			const firstHalf = timeSeriesData.slice(0, Math.floor(timeSeriesData.length / 2));
			const secondHalf = timeSeriesData.slice(Math.floor(timeSeriesData.length / 2));

			const firstHalfAvg =
				firstHalf.reduce((sum, item) => sum + parseFloat(item.amount), 0) / firstHalf.length;
			const secondHalfAvg =
				secondHalf.reduce((sum, item) => sum + parseFloat(item.amount), 0) / secondHalf.length;

			const percentChange = ((secondHalfAvg - firstHalfAvg) / firstHalfAvg) * 100;

			if (Math.abs(percentChange) > 20) {
				insights.push({
					type: percentChange > 0 ? 'warning' : 'success',
					title: `Spending ${percentChange > 0 ? 'Increase' : 'Decrease'} Trend`,
					description: `Your spending has ${percentChange > 0 ? 'increased' : 'decreased'} by ${formatPercentage(Math.abs(percentChange))} in the second half of this period.`,
					icon: percentChange > 0 ? 'trending-up' : 'trending-down'
				});
			}
		}

		return insights;
	}

	// Icon components
	const icons = {
		money: `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clip-rule="evenodd" />
                  </svg>`,
		alert: `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                  </svg>`,
		category: `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h5c.256 0 .512.098.707.293l7 7zM5 6a1 1 0 100-2 1 1 0 000 2z" clip-rule="evenodd" />
                    </svg>`,
		info: `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                   <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zm-1 7a1 1 0 100 2h.01a1 1 0 100-2H10z" clip-rule="evenodd" />
                 </svg>`,
		'trending-up': `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fill-rule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clip-rule="evenodd" />
                        </svg>`,
		'trending-down': `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M12 13a1 1 0 100 2h5a1 1 0 001-1v-5a1 1 0 10-2 0v2.586l-4.293-4.293a1 1 0 00-1.414 0L8 9.586 3.707 5.293a1 1 0 00-1.414 1.414l5 5a1 1 0 001.414 0L11 9.414 14.586 13H12z" clip-rule="evenodd" />
                          </svg>`
	};

	// Background colors for different insight types
	const bgColors = {
		summary: 'bg-blue-50 text-blue-700',
		alert: 'bg-red-50 text-red-700',
		warning: 'bg-yellow-50 text-yellow-700',
		success: 'bg-green-50 text-green-700',
		info: 'bg-indigo-50 text-indigo-700',
		category: 'bg-purple-50 text-purple-700'
	};
</script>

<div class="overflow-hidden rounded-lg bg-white shadow">
	<div class="p-4">
		<h3 class="mb-4 text-lg font-medium text-gray-900">Insights & Recommendations</h3>

		{#if insights.length > 0}
			<div class="space-y-3">
				{#each insights as insight}
					<div class={`rounded-lg p-4 ${bgColors[insight.type] || 'bg-gray-50 text-gray-700'}`}>
						<div class="flex items-start">
							<div class="flex-shrink-0">
								<!-- Customized icon color for category insights -->
								{#if insight.type === 'category' && insight.color}
									<div class="h-5 w-5" style="color: {insight.color}">
										{@html icons[insight.icon]}
									</div>
								{:else}
									<div class="h-5 w-5">
										{@html icons[insight.icon]}
									</div>
								{/if}
							</div>
							<div class="ml-3">
								<h4 class="text-sm font-medium">{insight.title}</h4>
								<p class="mt-1 text-sm">{insight.description}</p>
							</div>
						</div>
					</div>
				{/each}
			</div>
		{:else}
			<div class="rounded-lg bg-gray-50 p-6 text-center">
				<p class="text-gray-500">
					Not enough data to generate insights. Keep tracking your expenses!
				</p>
			</div>
		{/if}
	</div>
</div>
