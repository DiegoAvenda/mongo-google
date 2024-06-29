import { connectDb } from '$lib/server/db.js';
import webpush from 'web-push';
import { error } from '@sveltejs/kit';
import { VAPID_PUBLIC_KEY, VAPID_SECRET_KEY } from '$env/static/private';

function initWebPush() {
	webpush.setVapidDetails('mailto:digago7@gmail.com', VAPID_PUBLIC_KEY, VAPID_SECRET_KEY);
}

export async function load() {
	try {
		const db = await connectDb();
		const query = { info: 'sipi' };
		const projection = { projection: { _id: 0 } };
		const lectura = await db.collection('readings').findOne(query, projection);
		return { lectura };
	} catch (error) {
		console.log('Error Connecting to DB or retrieving data: ', error);
	}
}

export const actions = {
	testNotification: async ({ locals }) => {
		const userId = locals.userId;
		const db = await connectDb();
		if (!userId) {
			throw error(400, 'Not logged in');
		}
		try {
			const usuario = await db
				.collection('user')
				.findOne({ googleId: userId }, { projection: { _id: 0 } });
			initWebPush();
			await webpush.sendNotification(usuario.pushSubscription, 'Si que yes!');
		} catch (err) {
			const msg = `Could not send notification: ${err}`;
			console.error(msg);
		}
	}
};
