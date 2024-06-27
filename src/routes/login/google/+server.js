import { redirect } from '@sveltejs/kit';
import { oauth2Client } from '$lib/server/utils.js';

//generate a url that ask permissions for the user's profile and email
const scopes = [
	'https://www.googleapis.com/auth/userinfo.profile',
	'https://www.googleapis.com/auth/userinfo.email'
];

//Generate a secure random state value.
const state = crypto.randomUUID();

//Generate a url that asks permissions for the Drive activity scope
const authorizationUrl = oauth2Client.generateAuthUrl({
	// 'online' (default) or 'offline' (gets refresh_token)
	access_type: 'offline',

	/** Pass in the scopes array defined above.
	 * Alternatively, if only one scope is needed, you can pass a scope URL as a string */
	scope: scopes.join(' '),
	// Enable incremental authorization. Recommended as a best practice.
	include_granted_scopes: true,
	// Include the state parameter to reduce the risk of CSRF attacks.
	state,
	prompt: 'consent'
});

export async function GET(event) {
	event.cookies.set('google_oauth_state', state, {
		path: '/',
		secure: import.meta.env.PROD,
		httpOnly: true,
		maxAge: 60 * 10,
		sameSite: 'lax'
	});
	//console.log('authorization url google_oauth_state cookie: ',event.cookies.get('google_oauth_state'));
	redirect(302, authorizationUrl);
}
