<!--
  Pie Chart Component

  A responsive and customizable pie/doughnut chart component using Chart.js.
  Features:
  - Supports both pie and doughnut chart types
  - Custom colors with automatic contrast calculation for labels
  - Percentage display in labels
  - Tooltips with formatted values
  - Animated transitions on data changes
  - Dark mode support
  - Legend customization
-->
<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import Chart from 'chart.js/auto';
	import { browser } from '$app/environment';
	import { theme } from '$lib/stores/ui';
	import { formatCurrency, formatNumber, formatPercentage } from '$lib/utils/format';
	import { getContrastTextColor, isLightColor } from '$lib/utils/helpers';
	import type { ChartData, ChartOptions } from 'chart.js';

	// Props with Svelte 5 runes
	const {
		// Data
		data = $props<ChartData<'pie' | 'doughnut'>>({ labels: [], datasets: [] }),

		// Chart type and appearance
		type = $props<'pie' | 'doughnut'>('pie'),
		height = $props<string | number>('300px'),
		width = $props<string | number>('100%'),
		colors = $props<string[]>([]),

		// Doughnut specific
		cutout = $props<string | number>('50%'),

		// Labels and formatting
		title = $props<string>(''),
		showLabels = $props<boolean>(true),
		showPercentages = $props<boolean>(true),
		currency = $props<string | undefined>(undefined),

		// Legend
		showLegend = $props<boolean>(true),
		legendPosition = $props<'top' | 'left' | 'bottom' | 'right'>('right'),

		// Interaction
		animationDuration = $props<number>(750),
		hoverOffset = $props<number>(15),

		// Other options
		options = $props<Partial<ChartOptions<'pie' | 'doughnut'>>>({})
	} = $props();

	// Local state
	let chartContainer: HTMLCanvasElement;
	let chart: Chart<'pie' | 'doughnut'>;

	// Default color palette (tailwind colors)
	const defaultColors = [
		'#3B82F6', // blue-500
		'#EF4444', // red-500
		'#10B981', // emerald-500
		'#F59E0B', // amber-500
		'#8B5CF6', // violet-500
		'#EC4899', // pink-500
		'#14B8A6', // teal-500
		'#6366F1', // indigo-500
		'#F97316', // orange-500
		'#84CC16' // lime-500
	];

	// Generate chart options based on props
	function generateChartOptions(): ChartOptions<'pie' | 'doughnut'> {
		const isDarkMode = $theme === 'dark';
		const textColor = isDarkMode ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.8)';

		return {
			responsive: true,
			maintainAspectRatio: false,
			animation: {
				duration: animationDuration
			},
			cutout: type === 'doughnut' ? cutout : 0,
			plugins: {
				title: {
					display: !!title,
					text: title,
					color: textColor,
					font: {
						size: 16,
						weight: 'bold'
					},
					padding: {
						top: 10,
						bottom: 20
					}
				},
				legend: {
					display: showLegend,
					position: legendPosition,
					labels: {
						color: textColor,
						padding: 16,
						font: {
							size: 12
						},
						generateLabels: (chart) => {
							const original = Chart.defaults.plugins.legend.labels.generateLabels(chart);

							// Add percentage to legend labels if requested
							if (showPercentages) {
								const total = chart.data.datasets[0].data.reduce(
									(sum, val) => sum + (val as number),
									0
								);

								original.forEach((label, i) => {
									const value = chart.data.datasets[0].data[i] as number;
									const percentage = (value / total) * 100;
									label.text = `${label.text} (${percentage.toFixed(1)}%)`;
								});
							}

							return original;
						}
					}
				},
				tooltip: {
					enabled: true,
					backgroundColor: isDarkMode ? 'rgba(0, 0, 0, 0.85)' : 'rgba(255, 255, 255, 0.9)',
					titleColor: isDarkMode ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.9)',
					bodyColor: isDarkMode ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.9)',
					padding: 10,
					cornerRadius: 6,
					boxPadding: 4,
					callbacks: {
						label: function (context) {
							const label = context.label || '';
							const value = context.raw as number;
							const total = context.dataset.data.reduce((sum: number, val: any) => sum + val, 0);
							const percentage = (value / total) * 100;

							let formattedValue;
							if (currency) {
								formattedValue = formatCurrency(value, currency);
							} else {
								formattedValue = formatNumber(value);
							}

							return `${label}: ${formattedValue} (${percentage.toFixed(1)}%)`;
						}
					}
				}
			},
			elements: {
				arc: {
					borderWidth: 2,
					borderColor: isDarkMode ? '#1F2937' : '#FFFFFF',
					hoverBorderColor: isDarkMode ? '#111827' : '#F9FAFB',
					hoverOffset: hoverOffset
				}
			},
			...options
		};
	}

	// Calculate appropriate text colors based on background colors
	function calculateDataColors(backgroundColor: string[] | string) {
		if (!Array.isArray(backgroundColor)) {
			return isLightColor(backgroundColor) ? '#000000' : '#FFFFFF';
		}

		return backgroundColor.map((color) => (isLightColor(color) ? '#000000' : '#FFFFFF'));
	}

	// Initialize or update the chart
	function updateChart() {
		if (!browser || !chartContainer) return;

		const ctx = chartContainer.getContext('2d');
		if (!ctx) return;

		// Apply colors and calculate text colors for datasets
		const coloredData = {
			...data,
			datasets: data.datasets.map((dataset) => {
				// Use colors from props, or dataset colors, or default colors
				const backgroundColors =
					colors.length > 0
						? colors
						: dataset.backgroundColor
							? dataset.backgroundColor
							: defaultColors;

				// Calculate contrasting text colors for labels
				const textColors = calculateDataColors(backgroundColors);

				return {
					...dataset,
					backgroundColor: backgroundColors,
					hoverBackgroundColor: backgroundColors,
					borderColor: $theme === 'dark' ? '#1F2937' : '#FFFFFF',
					hoverBorderColor: $theme === 'dark' ? '#111827' : '#F9FAFB',
					borderWidth: 2,
					// Add datalabels configuration if plugin is available
					datalabels: showLabels
						? {
								color: textColors,
								formatter: (value: number, context: any) => {
									if (!showLabels) return null;

									const total = dataset.data.reduce((sum: number, val: any) => sum + val, 0);
									const percentage = (value / total) * 100;

									// Only show percentage if it's significant enough
									if (percentage < 5) return '';

									return showPercentages ? `${percentage.toFixed(0)}%` : '';
								},
								font: {
									weight: 'bold',
									size: 12
								},
								textAlign: 'center'
							}
						: false
				};
			})
		};

		const options = generateChartOptions();

		// Create or update chart
		if (chart) {
			chart.data = coloredData;
			chart.options = options;
			chart.update();
		} else {
			chart = new Chart(ctx, {
				type,
				data: coloredData,
				options: options
			});
		}
	}

	// Update chart when props or theme changes
	$effect(() => {
		if (chart) {
			updateChart();
		}
	});

	// Initialize chart on mount
	onMount(() => {
		if (browser) {
			updateChart();
		}
	});

	// Cleanup on destroy
	onDestroy(() => {
		if (chart) {
			chart.destroy();
		}
	});
</script>

<div
	style="height: {typeof height === 'number' ? `${height}px` : height}; width: {typeof width ===
	'number'
		? `${width}px`
		: width};"
>
	<canvas bind:this={chartContainer}></canvas>
</div>

<style>
	div {
		position: relative;
		margin: 0 auto;
	}

	canvas {
		width: 100%;
		height: 100%;
	}
</style>
