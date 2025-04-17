// /routes/expenses/+page.ts
import type { PageLoad } from './$types';

export const load: PageLoad = async () => {
	// Initial data will be loaded in the component
	return {
		title: 'Expenses'
	};
};
