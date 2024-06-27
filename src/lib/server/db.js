import { MONGODB } from '$env/static/private';
import { MongoClient } from 'mongodb';

export const connectDb = async () => {
	const uri = MONGODB;
	const client = new MongoClient(uri);
	await client.connect();
	const db = client.db('novastra');
	return db;
};
