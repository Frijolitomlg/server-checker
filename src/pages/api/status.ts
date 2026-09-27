import { GameDig } from 'gamedig';
import type { APIRoute } from 'astro';

const timeoutMs = 3500;
const pzRelayUrl = import.meta.env.PZ_RELAY_URL || 'http://127.0.0.1:3001/status';

const minecraftServers = [
	{ name: 'Minecraft Vanilla', host: 'retarded-minecraft.playit.plus', port: 25565, protocol: 'Minecraft Java status' },
	{ name: 'Minecraft Modded', host: 'retarded-modded-minecraft.playit.plus', port: 25565, protocol: 'Minecraft Java status' },
];

const zomboidServer = { name: 'Project Zomboid', host: '209.25.140.16', port: 17809, protocol: 'Project Zomboid UDP query' };

type ProbeResult = {
	online: boolean;
	statusCode: number;
	output: string;
	version?: string | null;
	players?: number;
	maxPlayers?: number | null;
	map?: string | null;
};

async function checkMinecraft(server: (typeof minecraftServers)[number]): Promise<ProbeResult> {
	try {
		const result = await GameDig.query({
			type: 'minecraft',
			host: server.host,
			port: server.port,
			socketTimeout: timeoutMs,
			maxAttempts: 1,
		});
		return {
			online: true,
			statusCode: 200,
			output: `Minecraft status query succeeded on port ${server.port}`,
			version: typeof result.version === 'string' ? result.version : null,
			players: result.players?.length ?? 0,
			maxPlayers: result.maxplayers ?? null,
			map: result.map ?? null,
		};
	} catch (error) {
		const message = error instanceof Error ? error.message : 'Unknown query error';
		return {
			online: false,
			statusCode: /timed? ?out|timeout/i.test(message) ? 408 : 502,
			output: `Minecraft status query failed: ${message}`,
			version: null,
		};
	}
}

async function checkProjectZomboid(): Promise<ProbeResult> {
	try {
		const response = await fetch(pzRelayUrl, { signal: AbortSignal.timeout(timeoutMs) });
		if (!response.ok) {
			return {
				online: false,
				statusCode: response.status,
				output: `Relay returned HTTP ${response.status}`,
				version: null,
			};
		}
		const result = await response.json() as ProbeResult;
		const online = Boolean(result.online);
		return {
			online,
			statusCode: result.statusCode ?? (online ? 200 : 503),
			output: result.output || 'Relay returned no output',
			version: result.version ?? null,
			players: result.players,
			maxPlayers: result.maxPlayers,
			map: result.map,
		};
	} catch (error) {
		return {
			online: false,
			statusCode: 502,
			output: `Project Zomboid relay unavailable: ${error instanceof Error ? error.message : 'Unknown error'}`,
			version: null,
		};
	}
}

export const GET: APIRoute = async () => {
	const [survival, modded, zomboid] = await Promise.all([
		checkMinecraft(minecraftServers[0]),
		checkMinecraft(minecraftServers[1]),
		checkProjectZomboid(),
	]);

	return new Response(
		JSON.stringify([
			{ ...minecraftServers[0], ...survival },
			{ ...minecraftServers[1], ...modded },
			{ ...zomboidServer, ...zomboid },
		]),
		{ headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } },
	);
};
