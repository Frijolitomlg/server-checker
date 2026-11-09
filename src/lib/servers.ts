export type TutorialStep = {
	title: string;
	content: string;
	screenshotUrl: string;
};

export type ServerConfig = {
	slug: string;
	name: string;
	game: string;
	serverAddress: string;
	mapUrl: string;
	modpackUrl: string;
	steps: TutorialStep[];
};

export const defaultServers: ServerConfig[] = [
	{
		slug: 'minecraft-vanilla',
		name: 'Minecraft Vanilla',
		game: 'Minecraft',
		serverAddress: 'retarded-minecraft.playit.plus:25565',
		mapUrl: 'http://roosevelt-intact.tun.ply.gg:44435',
		modpackUrl: '',
		steps: [
			{ title: 'Get ready to play', content: 'Placeholder: add the Minecraft version and any setup notes here.', screenshotUrl: '' },
			{ title: 'Add the server', content: 'Placeholder: explain how to add this server to the multiplayer list.', screenshotUrl: '' },
			{ title: 'Join the world', content: 'Placeholder: add any final instructions for joining and getting started.', screenshotUrl: '' },
		],
	},
	{
		slug: 'minecraft-modded',
		name: 'Minecraft Modded',
		game: 'Minecraft',
		serverAddress: 'retarded-modded-minecraft.playit.plus:25565',
		mapUrl: 'http://expressing-easter.tun.ply.gg:22630',
		modpackUrl: '',
		steps: [
			{ title: 'Download the modpack', content: 'Placeholder: add the launcher and modpack installation instructions here.', screenshotUrl: '' },
			{ title: 'Check your setup', content: 'Placeholder: add the required game version and troubleshooting notes here.', screenshotUrl: '' },
			{ title: 'Connect to the server', content: 'Placeholder: explain how to add this server and join the world.', screenshotUrl: '' },
		],
	},
	{
		slug: 'project-zomboid',
		name: 'Project Zomboid',
		game: 'Project Zomboid',
		serverAddress: '209.25.140.16:17809',
		mapUrl: '',
		modpackUrl: '',
		steps: [
			{ title: 'Prepare your game', content: 'Placeholder: add the game version and required settings here.', screenshotUrl: '' },
			{ title: 'Install the mods', content: 'Placeholder: add the mod installation instructions here.', screenshotUrl: '' },
			{ title: 'Join the server', content: 'Placeholder: add the connection details and final tips here.', screenshotUrl: '' },
		],
	},
];

const serverSlugs = new Set(defaultServers.map(({ slug }) => slug));
const storageKey = 'legit-gaming:servers';

export class ServerStorageError extends Error {}

function getKvCredentials() {
	const url = import.meta.env.BORK_KV_REST_API_URL;
	const token = import.meta.env.BORK_KV_REST_API_TOKEN;
	return url && token ? { url: url.replace(/\/+$/, ''), token } : null;
}

export function isServerStorageConfigured() {
	return getKvCredentials() !== null;
}

