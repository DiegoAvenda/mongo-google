import { connectDb } from '$lib/server/db.js';

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
