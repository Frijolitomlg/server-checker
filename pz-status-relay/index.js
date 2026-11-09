const http = require('node:http');
const dgram = require('node:dgram');
const { GameDig } = require('gamedig');

const port = Number(process.env.PORT || 3001);
const host = process.env.PZ_HOST || '209.25.140.16';
const gamePort = Number(process.env.PZ_GAME_PORT || 17809);
const queryPort = Number(process.env.PZ_QUERY_PORT || gamePort);
const queryTimeout = Number(process.env.PZ_QUERY_TIMEOUT || 5000);

function sendJson(response, statusCode, body) {
	response.writeHead(statusCode, {
		'Content-Type': 'application/json; charset=utf-8',
		'Cache-Control': 'no-store',
		'Access-Control-Allow-Origin': '*',
	});
	response.end(JSON.stringify(body));
}

// RakNet "unconnected ping" on the game port. Works through tunnels that only
// forward the game port, unlike the Steam query.
const RAKNET_MAGIC = Buffer.from('00ffff00fefefefefdfdfdfd12345678', 'hex');
function raknetPing() {
	return new Promise((resolve, reject) => {
		const socket = dgram.createSocket('udp4');
		const started = Date.now();
		let attempts = 0;
		const finish = (error) => {
			clearTimeout(timer);
			clearInterval(retry);
			socket.close();
			error ? reject(error) : resolve(Date.now() - started);
		};
		const timer = setTimeout(() => finish(new Error(`no RakNet reply within ${queryTimeout} ms`)), queryTimeout);
		socket.on('error', finish);
		socket.on('message', (message) => { if (message[0] === 0x1c) finish(null); });
		const packet = Buffer.alloc(33);
		packet[0] = 0x01;
		packet.writeBigInt64BE(BigInt(started), 1);
		RAKNET_MAGIC.copy(packet, 9);
		packet.writeBigInt64BE(BigInt(Math.floor(Math.random() * 2 ** 31)), 25);
		const send = () => { if (attempts++ < 3) socket.send(packet, gamePort, host); };
		send();
		const retry = setInterval(send, Math.max(500, Math.floor(queryTimeout / 3)));
	});
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
		try {
			const ms = await raknetPing();
			return {
				online: true,
				version: null,
				name: 'Project Zomboid',
				map: null,
				players: 0,
				maxPlayers: null,
				output: `Game port ${gamePort} answered a RakNet ping in ${ms} ms (player details unavailable)`,
			};
		} catch (pingError) {
			error = pingError;
		}
		return {
			online: false,
			version: null,
			name: 'Project Zomboid',
			map: null,
			players: 0,
			maxPlayers: null,
			output: `No reply from ${host}:${gamePort}: ${error instanceof Error ? error.message : 'Unknown error'}`,
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