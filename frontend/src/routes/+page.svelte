<script>
	import { onMount } from 'svelte';
	import { fade, fly, scale } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import Logo from '$lib/components/ui/Logo.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import { authStore } from '$lib/stores/authStore';
	import { goto } from '$app/navigation';

	let mounted = false;
	let animationComplete = false;
	let sideNavOpen = true; // Start with sidebar open for desktop, will be controlled with media queries

	// Navigation items
	const navigation = [
		{ name: 'Dashboard', href: '/dashboard', icon: 'chart-bar' },
		{ name: 'Expenses', href: '/expenses', icon: 'receipt-tax' },
		{ name: 'Categories', href: '/categories', icon: 'tag' },
		{ name: 'Budgets', href: '/budgets', icon: 'currency-dollar' },
		{ name: 'Reports', href: '/reports', icon: 'document-report' }
	];

	// Icons mapping
	const icons = {
		'chart-bar': `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
      <path stroke-linecap="round" stroke-linejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
    </svg>`,
		'receipt-tax': `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
      <path stroke-linecap="round" stroke-linejoin="round" d="M9 14.25l6-6m4.5-3.493V21.75l-3.75-1.5-3.75 1.5-3.75-1.5-3.75 1.5V4.757c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0c1.1.128 1.907 1.077 1.907 2.185ZM9.75 9h.008v.008H9.75V9Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm4.125 4.5h.008v.008h-.008V13.5Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
    </svg>`,
		tag: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
      <path stroke-linecap="round" stroke-linejoin="round" d="M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 0 0 5.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 0 0 9.568 3Z" />
      <path stroke-linecap="round" stroke-linejoin="round" d="M6 6h.008v.008H6V6Z" />
    </svg>`,
		'currency-dollar': `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
      <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>`,
		'document-report': `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
      <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m6.75 12H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
    </svg>`
	};

	function toggleSideNav() {
		sideNavOpen = !sideNavOpen;
	}

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

<div class="flex h-screen overflow-hidden bg-gradient-to-b from-gray-50 to-gray-100">
	<!-- Side Navigation -->
	<div
		class="fixed inset-y-0 left-0 z-40 w-64 transform bg-blue-700 shadow-lg transition-transform duration-300 ease-in-out md:relative md:translate-x-0 {sideNavOpen
			? 'translate-x-0'
			: '-translate-x-full'}"
	>
		<div class="flex h-full flex-col">
			<div class="flex items-center p-6">
				<div class="text-white">
					<Logo size="md" />
				</div>
				<button
					on:click={toggleSideNav}
					class="-mr-2 ml-auto rounded-md text-white hover:text-blue-100 focus:outline-none md:hidden"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="h-6 w-6"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M6 18L18 6M6 6l12 12"
						/>
					</svg>
				</button>
			</div>

			<nav class="mt-5 flex-1 space-y-1 px-4">
				{#each navigation as item}
					<a
						href={item.href}
						class="group flex items-center rounded-md px-2 py-2 text-sm font-medium text-blue-100 hover:bg-blue-600"
					>
						<span class="mr-3 h-6 w-6 flex-shrink-0" aria-hidden="true">
							{@html icons[item.icon]}
						</span>
						{item.name}
					</a>
				{/each}
			</nav>

			<div class="mt-auto p-4">
				<Button
					variant="outline"
					size="md"
					fullWidth={true}
					class="bg-white text-blue-700 hover:bg-gray-100"
					on:click={() => goto('/dashboard')}
				>
					Go to Dashboard
				</Button>
			</div>
		</div>
	</div>

	<!-- Mobile menu button (visible on smaller screens) -->
	<button
		on:click={toggleSideNav}
		class="fixed top-4 left-4 z-50 rounded-full bg-blue-600 p-2 text-white shadow-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:outline-none md:hidden {sideNavOpen
			? 'hidden'
			: 'block'}"
	>
		<svg
			xmlns="http://www.w3.org/2000/svg"
			class="h-6 w-6"
			fill="none"
			viewBox="0 0 24 24"
			stroke="currentColor"
		>
			<path
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M4 6h16M4 12h16M4 18h16"
			/>
		</svg>
	</button>

	<!-- Main Content -->
	<div class="flex flex-1 flex-col overflow-hidden">
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
</div>

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
