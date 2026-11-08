import type { APIRoute } from 'astro';
import { getAdminUsername, isSameOrigin, jsonResponse } from '../../../lib/admin-auth';
import {
	getServers,
	isServerStorageConfigured,
	saveServers,
	ServerStorageError,
	validateServerConfigs,
	type ServerConfig,
} from '../../../lib/servers';

export const GET: APIRoute = async ({ request }) => {
	if (!getAdminUsername(request)) return jsonResponse({ error: 'Sign in to manage servers.' }, 401);
	try {
		return jsonResponse({ servers: await getServers(), storageConfigured: isServerStorageConfigured() });
	} catch (error) {
		console.error('Unable to load server settings:', error);
		return jsonResponse({ error: 'Server settings could not be loaded. Check the KV connection.' }, 503);
	}
};

export const PUT: APIRoute = async ({ request }) => {
	if (!isSameOrigin(request)) return jsonResponse({ error: 'Request origin could not be verified.' }, 403);
	if (!getAdminUsername(request)) return jsonResponse({ error: 'Sign in to manage servers.' }, 401);

	let body: unknown;
	try {
		body = await request.json();
	} catch {
		return jsonResponse({ error: 'Send valid server settings.' }, 400);
	}

	let validatedServers: ServerConfig[];
	try {
		validatedServers = validateServerConfigs(body);
	} catch (error) {
		return jsonResponse({ error: error instanceof Error ? error.message : 'Server settings are invalid.' }, 400);
	}

	try {
		return jsonResponse({ servers: await saveServers(validatedServers) });
	} catch (error) {
		if (error instanceof ServerStorageError && /Server storage is not configured/.test(error.message)) {
			return jsonResponse({
				error: 'Server storage is not configured. Add BORK_KV_REST_API_URL and BORK_KV_REST_API_TOKEN to the deployment environment.',
			}, 503);
		}
		console.error('Unable to save server settings:', error);
		return jsonResponse({ error: 'Server settings could not be saved. Check the KV connection.' }, 503);
	}
};
