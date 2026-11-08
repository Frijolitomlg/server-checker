import type { APIRoute } from 'astro';
import { clearAdminCookie, isSameOrigin, jsonResponse } from '../../../lib/admin-auth';

export const POST: APIRoute = async ({ request }) => {
	if (!isSameOrigin(request)) return jsonResponse({ error: 'Request origin could not be verified.' }, 403);
	return jsonResponse({}, 200, { 'Set-Cookie': clearAdminCookie(request.url) });
};
