import { redirect } from '@sveltejs/kit';

export async function load(event) {
	if (!event.locals.user) redirect(302, '/reject');
	const name = event.locals.user;
	return { name };
}
