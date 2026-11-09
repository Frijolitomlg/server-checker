// Project Zomboid heartbeat.
// Run this on the PC that hosts the Project Zomboid server. Every minute it checks
// the server locally and sends the result to the website, so the website never
// has to reach the game server through the tunnel.
//
// Required:
//   PZ_HEARTBEAT_URL     e.g. https://legitchecker.vercel.app/api/pz-heartbeat
//   PZ_HEARTBEAT_SECRET  same value as PZ_HEARTBEAT_SECRET in Vercel
// Optional:
//   PZ_HOST (default 127.0.0.1), PZ_GAME_PORT (default 16261), PZ_QUERY_PORT,
//   PZ_HEARTBEAT_INTERVAL in seconds (default 60)

const { createChecker } = require('./status');

const url = process.env.PZ_HEARTBEAT_URL;
const secret = process.env.PZ_HEARTBEAT_SECRET;
const intervalMs = Number(process.env.PZ_HEARTBEAT_INTERVAL || 60) * 1000;
const gamePort = Number(process.env.PZ_GAME_PORT || 16261);

if (!url || !secret) {
	console.error('Set PZ_HEARTBEAT_URL and PZ_HEARTBEAT_SECRET before starting the heartbeat.');
	process.exit(1);
}

const getStatus = createChecker({
	host: process.env.PZ_HOST || '127.0.0.1',
	gamePort,
	queryPort: Number(process.env.PZ_QUERY_PORT || gamePort),
	queryTimeout: 5000,
});

async function beat() {
	const status = await getStatus();
	try {
		const response = await fetch(url, {
			method: 'POST',
			headers: { Authorization: `Bearer ${secret}`, 'Content-Type': 'application/json' },
			body: JSON.stringify(status),
			signal: AbortSignal.timeout(10000),
		});
		const time = new Date().toLocaleTimeString();
		if (response.ok) {
			console.log(`${time} sent: ${status.online ? `online, ${status.players}/${status.maxPlayers ?? '?'} players` : 'offline'} (${status.output})`);
		} else {
			console.error(`${time} website returned HTTP ${response.status}: ${await response.text()}`);
		}
	} catch (error) {
		console.error(`${new Date().toLocaleTimeString()} could not reach the website: ${error.message}`);
	}
}

beat();
setInterval(beat, intervalMs);
