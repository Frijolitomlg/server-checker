import type { APIRoute } from 'astro';
import { GET as getStatus } from './api/status';

export const GET: APIRoute = async (context) => {
	const response = await getStatus(context);
	return new Response(response.body, {
		status: response.status,
		statusText: response.statusText,
		headers: response.headers,
	});
};