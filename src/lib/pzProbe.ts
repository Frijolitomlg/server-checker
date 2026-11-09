import dgram from 'node:dgram';
import { GameDig } from 'gamedig';

// Project Zomboid game traffic runs on RakNet over UDP. A RakNet "unconnected ping"
// is answered on the game port itself, so it works through tunnels (e.g. playit.gg)
// that only forward the game port. The Steam (A2S) query gives richer details but
// uses a separate port that tunnels usually do not forward, so it is optional.

const RAKNET_MAGIC = Buffer.from('00ffff00fefefefefdfdfdfd12345678', 'hex');
const ID_UNCONNECTED_PING = 0x01;
const ID_UNCONNECTED_PONG = 0x1c;

export type PzProbeResult = {
	online: boolean;
	statusCode: number;
	output: string;
	version: string | null;
	players?: number;
	maxPlayers?: number | null;
	map?: string | null;
};

export function raknetPing(host: string, port: number, timeoutMs: number): Promise<number> {
	return new Promise((resolve, reject) => {
		const socket = dgram.createSocket('udp4');
		const started = Date.now();
		let attempts = 0;
		let retry: ReturnType<typeof setInterval> | undefined;

		const finish = (error: Error | null) => {
			clearTimeout(timer);
			clearInterval(retry);
			socket.close();
			if (error) reject(error);
			else resolve(Date.now() - started);
		};

		const timer = setTimeout(() => finish(new Error(`no RakNet reply within ${timeoutMs} ms`)), timeoutMs);

		socket.on('error', (error) => finish(error));
		socket.on('message', (message) => {
			if (message[0] === ID_UNCONNECTED_PONG) finish(null);
		});

		const packet = Buffer.alloc(1 + 8 + 16 + 8);
		packet[0] = ID_UNCONNECTED_PING;
		packet.writeBigInt64BE(BigInt(started), 1);
		RAKNET_MAGIC.copy(packet, 9);
		packet.writeBigInt64BE(BigInt(Math.floor(Math.random() * 2 ** 31)), 25);

		// UDP can drop packets, so resend a few times within the timeout window.
		const send = () => {
			if (attempts++ < 3) socket.send(packet, port, host);
		};
		send();
		retry = setInterval(send, Math.max(500, Math.floor(timeoutMs / 3)));
	});
}

async function steamQuery(host: string, port: number, timeoutMs: number) {
	const server = await GameDig.query({
		type: 'projectzomboid',
		host,
		port,
		socketTimeout: timeoutMs,
		maxAttempts: 1,
	});
	const tags: string[] = Array.isArray(server.raw?.tags) ? server.raw.tags : [];
	const versionTag = tags.find((tag) => /(?:^|;)VERSION:/i.test(tag));
	return {
		version: versionTag?.match(/(?:^|;)VERSION:([^;]+)/i)?.[1] ?? (typeof server.version === 'string' ? server.version : null),
		players: server.players?.length ?? 0,
		maxPlayers: server.maxplayers ?? null,
		map: server.map || null,
	};
}

export async function probeProjectZomboid(options: {
	host: string;
	gamePort: number;
	queryPort?: number;
	timeoutMs?: number;
}): Promise<PzProbeResult> {
	const timeoutMs = options.timeoutMs ?? 3500;
	const queryPort = options.queryPort ?? options.gamePort;

	const [ping, query] = await Promise.allSettled([
		raknetPing(options.host, options.gamePort, timeoutMs),
		steamQuery(options.host, queryPort, timeoutMs),
	]);

	if (query.status === 'fulfilled') {
		return {
			online: true,
			statusCode: 200,
			output: `Steam query succeeded on port ${queryPort}`,
			...query.value,
		};
	}

	if (ping.status === 'fulfilled') {
		return {
			online: true,
			statusCode: 200,
			output: `Game port ${options.gamePort} answered a RakNet ping in ${ping.value} ms (player details unavailable)`,
			version: null,
		};
	}

	const reason = ping.reason instanceof Error ? ping.reason.message : String(ping.reason);
	return {
		online: false,
		statusCode: /no RakNet reply|timed? ?out/i.test(reason) ? 408 : 502,
		output: `No reply from ${options.host}:${options.gamePort} (${reason})`,
		version: null,
	};
}
