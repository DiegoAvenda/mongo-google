// place files you want to import through the `$lib` alias in this folder.
import axios from 'axios';
import { google } from 'googleapis';
import { GOOGLE_CLIENT_ID, GOOGLE_REDIRECT_URL, GOOGLE_CLIENT_SECRET } from '$env/static/private';

export const oauth2Client = new google.auth.OAuth2(
	GOOGLE_CLIENT_ID,
	GOOGLE_CLIENT_SECRET,
	GOOGLE_REDIRECT_URL
);

export async function getGoogleUser({ id_token, access_token }) {
	try {
		const res = await axios.get(
			`https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${access_token}`,
			{
				headers: {
					Authorization: `Bearer ${id_token}`
				}
			}
		);
		return res.data;
	} catch (error) {
		console.log(error, 'Error fetching Google user');
		throw new Error(error.message);
	}
}
