import { GameDig } from 'gamedig';
import type { APIRoute } from 'astro';
import { probeProjectZomboid } from '../../lib/pzProbe';

const minecraftTimeoutMs = 3500;
const pzRelayTimeoutMs = 6500;
const pzRelayUrl = import.meta.env.PZ_RELAY_URL?.trim();
const pzHost = import.meta.env.PZ_HOST?.trim() || '209.25.140.16';
const pzGamePort = Number(import.meta.env.PZ_GAME_PORT || 17809);
const pzQueryPort = Number(import.meta.env.PZ_QUERY_PORT || pzGamePort);

const minecraftServers = [
	{ name: 'Minecraft Vanilla', host: 'retarded-minecraft.playit.plus', port: 25565, protocol: 'Minecraft Java status' },
	{ name: 'Minecraft Modded', host: 'retarded-modded-minecraft.playit.plus', port: 25565, protocol: 'Minecraft Java status' },
];

const zomboidServer = { name: 'Project Zomboid', host: pzHost, port: pzGamePort, protocol: 'Project Zomboid RakNet ping / Steam query' };

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
			socketTimeout: minecraftTimeoutMs,
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

async function checkProjectZomboidDirect(): Promise<ProbeResult> {
	return probeProjectZomboid({ host: pzHost, gamePort: pzGamePort, queryPort: pzQueryPort, timeoutMs: minecraftTimeoutMs });
}

async function checkProjectZomboidViaRelay(relayUrl: string): Promise<ProbeResult | null> {
	try {
		const response = await fetch(relayUrl, { signal: AbortSignal.timeout(pzRelayTimeoutMs) });
		if (!response.ok) return null;
		const result = await response.json() as ProbeResult;
		const online = Boolean(result.online);
		return {
			online,
			statusCode: result.statusCode ?? (online ? 200 : 503),
			output: `Relay: ${result.output || 'no output'}`,
			version: result.version ?? null,
			players: result.players,
			maxPlayers: result.maxPlayers,
			map: result.map,
		};
	} catch {
		return null;
	}
}

async function checkProjectZomboid(): Promise<ProbeResult> {
	// Prefer the relay when one is configured, but never depend on it:
	// if it is unreachable, query the game server directly from this function.
	if (pzRelayUrl) {
		const relayed = await checkProjectZomboidViaRelay(pzRelayUrl);
		if (relayed?.online) return relayed;
		const direct = await checkProjectZomboidDirect();
		if (direct.online || !relayed) return direct;
		return relayed;
	}
	return checkProjectZomboidDirect();
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
