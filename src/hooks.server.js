import { connectDb } from '$lib/server/db.js';

export async function handle({ event, resolve }) {
	//get cookies from browser
	const session = event.cookies.get('session');
	//console.log('session cookie hooks: ', session);
	if (!session) {
		//if there ir no session load page as normal
		event.locals.user = null;
		return await resolve(event);
	}

	//find the user based on the session
	const db = await connectDb();
	const query = { userAuthToken: session };
	const projection = { projection: { _id: 0 } };
	const user = await db.collection('user').findOne(query, projection);

	//if user exists set event.locals
	if (user) {
		//console.log('user: ', user);
		event.locals.user = user.name;
	}
	//load page as normal
	return await resolve(event);
}
