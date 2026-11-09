import { isServerStorageConfigured, runKvCommand } from './servers';

const heartbeatKey = 'legit-gaming:pz-heartbeat';
// If the host PC stops sending heartbeats for this long, the entry expires and
// the status API treats the heartbeat as missing.
export const heartbeatTtlSeconds = 180;

export type PzHeartbeat = {
	online: boolean;
	version: string | null;
	name: string | null;
	map: string | null;
	players: number;
	maxPlayers: number | null;
	output: string;
	receivedAt: string;
};

function str(value: unknown, max = 200) {
	return typeof value === 'string' && value.trim() ? value.trim().slice(0, max) : null;
}

function int(value: unknown) {
	return typeof value === 'number' && Number.isFinite(value) && value >= 0 ? Math.floor(value) : null;
}

export function parseHeartbeat(body: unknown): PzHeartbeat | null {
	if (!body || typeof body !== 'object') return null;
	const data = body as Record<string, unknown>;
	if (typeof data.online !== 'boolean') return null;
	return {
		online: data.online,
		version: str(data.version, 40),
		name: str(data.name, 100),
		map: str(data.map, 100),
		players: int(data.players) ?? 0,
		maxPlayers: int(data.maxPlayers),
		output: str(data.output, 300) ?? '',
		receivedAt: new Date().toISOString(),
	};
}

export async function saveHeartbeat(heartbeat: PzHeartbeat) {
	await runKvCommand(['SET', heartbeatKey, JSON.stringify(heartbeat), 'EX', String(heartbeatTtlSeconds)]);
}

export async function readHeartbeat(): Promise<PzHeartbeat | null> {
	if (!isServerStorageConfigured()) return null;
	try {
		const raw = await runKvCommand(['GET', heartbeatKey]);
		return typeof raw === 'string' ? (JSON.parse(raw) as PzHeartbeat) : null;
	} catch {
		return null;
	}
}
