import type { APIRoute } from 'astro';
import { getAdminUsername, isAdminAuthConfigured, jsonResponse } from '../../../lib/admin-auth';

export const GET: APIRoute = async ({ request }) => {
	const username = getAdminUsername(request);
	return jsonResponse({
		authenticated: username !== null,
		username,
		configured: isAdminAuthConfigured(),
	});
};
