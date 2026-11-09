import { createHash, timingSafeEqual } from 'node:crypto';
import type { APIRoute } from 'astro';
import { parseHeartbeat, saveHeartbeat } from '../../lib/pzHeartbeat';

function json(body: unknown, status = 200) {
	return new Response(JSON.stringify(body), {
		status,
		headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
	});
}

function secretMatches(provided: string, expected: string) {
	// Hash both sides so the comparison is constant-time regardless of length.
	const a = createHash('sha256').update(provided).digest();
	const b = createHash('sha256').update(expected).digest();
	return timingSafeEqual(a, b);
}

export const POST: APIRoute = async ({ request }) => {
	const expected = import.meta.env.PZ_HEARTBEAT_SECRET?.trim();
	if (!expected) return json({ error: 'PZ_HEARTBEAT_SECRET is not configured.' }, 503);

	const provided = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '') ?? '';
	if (!secretMatches(provided, expected)) return json({ error: 'Unauthorized' }, 401);

	let body: unknown;
	try {
		body = await request.json();
	} catch {
		return json({ error: 'Body must be JSON.' }, 400);
	}

	const heartbeat = parseHeartbeat(body);
	if (!heartbeat) return json({ error: 'Body must include "online": true or false.' }, 400);

	try {
		await saveHeartbeat(heartbeat);
	} catch (error) {
		return json({ error: error instanceof Error ? error.message : 'Could not save heartbeat.' }, 500);
	}
	return json({ ok: true });
};
