<script lang="ts">
	import { onMount } from 'svelte';
	import { fade } from 'svelte/transition';

	let currentYear = $state(new Date().getFullYear());
	let isVisible = $state(false);

	onMount(() => {
		// Delay footer appearance for smooth loading
		setTimeout(() => {
			isVisible = true;
		}, 100);
	});
</script>

{#if isVisible}
	<footer
		class="mt-12 border-t border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900"
		in:fade={{ duration: 500 }}
	>
		<div class="container mx-auto px-4 py-8 md:py-12">
			<div class="grid grid-cols-1 gap-8 md:grid-cols-4 lg:grid-cols-5">
				<!-- Logo and About -->
				<div class="col-span-1 md:col-span-1 lg:col-span-2">
					<div class="mb-4 flex items-center space-x-2">
						<span class="text-primary dark:text-primary-400 text-xl font-bold">Expensis</span>
					</div>
					<p class="mb-4 text-gray-600 dark:text-gray-400">
						Simplify your expense tracking and management with our intuitive platform. Perfect for
						individuals and teams to keep finances organized.
					</p>
					<div class="flex space-x-4">
						<a
							href="#"
							class="hover:text-primary dark:hover:text-primary-400 text-gray-500 transition-colors duration-200 dark:text-gray-400"
						>
							<span class="sr-only">Twitter</span>
							<svg class="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
								<path
									d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"
								/>
							</svg>
						</a>
						<a
							href="#"
							class="hover:text-primary dark:hover:text-primary-400 text-gray-500 transition-colors duration-200 dark:text-gray-400"
						>
							<span class="sr-only">LinkedIn</span>
							<svg class="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
								<path
									fill-rule="evenodd"
									d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"
									clip-rule="evenodd"
								/>
							</svg>
						</a>
						<a
							href="#"
							class="hover:text-primary dark:hover:text-primary-400 text-gray-500 transition-colors duration-200 dark:text-gray-400"
						>
							<span class="sr-only">GitHub</span>
							<svg class="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
								<path
									fill-rule="evenodd"
									d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
									clip-rule="evenodd"
								/>
							</svg>
						</a>
					</div>
				</div>

				<!-- Links Column 1 -->
				<div>
					<h3 class="text-sm font-semibold tracking-wider text-gray-900 uppercase dark:text-white">
						Product
					</h3>
					<ul class="mt-4 space-y-3">
						<li>
							<a
								href="/features"
								class="hover:text-primary dark:hover:text-primary-400 text-base text-gray-600 transition-colors duration-200 dark:text-gray-400"
								>Features</a
							>
						</li>
						<li>
							<a
								href="/pricing"
								class="hover:text-primary dark:hover:text-primary-400 text-base text-gray-600 transition-colors duration-200 dark:text-gray-400"
								>Pricing</a
							>
						</li>
						<li>
							<a
								href="/resources"
								class="hover:text-primary dark:hover:text-primary-400 text-base text-gray-600 transition-colors duration-200 dark:text-gray-400"
								>Resources</a
							>
						</li>
						<li>
							<a
								href="/faq"
								class="hover:text-primary dark:hover:text-primary-400 text-base text-gray-600 transition-colors duration-200 dark:text-gray-400"
								>FAQ</a
							>
						</li>
					</ul>
				</div>

				<!-- Links Column 2 -->
				<div>
					<h3 class="text-sm font-semibold tracking-wider text-gray-900 uppercase dark:text-white">
						Company
					</h3>
					<ul class="mt-4 space-y-3">
						<li>
							<a
								href="/about"
								class="hover:text-primary dark:hover:text-primary-400 text-base text-gray-600 transition-colors duration-200 dark:text-gray-400"
								>About</a
							>
						</li>
						<li>
							<a
								href="/blog"
								class="hover:text-primary dark:hover:text-primary-400 text-base text-gray-600 transition-colors duration-200 dark:text-gray-400"
								>Blog</a
							>
						</li>
						<li>
							<a
								href="/careers"
								class="hover:text-primary dark:hover:text-primary-400 text-base text-gray-600 transition-colors duration-200 dark:text-gray-400"
								>Careers</a
							>
						</li>
						<li>
							<a
								href="/contact"
								class="hover:text-primary dark:hover:text-primary-400 text-base text-gray-600 transition-colors duration-200 dark:text-gray-400"
								>Contact</a
							>
						</li>
					</ul>
				</div>

				<!-- Links Column 3 -->
				<div>
					<h3 class="text-sm font-semibold tracking-wider text-gray-900 uppercase dark:text-white">
						Legal
					</h3>
					<ul class="mt-4 space-y-3">
						<li>
							<a
								href="/privacy"
								class="hover:text-primary dark:hover:text-primary-400 text-base text-gray-600 transition-colors duration-200 dark:text-gray-400"
								>Privacy Policy</a
							>
						</li>
						<li>
							<a
								href="/terms"
								class="hover:text-primary dark:hover:text-primary-400 text-base text-gray-600 transition-colors duration-200 dark:text-gray-400"
								>Terms of Service</a
							>
						</li>
						<li>
							<a
								href="/cookies"
								class="hover:text-primary dark:hover:text-primary-400 text-base text-gray-600 transition-colors duration-200 dark:text-gray-400"
								>Cookie Policy</a
							>
						</li>
						<li>
							<a
								href="/security"
								class="hover:text-primary dark:hover:text-primary-400 text-base text-gray-600 transition-colors duration-200 dark:text-gray-400"
								>Security</a
							>
						</li>
					</ul>
				</div>
			</div>

			<!-- Bottom Section -->
			<div class="mt-12 border-t border-gray-200 pt-8 dark:border-gray-800">
				<p class="text-center text-sm text-gray-500 dark:text-gray-400">
					© {currentYear} Expensis. All rights reserved.
				</p>
			</div>
		</div>
	</footer>
{/if}

<style>
	/* Add subtle hover animation */
	a:hover {
		transform: translateY(-1px);
	}
</style>
