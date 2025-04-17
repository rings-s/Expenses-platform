<!--
  Bar Chart Component

  A responsive and customizable bar chart component using Chart.js.
  Features:
  - Horizontal or vertical orientation
  - Multiple datasets with custom colors
  - Animated transitions
  - Customizable labels and tooltips
  - Dark mode support
  - Legend options
-->
<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import Chart from 'chart.js/auto';
	import { browser } from '$app/environment';
	import { theme } from '$lib/stores/ui';
	import { formatCurrency, formatNumber } from '$lib/utils/format';
	import { isLightColor, getContrastTextColor } from '$lib/utils/helpers';
	import type { ChartData, ChartOptions } from 'chart.js';

	// Props with Svelte 5 runes
	const {
		// Data
		data = $props<ChartData<'bar'>>({ labels: [], datasets: [] }),

		// Appearance
		height = $props<string | number>('300px'),
		width = $props<string | number>('100%'),
		horizontal = $props<boolean>(false),
		colors = $props<string[]>([]),
		colorOpacity = $props<number>(0.8),
		borderWidth = $props<number>(1),

		// Style
		showBorder = $props<boolean>(true),
		showGrid = $props<boolean>(true),
		showLegend = $props<boolean>(true),
		roundedBars = $props<boolean>(true),
		barThickness = $props<number | undefined>(undefined),

		// Labels & formatting
		title = $props<string>(''),
		xLabel = $props<string>(''),
		yLabel = $props<string>(''),
		currency = $props<string | undefined>(undefined),
		numberFormat = $props<string | undefined>(undefined),

		// Interaction
		animationDuration = $props<number>(750),

		// Other options
		options = $props<Partial<ChartOptions<'bar'>>>({})
	} = $props();

	// Local state
	let chartContainer: HTMLCanvasElement;
	let chart: Chart<'bar'>;

	// Default color palette (tailwind blue shades)
	const defaultColors = [
		'#3B82F6', // blue-500
		'#60A5FA', // blue-400
		'#93C5FD', // blue-300
		'#2563EB', // blue-600
		'#1D4ED8', // blue-700
		'#BFDBFE', // blue-200
		'#1E40AF' // blue-800
	];

	// Generate chart options based on props
	function generateChartOptions(): ChartOptions<'bar'> {
		const isDarkMode = $theme === 'dark';
		const textColor = isDarkMode ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.8)';
		const gridColor = isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
		const borderColor = isDarkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)';

		return {
			responsive: true,
			maintainAspectRatio: false,
			animation: {
				duration: animationDuration
			},
			indexAxis: horizontal ? 'y' : 'x',
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
					display: showLegend && data.datasets.length > 1,
					position: 'top',
					labels: {
						color: textColor,
						usePointStyle: true,
						generateLabels: (chart) => {
							const original = Chart.defaults.plugins.legend.labels.generateLabels(chart);

							original.forEach((label) => {
								// Make the legend items more visible in dark mode
								if (isDarkMode) {
									label.fillStyle = label.strokeStyle;
									label.borderColor = 'rgba(255, 255, 255, 0.5)';
								}
							});

							return original;
						}
					}
				},
				tooltip: {
					enabled: true,
					backgroundColor: isDarkMode ? 'rgba(0, 0, 0, 0.8)' : 'rgba(255, 255, 255, 0.8)',
					titleColor: isDarkMode ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.9)',
					bodyColor: isDarkMode ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.9)',
					borderColor: borderColor,
					borderWidth: 1,
					padding: 10,
					cornerRadius: 6,
					boxPadding: 4,
					callbacks: {
						label: function (context) {
							let label = context.dataset.label || '';
							if (label) {
								label += ': ';
							}

							const value = context.parsed[horizontal ? 'x' : 'y'];

							if (currency) {
								label += formatCurrency(value, currency);
							} else if (numberFormat) {
								label += formatNumber(value);
							} else {
								label += value;
							}

							return label;
						}
					}
				}
			},
			scales: {
				x: {
					title: {
						display: !!xLabel,
						text: xLabel,
						color: textColor
					},
					ticks: {
						color: textColor
					},
					grid: {
						display: showGrid,
						color: gridColor,
						borderColor: showBorder ? borderColor : 'transparent',
						borderWidth: showBorder ? 1 : 0
					},
					border: {
						display: showBorder,
						color: borderColor
					}
				},
				y: {
					title: {
						display: !!yLabel,
						text: yLabel,
						color: textColor
					},
					ticks: {
						color: textColor,
						callback: function (value) {
							if (currency) {
								return formatCurrency(value as number, currency);
							} else if (numberFormat) {
								return formatNumber(value as number);
							}
							return value;
						}
					},
					grid: {
						display: showGrid,
						color: gridColor,
						borderColor: showBorder ? borderColor : 'transparent',
						borderWidth: showBorder ? 1 : 0
					},
					border: {
						display: showBorder,
						color: borderColor
					}
				}
			},
			...options
		};
	}

	// Initialize or update the chart
	function updateChart() {
		if (!browser || !chartContainer) return;

		const ctx = chartContainer.getContext('2d');
		if (!ctx) return;

		// Apply colors to datasets if not already set
		const coloredData = {
			...data,
			datasets: data.datasets.map((dataset, i) => {
				const color = colors[i % colors.length] || defaultColors[i % defaultColors.length];
				return {
					...dataset,
					backgroundColor:
						dataset.backgroundColor ||
						(Array.isArray(color)
							? color
							: `${color}${Math.floor(colorOpacity * 255)
									.toString(16)
									.padStart(2, '0')}`),
					borderColor: dataset.borderColor || (Array.isArray(color) ? color.map((c) => c) : color),
					borderWidth: dataset.borderWidth || borderWidth,
					borderRadius: roundedBars ? 4 : 0,
					barThickness: barThickness
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
				type: 'bar',
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
