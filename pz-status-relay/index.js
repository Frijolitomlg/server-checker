const http = require('node:http');
const { GameDig } = require('gamedig');

const port = Number(process.env.PORT || 3001);
const host = process.env.PZ_HOST || '209.25.140.16';
const queryPort = Number(process.env.PZ_QUERY_PORT || 17809);
const queryTimeout = Number(process.env.PZ_QUERY_TIMEOUT || 5000);

function sendJson(response, statusCode, body) {
	response.writeHead(statusCode, {
		'Content-Type': 'application/json; charset=utf-8',
		'Cache-Control': 'no-store',
		'Access-Control-Allow-Origin': '*',
	});
	response.end(JSON.stringify(body));
}

async function getStatus() {
	try {
		const server = await GameDig.query({
			type: 'projectzomboid',
			host,
			port: queryPort,
			socketTimeout: queryTimeout,
		});
		const versionTag = server.raw?.tags?.find((tag) => /(?:^|;)VERSION:/i.test(tag));
		const version = versionTag?.match(/(?:^|;)VERSION:([^;]+)/i)?.[1] || null;

		return {
			online: true,
			version,
			name: server.name || 'Project Zomboid',
			map: server.map || null,
			players: server.players?.length ?? 0,
			maxPlayers: server.maxplayers ?? null,
			output: `Gamedig query succeeded on query port ${queryPort}`,
		};
	} catch (error) {
		return {
			online: false,
			version: null,
			name: 'Project Zomboid',
			map: null,
			players: 0,
			maxPlayers: null,
			output: `Gamedig query failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
		};
	}
}

const server = http.createServer(async (request, response) => {
	if (request.method !== 'GET' || request.url !== '/status') {
		sendJson(response, 404, { error: 'Not found' });
		return;
	}

	sendJson(response, 200, await getStatus());
});

server.listen(port, () => {
	console.log(`Project Zomboid status relay listening on http://localhost:${port}/status`);
});

server.on('error', (error) => {
	console.error('Status relay server error:', error);
});