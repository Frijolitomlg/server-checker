import { t as __exportAll } from "./rolldown-runtime_D7D4PA-g.mjs";
import dns from "node:dns/promises";
import net from "node:net";
import { GameDig } from "gamedig";
//#region src/pages/api/status.ts
var status_exports = /* @__PURE__ */ __exportAll({ GET: () => GET });
var timeoutMs = 3500;
var minecraftServers = [{
	name: "Minecraft Vanilla",
	version: "1.26.2",
	host: "retarded-minecraft.playit.plus",
	port: 25565,
	protocol: "Minecraft TCP"
}, {
	name: "Minecraft Modded",
	version: "1.21.1",
	host: "retarded-modded-minecraft.playit.plus",
	port: 25565,
	protocol: "Minecraft TCP"
}];
var zomboidServer = {
	name: "Project Zomboid",
	version: "Unknown",
	host: "209.25.140.16",
	port: 17809,
	protocol: "Project Zomboid UDP query"
};
function probe(host, port) {
	return new Promise((resolve) => {
		const socket = net.createConnection({
			host,
			port
		});
		let finished = false;
		const finish = (result) => {
			if (finished) return;
			finished = true;
			socket.destroy();
			resolve(result);
		};
		socket.setTimeout(timeoutMs);
		socket.once("connect", () => finish({
			online: true,
			statusCode: 200,
			output: `TCP connection accepted on port ${port}`
		}));
		socket.once("timeout", () => finish({
			online: false,
			statusCode: 408,
			output: `Connection timed out after ${timeoutMs}ms`
		}));
		socket.once("error", (error) => finish({
			online: false,
			statusCode: 502,
			output: error.code ? `TCP connection failed: ${error.code}` : "TCP connection failed"
		}));
	});
}
async function checkMinecraft(host) {
	try {
		const records = await dns.resolveSrv(`_minecraft._tcp.${host}`);
		if (records.length > 0) {
			const results = await Promise.all(records.map((record) => probe(record.name, record.port)));
			return results.find((result) => result.online) ?? results[0];
		}
	} catch {}
	return probe(host, 25565);
}
async function checkProjectZomboid() {
	try {
		const server = await GameDig.query({
			type: "projectzomboid",
			host: zomboidServer.host,
			port: zomboidServer.port,
			socketTimeout: timeoutMs
		});
		const version = (server.raw?.tags?.find((tag) => /(?:^|;)VERSION:/i.test(tag)))?.match(/(?:^|;)VERSION:([^;]+)/i)?.[1] || null;
		return {
			online: true,
			statusCode: 200,
			output: `Gamedig query succeeded on query port ${zomboidServer.port}`,
			version,
			players: server.players?.length ?? 0,
			maxPlayers: server.maxplayers ?? null,
			map: server.map || null
		};
	} catch (error) {
		return {
			online: false,
			statusCode: 502,
			output: `Project Zomboid query failed: ${error instanceof Error ? error.message : "Unknown error"}`,
			version: null
		};
	}
}
var GET = async () => {
	const [survival, modded, zomboid] = await Promise.all([
		checkMinecraft(minecraftServers[0].host),
		checkMinecraft(minecraftServers[1].host),
		checkProjectZomboid()
	]);
	return new Response(JSON.stringify([
		{
			...minecraftServers[0],
			...survival
		},
		{
			...minecraftServers[1],
			...modded
		},
		{
			...zomboidServer,
			...zomboid,
			version: zomboid.version || zomboidServer.version
		}
	]), { headers: {
		"Content-Type": "application/json",
		"Cache-Control": "no-store"
	} });
};
//#endregion
export { status_exports as n, GET as t };
