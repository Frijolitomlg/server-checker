import { t as __exportAll } from "./rolldown-runtime_D7D4PA-g.mjs";
//#region src/pages/api/web-status.ts
var web_status_exports = /* @__PURE__ */ __exportAll({ GET: () => GET });
var targetUrl = "http://berds-komga-comics.playit.plus:13163/";
var GET = async () => {
	try {
		const response = await fetch(targetUrl, { signal: AbortSignal.timeout(5e3) });
		return Response.json({
			online: response.ok,
			statusCode: response.status
		});
	} catch {
		return Response.json({
			online: false,
			statusCode: 0
		});
	}
};
//#endregion
//#region \0virtual:astro:page:src/pages/api/web-status@_@ts
var page = () => web_status_exports;
//#endregion
export { page };
