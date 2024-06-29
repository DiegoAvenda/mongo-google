import { VAPID_PUBLIC_KEY } from '$env/static/private';
import { json } from '@sveltejs/kit';

export const GET = () => {
	return json({ data: VAPID_PUBLIC_KEY });
};
