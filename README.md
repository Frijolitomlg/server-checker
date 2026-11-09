# Legit Gaming server guides

Astro site for live server status, per-server setup guides, and a protected admin area.

## Local setup

1. Copy `.env.example` to `.env`.
2. Set `ADMIN_PASSWORD` to a new shared password for the `frijolito` and `therevan` accounts.
3. Set `SESSION_SECRET` to a random secret of at least 32 characters. For example, run `node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"`.
4. Add `BORK_KV_REST_API_URL` and `BORK_KV_REST_API_TOKEN` from your Upstash Redis database. Use the REST API URL and a write-enabled REST API token.
5. Start the Project Zomboid relay in a second terminal: `cd pz-status-relay`, `npm install`, then `npm start`. The relay needs UDP access to the game server.
6. Run `npm run dev`, then open `/admin` to manage server details and tutorial steps.

The starter guide content is built in and appears until the first admin save. Saved edits are stored in KV and shared by the public guide pages.

## Deploying

Add `ADMIN_PASSWORD`, `SESSION_SECRET`, `BORK_KV_REST_API_URL`, `BORK_KV_REST_API_TOKEN`, and `PZ_RELAY_URL` as server-side environment variables in the Vercel project settings. `PZ_RELAY_URL` must be the public HTTPS URL ending in `/status` for a separately hosted instance of `pz-status-relay`. Vercel serves the website and status API, but the Project Zomboid query uses UDP; run the included relay on a host that supports outbound UDP and keep it available. Set `PZ_HOST` and `PZ_QUERY_PORT` on the relay if the game server differs from its defaults. The status API waits up to 6.5 seconds for the relay response.

The Upstash integration's other variables (such as `BORK_REDIS_URL`, `BORK_KV_URL`, or `BORK_KV_REST_API_READ_ONLY_TOKEN`) are not used by this app. Do not use `PUBLIC_` prefixes for these values. Configure the KV database for each deployment environment where you want admin edits to work.

The admin area can edit each server's name, game, address, modpack URL, map URL, and ordered tutorial steps. A step can include a publicly reachable HTTP(S) screenshot URL; leave it blank to show a screenshot placeholder.

Tutorial instructions support Markdown headings, bold, italics, inline code, lists, and HTTPS links. The admin editor includes formatting buttons for these options. The homepage, server guides, and control room share a dark red-and-charcoal theme; reduced-motion preferences disable decorative motion.