export async function runKvCommand(command: string[]) {
	const credentials = getKvCredentials();
	if (!credentials) {
		throw new ServerStorageError('Server storage is not configured.');
	}

	const response = await fetch(credentials.url, {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${credentials.token}`,
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(command),
		cache: 'no-store',
	});

	if (!response.ok) {
		throw new ServerStorageError(`Server storage returned HTTP ${response.status}.`);
	}

	const result = (await response.json()) as { result?: unknown; error?: string };
	if (result.error) {
		throw new ServerStorageError(`Server storage request failed: ${result.error}`);
	}
	return result.result;
}

export function validateServerConfigs(value: unknown): ServerConfig[] {
	if (!Array.isArray(value) || value.length !== defaultServers.length) {
		throw new Error('Provide settings for all three servers.');
	}

	const entries = value.map((entry): ServerConfig => {
		if (!entry || typeof entry !== 'object') throw new Error('A server entry is invalid.');
		const server = entry as Record<string, unknown>;
		const slug = typeof server.slug === 'string' ? server.slug : '';
		const name = typeof server.name === 'string' ? server.name.trim() : '';
		const game = typeof server.game === 'string' ? server.game.trim() : '';
		const serverAddress = typeof server.serverAddress === 'string' ? server.serverAddress.trim() : '';
		if (!serverSlugs.has(slug) || !name || name.length > 100 || !game || game.length > 100) {
			throw new Error('A server name, game, or identifier is invalid.');
		}
		if (!serverAddress || serverAddress.length > 255) {
			throw new Error(`${name} needs a server address of 255 characters or fewer.`);
		}

		const readLink = (field: 'mapUrl' | 'modpackUrl') => {
			const link = typeof server[field] === 'string' ? server[field].trim() : '';
			if (!link) return '';
			if (link.length > 2048) throw new Error(`${field} must be 2048 characters or fewer.`);
			let parsed: URL;
			try {
				parsed = new URL(link);
			} catch {
				throw new Error(`${field} must be a complete HTTP or HTTPS link.`);
			}
			if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
				throw new Error(`${field} must be a complete HTTP or HTTPS link.`);
			}
			return link;
		};

		if (!Array.isArray(server.steps) || server.steps.length < 1 || server.steps.length > 20) {
			throw new Error(`${name} must have between 1 and 20 tutorial steps.`);
		}
		const steps = server.steps.map((item): TutorialStep => {
			if (!item || typeof item !== 'object') throw new Error(`${name} has an invalid tutorial step.`);
			const step = item as Record<string, unknown>;
			const title = typeof step.title === 'string' ? step.title.trim() : '';
			const content = typeof step.content === 'string' ? step.content.trim() : '';
			const screenshotUrl = typeof step.screenshotUrl === 'string' ? step.screenshotUrl.trim() : '';
			if (!title || title.length > 120 || !content || content.length > 2000) {
				throw new Error(`${name} has a step with a missing or overly long title or description.`);
			}
			let safeScreenshotUrl = '';
			if (screenshotUrl) {
				let parsed: URL;
				try {
					parsed = new URL(screenshotUrl);
				} catch {
					throw new Error('Screenshot links must be complete HTTP or HTTPS links.');
				}
				if ((parsed.protocol !== 'http:' && parsed.protocol !== 'https:') || screenshotUrl.length > 2048) {
					throw new Error('Screenshot links must be HTTP or HTTPS links of 2048 characters or fewer.');
				}
				safeScreenshotUrl = screenshotUrl;
			}
			return { title, content, screenshotUrl: safeScreenshotUrl };
		});

		return {
			slug,
			name,
			game,
			serverAddress,
			mapUrl: readLink('mapUrl'),
			modpackUrl: readLink('modpackUrl'),
			steps,
		};
	});

	if (new Set(entries.map(({ slug }) => slug)).size !== serverSlugs.size ||
		[...serverSlugs].some((slug) => !entries.some((entry) => entry.slug === slug))) {
		throw new Error('Each server must be included exactly once.');
	}
	return entries;
}

export async function getServers(): Promise<ServerConfig[]> {
	if (!isServerStorageConfigured()) return defaultServers;
	const stored = await runKvCommand(['GET', storageKey]);
	if (stored === null) return defaultServers;
	if (typeof stored !== 'string') throw new ServerStorageError('Server settings in storage are invalid.');
	try {
		return validateServerConfigs(JSON.parse(stored));
	} catch (error) {
		throw new ServerStorageError(
			`Could not read saved server settings: ${error instanceof Error ? error.message : 'invalid data'}`,
		);
	}
}

export async function saveServers(servers: ServerConfig[]): Promise<ServerConfig[]> {
	await runKvCommand(['SET', storageKey, JSON.stringify(servers)]);
	return servers;
}
