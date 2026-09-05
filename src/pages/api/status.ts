import dns from 'node:dns/promises';
import net from 'node:net';
import type { APIRoute } from 'astro';
import { GameDig } from 'gamedig';

const timeoutMs = 3500;

const minecraftServers = [
	{ name: 'Minecraft Vanilla', version: 'Unknown', host: 'retarded-minecraft.playit.plus', port: 25565, protocol: 'Minecraft TCP' },
	{ name: 'Minecraft Modded', version: 'Unknown', host: 'retarded-modded-minecraft.playit.plus', port: 25565, protocol: 'Minecraft TCP' },
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

function writeVarInt(value: number) {
	const bytes: number[] = [];
	while (true) {
		if ((value & ~0x7f) === 0) {
			bytes.push(value);
			return Buffer.from(bytes);
		}
		bytes.push((value & 0x7f) | 0x80);
		value >>>= 7;
	}
}

function readVarInt(buffer: Buffer, offset = 0) {
	let value = 0;
	let shift = 0;
	let index = offset;
	while (index < buffer.length && shift < 35) {
		const byte = buffer[index++];
		value |= (byte & 0x7f) << shift;
		if ((byte & 0x80) === 0) return { value, offset: index };
		shift += 7;
	}
	return null;
}

function minecraftStatus(host: string, port: number) {
	return new Promise<ProbeResult>((resolve) => {
		const socket = net.createConnection({ host, port });
		let data = Buffer.alloc(0);
		let finished = false;
		const finish = (result: ProbeResult) => {
			if (finished) return;
			finished = true;
			socket.destroy();
			resolve(result);
		};

		socket.setTimeout(timeoutMs);
		socket.once('connect', () => {
			const address = Buffer.from(host, 'utf8');
			const handshake = Buffer.concat([
				Buffer.from([0x00]),
				writeVarInt(0x100),
				writeVarInt(address.length),
				address,
				Buffer.from([(port >> 8) & 0xff, port & 0xff]),
				Buffer.from([0x01]),
			]);
			const handshakePacket = Buffer.concat([writeVarInt(handshake.length), handshake]);
			const request = Buffer.from([0x01, 0x00]);
			socket.write(Buffer.concat([handshakePacket, request]));
		});
		socket.on('data', (chunk) => {
			data = Buffer.concat([data, chunk]);
			const packetLength = readVarInt(data);
			if (!packetLength || data.length < packetLength.value + packetLength.offset) return;
			const packet = data.subarray(packetLength.offset, packetLength.offset + packetLength.value);
			const stringLength = readVarInt(packet, 1);
			if (!stringLength) return finish({ online: false, statusCode: 502, output: 'Invalid Minecraft status response' });
			try {
				const result = JSON.parse(packet.subarray(stringLength.offset, stringLength.offset + stringLength.value).toString('utf8'));
				finish({
					online: true,
					statusCode: 200,
					output: 'Minecraft status query succeeded',
					version: result.version?.name || null,
				});
			} catch {
				finish({ online: false, statusCode: 502, output: 'Invalid Minecraft status JSON' });
			}
		});
		socket.once('timeout', () => finish({ online: false, statusCode: 408, output: `Connection timed out after ${timeoutMs}ms` }));
		socket.once('error', (error: NodeJS.ErrnoException) => finish({
			online: false,
			statusCode: 502,
			output: error.code ? `Minecraft query failed: ${error.code}` : 'Minecraft query failed',
		}));
	});
}

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
			const results = await Promise.all(records.map((record) => minecraftStatus(record.name, record.port)));
			return results.find((result) => result.online) ?? results[0];
		}
	} catch {
		// A host without an SRV record uses the default Minecraft port.
	}

	return minecraftStatus(host, 25565);
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
