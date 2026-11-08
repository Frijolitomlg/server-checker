import { createHmac, timingSafeEqual } from 'node:crypto';

const allowedUsers = new Set(['frijolito', 'therevan']);
const cookieName = 'server_admin';
const sessionDurationSeconds = 60 * 60 * 8;

function getCredentials() {
	const password = import.meta.env.ADMIN_PASSWORD;
	const secret = import.meta.env.SESSION_SECRET;
	if (!password || !secret || secret.length < 32) return null;
	return { password, secret };
}

export function isAdminAuthConfigured() {
	return getCredentials() !== null;
}

function safeEqual(left: string, right: string) {
	const leftBuffer = Buffer.from(left);
	const rightBuffer = Buffer.from(right);
	return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
}

function sign(value: string, secret: string) {
	return createHmac('sha256', secret).update(value).digest('base64url');
}

export function authenticateAdmin(username: string, password: string) {
	const credentials = getCredentials();
	const normalizedUsername = username.trim().toLowerCase();
	if (!credentials || !allowedUsers.has(normalizedUsername)) return false;
	return safeEqual(password, credentials.password);
}

export function createAdminCookie(username: string, requestUrl: string) {
	const credentials = getCredentials();
	if (!credentials) throw new Error('Admin authentication is not configured.');
	const expires = Math.floor(Date.now() / 1000) + sessionDurationSeconds;
	const payload = `${username}.${expires}`;
	const secure = new URL(requestUrl).protocol === 'https:' ? '; Secure' : '';
	return `${cookieName}=${payload}.${sign(payload, credentials.secret)}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${sessionDurationSeconds}${secure}`;
}

export function clearAdminCookie(requestUrl: string) {
	const secure = new URL(requestUrl).protocol === 'https:' ? '; Secure' : '';
	return `${cookieName}=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0${secure}`;
}

export function getAdminUsername(request: Request) {
	const credentials = getCredentials();
	if (!credentials) return null;
	const cookie = request.headers.get('cookie')?.split(';').map((part) => part.trim())
		.find((part) => part.startsWith(`${cookieName}=`));
	const value = cookie?.slice(cookieName.length + 1);
	if (!value) return null;
	const [username, expiry, signature, ...rest] = value.split('.');
	if (!username || !expiry || !signature || rest.length || !allowedUsers.has(username)) return null;
	const expires = Number(expiry);
	if (!Number.isSafeInteger(expires) || expires <= Math.floor(Date.now() / 1000)) return null;
	const payload = `${username}.${expiry}`;
	return safeEqual(signature, sign(payload, credentials.secret)) ? username : null;
}

export function isSameOrigin(request: Request) {
	const origin = request.headers.get('origin');
	if (!origin) return false;
	try {
		return new URL(origin).origin === new URL(request.url).origin;
	} catch {
		return false;
	}
}

export function jsonResponse(body: unknown, status = 200, headers: HeadersInit = {}) {
	return new Response(JSON.stringify(body), {
		status,
		headers: {
			'Content-Type': 'application/json; charset=utf-8',
			'Cache-Control': 'no-store',
			...headers,
		},
	});
}
