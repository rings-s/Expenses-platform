/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	theme: {
		extend: {
			colors: {
				primary: {
					DEFAULT: '#3B82F6', // Blue-500
					dark: '#2563EB', // Blue-600
					light: '#60A5FA' // Blue-400
				},
				secondary: {
					DEFAULT: '#6B7280', // Gray-500
					dark: '#4B5563', // Gray-600
					light: '#9CA3AF' // Gray-400
				}
			},
			fontFamily: {
				sans: ['Inter var', 'system-ui', 'sans-serif']
			},
			spacing: {
				'72': '18rem',
				'80': '20rem',
				'96': '24rem'
			}
		}
	},
	plugins: []
};
