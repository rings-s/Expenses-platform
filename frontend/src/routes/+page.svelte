<script>
	import { onMount } from 'svelte';
	import { fade, fly, scale } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import AppLayout from '$lib/components/layout/AppLayout.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import { authStore } from '$lib/stores/authStore';
	import { goto } from '$app/navigation';

	let mounted = false;
	let animationComplete = false;

	function navigateToApp() {
		if ($authStore.isAuthenticated) {
			goto('/dashboard');
		} else {
			goto('/login');
		}
	}

	onMount(() => {
		mounted = true;
		setTimeout(() => {
			animationComplete = true;
		}, 1000);
	});
</script>

<svelte:head>
	<title>Expensis - Take Control of Your Finances</title>
	<meta
		name="description"
		content="Track expenses, manage budgets, and gain financial clarity with Expensis - the modern way to manage your money."
	/>
</svelte:head>

<AppLayout title="">
	<div class="flex min-h-[calc(100vh-50px)]">
		<!-- Main Hero Content -->
		<div class="relative z-10 flex flex-1 items-center px-4 py-8 sm:px-6 lg:px-8">
			<!-- 3D Floating shapes decoration -->
			<div class="pointer-events-none absolute inset-0 z-0 overflow-hidden">
				{#if mounted}
					<div
						in:fade={{ duration: 1000, delay: 200 }}
						class="animate-float absolute top-20 right-[10%] h-32 w-32 rounded-full bg-gradient-to-tr from-blue-200 to-blue-300 opacity-60 blur-xl"
					></div>
					<div
						in:fade={{ duration: 1000, delay: 400 }}
						class="animate-float-delayed absolute top-40 left-[25%] h-40 w-40 rounded-full bg-gradient-to-br from-purple-200 to-purple-300 opacity-50 blur-xl"
					></div>
					<div
						in:fade={{ duration: 1000, delay: 600 }}
						class="animate-float-slow absolute right-[15%] bottom-20 h-28 w-28 rounded-full bg-gradient-to-r from-green-200 to-green-300 opacity-50 blur-xl"
					></div>
				{/if}
				<!-- 3D mesh grid for depth -->
				<div
					class="absolute inset-0 bg-[radial-gradient(#000000_1px,transparent_1px)] [background-size:16px_16px] opacity-[0.02]"
				></div>
			</div>

			<div class="relative z-10 mx-auto w-full max-w-5xl">
				<div class="flex flex-col md:flex-row md:items-center md:justify-between">
					<!-- Text Content -->
					<div class="md:w-1/2 md:pr-8">
						{#if mounted}
							<h1
								in:fly={{ y: 50, duration: 800, delay: 300 }}
								class="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl md:text-6xl"
							>
								<span class="block">Track Your</span>
								<span class="block text-blue-600">Expenses</span>
								<span class="block text-blue-600">Effortlessly</span>
							</h1>
							<p in:fly={{ y: 30, duration: 800, delay: 500 }} class="mt-5 text-xl text-gray-500">
								Take control of your finances with powerful tracking, budgeting, and analytics.
							</p>
							<div
								in:fly={{ y: 20, duration: 800, delay: 700 }}
								class="mt-8 flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4"
							>
								<Button variant="primary" size="lg" on:click={navigateToApp}
									>Get Started Free</Button
								>
								<Button variant="outline" size="lg">Learn More</Button>
							</div>
						{/if}
					</div>

					<!-- Illustration -->
					{#if mounted}
						<div in:fade={{ duration: 1000, delay: 600 }} class="mt-12 md:mt-0 md:w-1/2">
							<div class="relative">
								<!-- Credit card and coins illustration -->
								<svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg" class="h-auto w-full">
									<!-- Blue credit card -->
									<rect
										x="70"
										y="80"
										width="220"
										height="140"
										rx="10"
										fill="#1E40AF"
										class="animate-float-slow"
									/>
									<rect x="90" y="110" width="180" height="20" rx="4" fill="#BFDBFE" />
									<rect x="90" y="150" width="60" height="10" rx="2" fill="#BFDBFE" />
									<rect x="90" y="170" width="40" height="10" rx="2" fill="#BFDBFE" />
									<rect x="160" y="170" width="60" height="10" rx="2" fill="#BFDBFE" />

									<!-- Bar chart -->
									<rect
										x="220"
										y="190"
										width="20"
										height="50"
										rx="3"
										fill="#3B82F6"
										class="chart-bar-1"
									/>
									<rect
										x="250"
										y="170"
										width="20"
										height="70"
										rx="3"
										fill="#8B5CF6"
										class="chart-bar-2"
									/>
									<rect
										x="280"
										y="150"
										width="20"
										height="90"
										rx="3"
										fill="#EC4899"
										class="chart-bar-3"
									/>

									<!-- Dollar signs -->
									<g class="dollar-1">
										<circle cx="60" cy="50" r="25" fill="#FBBF24" />
										<text
											x="60"
											y="58"
											font-family="Arial"
											font-size="24"
											font-weight="bold"
											text-anchor="middle"
											fill="white">$</text
										>
									</g>

									<g class="dollar-2">
										<circle cx="320" cy="60" r="20" fill="#FBBF24" />
										<text
											x="320"
											y="67"
											font-family="Arial"
											font-size="20"
											font-weight="bold"
											text-anchor="middle"
											fill="white">$</text
										>
									</g>

									<g class="dollar-3">
										<circle cx="350" cy="120" r="15" fill="#FBBF24" />
										<text
											x="350"
											y="125"
											font-family="Arial"
											font-size="16"
											font-weight="bold"
											text-anchor="middle"
											fill="white">$</text
										>
									</g>

									<g class="dollar-4">
										<circle cx="330" cy="200" r="18" fill="#FBBF24" />
										<text
											x="330"
											y="206"
											font-family="Arial"
											font-size="18"
											font-weight="bold"
											text-anchor="middle"
											fill="white">$</text
										>
									</g>

									<g class="dollar-5">
										<circle cx="100" cy="230" r="16" fill="#FBBF24" />
										<text
											x="100"
											y="236"
											font-family="Arial"
											font-size="16"
											font-weight="bold"
											text-anchor="middle"
											fill="white">$</text
										>
									</g>

									<!-- Line chart path -->
									<path
										d="M90 120 L130 100 L170 110 L210 90 L250 70"
										stroke="#10B981"
										stroke-width="3"
										fill="none"
										class="chart-line"
									/>
								</svg>
							</div>
						</div>
					{/if}
				</div>
			</div>
		</div>
	</div>
</AppLayout>

<style>
	/* Custom animations */
	@keyframes float {
		0% {
			transform: translateY(0px);
		}
		50% {
			transform: translateY(-20px);
		}
		100% {
			transform: translateY(0px);
		}
	}

	@keyframes floatDelayed {
		0% {
			transform: translateY(0px);
		}
		50% {
			transform: translateY(-15px);
		}
		100% {
			transform: translateY(0px);
		}
	}

	@keyframes floatSlow {
		0% {
			transform: translateY(0px);
		}
		50% {
			transform: translateY(-10px);
		}
		100% {
			transform: translateY(0px);
		}
	}

	@keyframes bounce {
		0%,
		100% {
			transform: translateY(0);
		}
		50% {
			transform: translateY(-10px);
		}
	}

	@keyframes growUp {
		from {
			transform: scaleY(0);
			transform-origin: bottom;
		}
		to {
			transform: scaleY(1);
			transform-origin: bottom;
		}
	}

	@keyframes drawLine {
		from {
			stroke-dashoffset: 300;
		}
		to {
			stroke-dashoffset: 0;
		}
	}

	.animate-float {
		animation: float 6s ease-in-out infinite;
	}

	.animate-float-delayed {
		animation: floatDelayed 8s ease-in-out infinite;
	}

	.animate-float-slow {
		animation: floatSlow 10s ease-in-out infinite;
	}

	/* SVG animations */
	.dollar-1,
	.dollar-2,
	.dollar-3,
	.dollar-4,
	.dollar-5 {
		animation: bounce 3s ease-in-out infinite;
	}

	.dollar-2 {
		animation-delay: 0.5s;
	}

	.dollar-3 {
		animation-delay: 1s;
	}

	.dollar-4 {
		animation-delay: 1.5s;
	}

	.dollar-5 {
		animation-delay: 2s;
	}

	.chart-bar-1 {
		animation: growUp 1s ease-out forwards;
	}

	.chart-bar-2 {
		animation: growUp 1s ease-out 0.3s forwards;
	}

	.chart-bar-3 {
		animation: growUp 1s ease-out 0.6s forwards;
	}

	.chart-line {
		stroke-dasharray: 300;
		stroke-dashoffset: 300;
		animation: drawLine 2s ease-out forwards 1s;
	}
</style>
