const http = require('node:http');
const { createChecker } = require('./status');

const port = Number(process.env.PORT || 3001);
const gamePort = Number(process.env.PZ_GAME_PORT || 17809);
const getStatus = createChecker({
	host: process.env.PZ_HOST || '209.25.140.16',
	gamePort,
	queryPort: Number(process.env.PZ_QUERY_PORT || gamePort),
	queryTimeout: Number(process.env.PZ_QUERY_TIMEOUT || 5000),
});

function sendJson(response, statusCode, body) {
	response.writeHead(statusCode, {
		'Content-Type': 'application/json; charset=utf-8',
		'Cache-Control': 'no-store',
		'Access-Control-Allow-Origin': '*',
	});
	response.end(JSON.stringify(body));
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