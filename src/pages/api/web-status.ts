import type { APIRoute } from 'astro';

const targetUrl = 'http://berds-komga-comics.playit.plus:13163/';

export const GET: APIRoute = async () => {
	try {
		const response = await fetch(targetUrl, {
			signal: AbortSignal.timeout(5000),
		});

		return Response.json({
			online: response.ok,
			statusCode: response.status,
		});
	} catch {
		return Response.json({ online: false, statusCode: 0 });
	}
};