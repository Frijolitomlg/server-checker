import type { APIRoute } from 'astro';
import {
	authenticateAdmin,
	createAdminCookie,
	isAdminAuthConfigured,
	isSameOrigin,
	jsonResponse,
} from '../../../lib/admin-auth';

const loginMessages = [
	'That passphrase did not open the portal. Give it another try.',
	'Nope, those details do not match. The dashboard is still locked.',
	'The admin door remains closed. Check your username and password.',
	'The key did not fit this time. Double-check those details.',
	'This login attempt missed the mark. Try again when you are ready.',
];

export const POST: APIRoute = async ({ request }) => {
	if (!isSameOrigin(request)) return jsonResponse({ error: 'Request origin could not be verified.' }, 403);
	if (!isAdminAuthConfigured()) {
		return jsonResponse({ error: 'Admin access is not configured on the server.' }, 503);
	}

	let body: unknown;
	try {
		body = await request.json();
	} catch {
		return jsonResponse({ error: 'Send a valid login form.' }, 400);
	}

	if (!body || typeof body !== 'object') return jsonResponse({ error: 'Send a valid login form.' }, 400);
	const { username, password } = body as Record<string, unknown>;
	if (typeof username !== 'string' || typeof password !== 'string' ||
		username.length > 100 || password.length > 256) {
		return jsonResponse({ error: 'Enter a username and password.' }, 400);
	}

	if (!authenticateAdmin(username, password)) {
		const message = loginMessages[Math.floor(Math.random() * loginMessages.length)];
		return jsonResponse({ error: message }, 401);
	}

	const normalizedUsername = username.trim().toLowerCase();
	return jsonResponse(
		{ username: normalizedUsername },
		200,
		{ 'Set-Cookie': createAdminCookie(normalizedUsername, request.url) },
	);
};
