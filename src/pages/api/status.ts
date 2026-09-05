import dns from 'node:dns/promises';
import net from 'node:net';
import type { APIRoute } from 'astro';
import { GameDig } from 'gamedig';

const timeoutMs = 3500;

const minecraftServers = [
	{ name: 'Minecraft Vanilla', version: '1.26.2', host: 'retarded-minecraft.playit.plus', port: 25565, protocol: 'Minecraft TCP' },
	{ name: 'Minecraft Modded', version: '1.21.1', host: 'retarded-modded-minecraft.playit.plus', port: 25565, protocol: 'Minecraft TCP' },
];

const zomboidServer = { name: 'Project Zomboid', version: 'Unknown', host: '209.25.140.16', port: 17809, protocol: 'Project Zomboid UDP query' };

type ProbeResult = {
	online: boolean;
	statusCode: number;
	output: string;
	version?: string | null;
	players?: number;
	maxPlayers?: number | null;
	map?: string | null;
};

function probe(host: string, port: number) {
	return new Promise<ProbeResult>((resolve) => {
		const socket = net.createConnection({ host, port });
		let finished = false;
		const finish = (result: ProbeResult) => {
			if (finished) return;
			finished = true;
			socket.destroy();
			resolve(result);
		};
		socket.setTimeout(timeoutMs);
		socket.once('connect', () => finish({ online: true, statusCode: 200, output: `TCP connection accepted on port ${port}` }));
		socket.once('timeout', () => finish({ online: false, statusCode: 408, output: `Connection timed out after ${timeoutMs}ms` }));
		socket.once('error', (error: NodeJS.ErrnoException) => finish({
			online: false,
			statusCode: 502,
			output: error.code ? `TCP connection failed: ${error.code}` : 'TCP connection failed',
		}));
	});
}

async function checkMinecraft(host: string) {
	try {
		const records = await dns.resolveSrv(`_minecraft._tcp.${host}`);
		if (records.length > 0) {
			const results = await Promise.all(records.map((record) => probe(record.name, record.port)));
			return results.find((result) => result.online) ?? results[0];
		}
	} catch {
		// A host without an SRV record uses the default Minecraft port.
	}

	return probe(host, 25565);
}

async function checkProjectZomboid(): Promise<ProbeResult> {
	try {
		const server = await GameDig.query({
			type: 'projectzomboid',
			host: zomboidServer.host,
			port: zomboidServer.port,
			socketTimeout: timeoutMs,
		});
		const versionTag = server.raw?.tags?.find((tag) => /(?:^|;)VERSION:/i.test(tag));
		const version = versionTag?.match(/(?:^|;)VERSION:([^;]+)/i)?.[1] || null;

		return {
			online: true,
			statusCode: 200,
			output: `Gamedig query succeeded on query port ${zomboidServer.port}`,
			version,
			players: server.players?.length ?? 0,
			maxPlayers: server.maxplayers ?? null,
			map: server.map || null,
		};
	} catch (error) {
		return {
			online: false,
			statusCode: 502,
			output: `Project Zomboid query failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
			version: null,
		};
	}
}

export const GET: APIRoute = async () => {
	const [survival, modded, zomboid] = await Promise.all([
		checkMinecraft(minecraftServers[0].host),
		checkMinecraft(minecraftServers[1].host),
		checkProjectZomboid(),
	]);

	return new Response(
		JSON.stringify([
			{ ...minecraftServers[0], ...survival },
			{ ...minecraftServers[1], ...modded },
			{ ...zomboidServer, ...zomboid, version: zomboid.version || zomboidServer.version },
		]),
		{ headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } },
	);
};
