<script>
	export let size = 'md'; // sm, md, lg

	const sizes = {
		sm: 'h-8 w-8',
		md: 'h-10 w-10',
		lg: 'h-12 w-12'
	};

	const textSizes = {
		sm: 'text-lg',
		md: 'text-xl',
		lg: 'text-2xl'
	};
</script>

<div class="flex items-center space-x-2">
	<div class={`${sizes[size]} bg-blue-600 rounded-full flex items-center justify-center`}>
		<svg
			xmlns="http://www.w3.org/2000/svg"
			fill="none"
			viewBox="0 0 24 24"
			stroke-width="1.5"
			stroke="white"
			class="w-2/3 h-2/3"
		>
			<path
				stroke-linecap="round"
				stroke-linejoin="round"
				d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z"
			/>
		</svg>
	</div>
	<span class={`${textSizes[size]} font-bold text-gray-900`}>Expensis</span>
</div>
