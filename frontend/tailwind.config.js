/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	theme: {
		extend: {
			colors: {
				primary: {
					50: '#FEF2F2',
					100: '#FEE2E2',
					200: '#FECACA',
					300: '#FCA5A5',
					400: '#F87171',
					500: '#EF4444',
					600: '#DC2626',
					700: '#B91C1C',
					800: '#991B1B',
					900: '#7F1D1D'
				}
			},
			fontFamily: {
				sans: ['Inter', 'system-ui', 'sans-serif']
			},
			spacing: {
				72: '18rem',
				84: '21rem',
				96: '24rem'
			},
			boxShadow: {
				card: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)'
			}
		}
	},
	plugins: [require('@tailwindcss/forms')]
};
