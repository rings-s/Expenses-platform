// /routes/expenses/[id]/+page.ts
import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params }) => {
	const { id } = params;

	if (!id) {
		throw error(404, 'Expense ID is required');
	}

	return {
		expenseId: id
	};
};
