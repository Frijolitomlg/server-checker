import { t as __exportAll } from "./rolldown-runtime_D7D4PA-g.mjs";
import { t as GET$1 } from "./status_DTwOan7f.mjs";
//#region src/pages/servers.ts
var servers_exports = /* @__PURE__ */ __exportAll({ GET: () => GET });
var GET = async (context) => {
	const response = await GET$1(context);
	return new Response(response.body, {
		status: response.status,
		statusText: response.statusText,
		headers: response.headers
	});
};
//#endregion
//#region \0virtual:astro:page:src/pages/servers@_@ts
var page = () => servers_exports;
//#endregion
export { page };
