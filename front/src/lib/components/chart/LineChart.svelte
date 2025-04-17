<!--
  Line Chart Component

  A responsive and customizable line chart component using Chart.js.
  Features:
  - Multiple datasets with custom colors
  - Area fill option with customizable opacity
  - Curved or straight lines
  - Point customization (size, style)
  - Date-based x-axis with automatic formatting
  - Responsive design with optional aspect ratio
  - Dark mode support
-->
<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import Chart from 'chart.js/auto';
	import 'chartjs-adapter-date-fns'; // For date formatting
	import { theme } from '$lib/stores/ui';
	import { browser } from '$app/environment';
	import { formatCurrency, formatNumber, formatDate } from '$lib/utils/format';
	import type { ChartData, ChartDataset, ChartOptions } from 'chart.js';

	// Props with Svelte 5 runes
	const {
		// Data
		data = $props<ChartData<'line'>>({ labels: [], datasets: [] }),

		// Appearance
		height = $props<string | number>('300px'),
		width = $props<string | number>('100%'),
		colors = $props<string[]>([]),
		areaFill = $props<boolean>(true),
		fillOpacity = $props<number>(0.2),
		pointRadius = $props<number>(3),
		pointHoverRadius = $props<number>(5),
		lineWidth = $props<number>(2),
		curved = $props<boolean>(true),

		// Axis and scales
		xAxisType = $props<'category' | 'linear' | 'time'>('category'),
		timeUnit = $props<'day' | 'week' | 'month' | 'quarter' | 'year'>('day'),
		showGrid = $props<boolean>(true),
		showBorder = $props<boolean>(true),

		// Labels
		title = $props<string>(''),
		xLabel = $props<string>(''),
		yLabel = $props<string>(''),
		currency = $props<string | undefined>(undefined),

		// Interaction
		animationDuration = $props<number>(750),
		showLegend = $props<boolean>(true),
		legendPosition = $props<'top' | 'left' | 'bottom' | 'right'>('top'),

		// Other options
		options = $props<Partial<ChartOptions<'line'>>>({})
	} = $props();

	// Local state
	let chartContainer: HTMLCanvasElement;
	let chart: Chart<'line'>;

	// Default color palette (tailwind colors)
	const defaultColors = [
		'#3B82F6', // blue-500
		'#EF4444', // red-500
		'#10B981', // emerald-500
		'#F59E0B', // amber-500
		'#8B5CF6', // violet-500
		'#EC4899', // pink-500
		'#14B8A6' // teal-500
	];

	// Generate chart options based on props
	function generateChartOptions(): ChartOptions<'line'> {
		const isDarkMode = $theme === 'dark';
		const textColor = isDarkMode ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.8)';
		const gridColor = isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
		const borderColor = isDarkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)';

		const timeOptions: any = {};
		if (xAxisType === 'time') {
			timeOptions.x = {
				type: 'time',
				time: {
					unit: timeUnit,
					tooltipFormat: 'PP',
					displayFormats: {
						day: 'MMM d',
						week: 'MMM d',
						month: 'MMM yyyy',
						quarter: 'QQQ yyyy',
						year: 'yyyy'
					}
				}
			};
		}

		return {
			responsive: true,
			maintainAspectRatio: false,
			animation: {
				duration: animationDuration
			},
			interaction: {
				mode: 'index',
				intersect: false
			},
			elements: {
				line: {
					tension: curved ? 0.3 : 0,
					borderWidth: lineWidth
				},
				point: {
					radius: pointRadius,
					hoverRadius: pointHoverRadius,
					hoverBorderWidth: 2
				}
			},
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
					display: showLegend && data.datasets.length > 0,
					position: legendPosition,
					labels: {
						color: textColor,
						usePointStyle: true,
						boxWidth: 6,
						padding: 16
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

							const value = context.parsed.y;

							if (currency) {
								label += formatCurrency(value, currency);
							} else {
								label += formatNumber(value);
							}

							return label;
						}
					}
				}
			},
			scales: {
				...timeOptions,
				x: {
					title: {
						display: !!xLabel,
						text: xLabel,
						color: textColor,
						font: {
							weight: 'bold'
						}
					},
					ticks: {
						color: textColor,
						maxRotation: 45,
						minRotation: 0
					},
					grid: {
						display: showGrid,
						color: gridColor,
						tickLength: 8,
						tickWidth: 1
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
						color: textColor,
						font: {
							weight: 'bold'
						}
					},
					ticks: {
						color: textColor,
						callback: function (value) {
							if (currency) {
								return formatCurrency(value as number, currency);
							}
							return formatNumber(value as number);
						}
					},
					grid: {
						display: showGrid,
						color: gridColor
					},
					border: {
						display: showBorder,
						color: borderColor
					},
					beginAtZero: true
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
				const colorWithOpacity =
					typeof color === 'string'
						? `${color}${Math.floor(fillOpacity * 255)
								.toString(16)
								.padStart(2, '0')}`
						: color;

				return {
					...dataset,
					borderColor: dataset.borderColor || color,
					backgroundColor: dataset.backgroundColor || (areaFill ? colorWithOpacity : 'transparent'),
					pointBackgroundColor: dataset.pointBackgroundColor || color,
					pointBorderColor: dataset.pointBorderColor || (isDarkMode ? '#374151' : 'white'),
					pointHoverBackgroundColor:
						dataset.pointHoverBackgroundColor || (isDarkMode ? 'white' : '#374151'),
					pointHoverBorderColor: dataset.pointHoverBorderColor || color,
					fill: areaFill
				} as ChartDataset<'line'>;
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
				type: 'line',
				data: coloredData,
				options: options
			});
		}
	}

	// Derived value to check if dark mode is active
	const isDarkMode = $derived($theme === 'dark');

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
