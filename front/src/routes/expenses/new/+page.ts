// /routes/expenses/new/+page.ts
import type { PageLoad } from './$types';

export const load: PageLoad = async () => {
	return {
		title: 'Create Expense'
	};
};
