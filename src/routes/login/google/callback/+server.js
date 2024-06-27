import { connectDb } from '$lib/server/db.js';
import { oauth2Client } from '$lib/server/utils.js';

async function getUserData(access_token) {
	const response = await fetch(
		`https://www.googleapis.com/oauth2/v3/userinfo?access_token=${access_token}`
	);
	const data = await response.json();
	return data;
}

export async function GET(event) {
	const code = event.url.searchParams.get('code');
	const state = event.url.searchParams.get('state');
	const storedState = event.cookies.get('google_oauth_state') ?? null;
	if (!code || !state) {
		return new Response(null, {
			status: 400
		});
	} else if (state !== storedState) {
		//check state value
		console.log('State mismatch. Possible CSRF attack');
		return new Response(null, {
			status: 400
		});
	} else {
		try {
			//get the id access token with the code
			let { tokens } = await oauth2Client.getToken(code);
			oauth2Client.setCredentials(tokens);
			const user = oauth2Client.credentials;
			const googleUser = await getUserData(user.access_token);

			/** Save credential to the global variable in case access token was refreshed.
			 * ACTION ITEM: In a production app, you likely want to save the refresh token
			 *              in a secure persistent database instead. */

			//connect with database
			const db = await connectDb();
			//check if existing user
			const query = { googleId: googleUser.sub };
			const projection = { projection: { _id: 0 } };
			const existingUser = await db.collection('user').findOne(query, projection);

			if (existingUser) {
				event.cookies.set('session', existingUser.userAuthToken, {
					//send cookie for every page
					path: '/',
					//server side only cookie so you can't use document.cookie
					httpOnly: true,
					//only requests from same site can send cookies
					sameSite: 'lax',
					//only sent over HTTPS in prodoction
					secure: import.meta.env.PROD,
					//set a cookie to expire after 7 days
					maxAge: 60 * 60 * 24 * 7
				});
				//console.log('callback cookie: ', event.cookies.get('session'));
			} else {
				const userAuthToken = crypto.randomUUID();
				const doc = {
					userAuthToken,
					googleId: googleUser.sub,
					name: googleUser.name
				};
				await db.collection('user').insertOne(doc);

				event.cookies.set('session', userAuthToken, {
					//send cookie for every page
					path: '/',
					//server side only cookie so you can't use document.cookie
					httpOnly: true,
					//only requests form same sithe can send cookies
					sameSite: 'lax',
					//only sent over HTTPS in prodoction
					secure: import.meta.env.PROD,
					//set a cookie to expire after 7 days
					maxAge: 60 * 60 * 24 * 7
				});
			}
			return new Response(null, {
				status: 302,
				headers: {
					Location: '/account'
				}
			});
		} catch (error) {
			console.log(error);
		}
	}
}
