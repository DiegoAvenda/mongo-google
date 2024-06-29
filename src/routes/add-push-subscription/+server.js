import { error, json } from '@sveltejs/kit';
import { connectDb } from '$lib/server/db';

export const POST = async ({ locals, request }) => {
	const user = locals?.userId;

	if (!user) {
		console.log('No name passed to addSubscription');
		throw error(401, 'Unauthorized');
	}

	const data = await request.json();

	if (!data.subscription) {
		console.log('No subscription passed to addSubscription', data);
		throw error(400, 'Bad request');
	}
	const db = await connectDb();
	await db
		.collection('user')
		.updateOne({ googleId: user }, { $set: { pushSubscription: data.subscription } });
	return json({ succes: true });
};
