import { t as __exportAll } from "./rolldown-runtime_D7D4PA-g.mjs";
import { S as createAstro, d as maybeRenderHead, f as renderHead, i as renderComponent, m as createRenderInstruction, p as addAttribute, s as renderSlot, u as renderTemplate } from "./server_Klmzst-W.mjs";
import { t as createComponent } from "./compiler_BRFb4go0.mjs";
//#region node_modules/astro/dist/runtime/server/render/script.js
async function renderScript(result, id) {
	const inlined = result.inlinedScripts.get(id);
	let content = "";
	if (inlined != null) {
		if (inlined) content = `<script type="module">${inlined}<\/script>`;
	} else {
		const resolved = await result.resolve(id);
		content = `<script type="module" src="${result.userAssetsBase ? (result.base === "/" ? "" : result.base) + result.userAssetsBase : ""}${resolved}"><\/script>`;
	}
	return createRenderInstruction({
		type: "script",
		id,
		content
	});
}
//#endregion
//#region src/layouts/Layout.astro
createAstro("https://astro.build");
var $$Layout = createComponent(($$result, $$props, $$slots) => {
	const Astro = $$result.createAstro($$props, $$slots);
	Astro.self = $$Layout;
	return renderTemplate`<html lang="en" data-astro-cid-ju4pidww><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><link rel="icon" type="image/svg+xml" href="/favicon.svg"><link rel="icon" href="/favicon.ico"><meta name="generator"${addAttribute(Astro.generator, "content")}><meta name="theme-color" content="#101b2d"><title>Server status</title>${renderHead($$result)}</head><body data-astro-cid-ju4pidww>${renderSlot($$result, $$slots["default"])}</body></html>`;
}, "D:/Development/server-checker/src/layouts/Layout.astro", void 0);
//#endregion
//#region src/assets/minecraft-modded.png
var minecraft_modded_default = new Proxy({
	"src": "/_astro/minecraft-modded.BhQtdWKh.png",
	"width": 300,
	"height": 300,
	"format": "png"
}, { get(target, name, receiver) {
	if (name === "clone") return structuredClone(target);
	if (name === "fsPath") return "D:/Development/server-checker/src/assets/minecraft-modded.png";
	return target[name];
} });
//#endregion
//#region src/assets/minecraft-vanilla.png
var minecraft_vanilla_default = new Proxy({
	"src": "/_astro/minecraft-vanilla.GqhUsyKn.png",
	"width": 300,
	"height": 300,
	"format": "png"
}, { get(target, name, receiver) {
	if (name === "clone") return structuredClone(target);
	if (name === "fsPath") return "D:/Development/server-checker/src/assets/minecraft-vanilla.png";
	return target[name];
} });
//#endregion
//#region src/assets/project-zomvoid.png
var project_zomvoid_default = new Proxy({
	"src": "/_astro/project-zomvoid.BbPjdpbm.png",
	"width": 300,
	"height": 300,
	"format": "png"
}, { get(target, name, receiver) {
	if (name === "clone") return structuredClone(target);
	if (name === "fsPath") return "D:/Development/server-checker/src/assets/project-zomvoid.png";
	return target[name];
} });
//#endregion
//#region src/pages/index.astro
var pages_exports = /* @__PURE__ */ __exportAll({
	default: () => $$Index,
	file: () => $$file,
	url: () => ""
});
var $$Index = createComponent(($$result, $$props, $$slots) => {
	const serverDetails = [
		{
			name: "Minecraft Vanilla",
			version: "1.26.2",
			image: minecraft_vanilla_default
		},
		{
			name: "Minecraft Modded",
			version: "1.21.1",
			image: minecraft_modded_default
		},
		{
			name: "Project Zomboid",
			version: "B 42",
			image: project_zomvoid_default
		}
	];
	return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "data-astro-cid-lcdefpme": true }, { "default": ($$result) => renderTemplate`${maybeRenderHead($$result)}<main class="page-shell" data-astro-cid-lcdefpme><header class="page-title" data-astro-cid-lcdefpme><h1 data-astro-cid-lcdefpme>Legit Gaming Servers Status</h1></header><section class="server-grid" aria-label="Gaming server status" data-astro-cid-lcdefpme>${serverDetails.map((server) => renderTemplate`<article class="server-card"${addAttribute(server.name, "data-server-name")} data-astro-cid-lcdefpme><h2 data-astro-cid-lcdefpme>${server.name}</h2><img${addAttribute(server.image.src, "src")}${addAttribute(`${server.name} server`, "alt")} data-astro-cid-lcdefpme><div class="detail-row" data-astro-cid-lcdefpme><span data-astro-cid-lcdefpme>Version:</span><strong data-astro-cid-lcdefpme>${server.version}</strong></div><div class="detail-row" data-astro-cid-lcdefpme><span data-astro-cid-lcdefpme>Status:</span><strong class="server-status" data-astro-cid-lcdefpme>Checking...</strong></div><div class="detail-row diagnostic-row" data-astro-cid-lcdefpme><span data-astro-cid-lcdefpme>Code:</span><strong class="server-code" data-astro-cid-lcdefpme>-</strong></div></article>`)}</section><section class="service-links" aria-label="Web server links" data-astro-cid-lcdefpme><div class="service-row" data-service-url="http://berds-komga-comics.playit.plus:13163/" data-astro-cid-lcdefpme><span class="service-indicator" aria-label="Checking status" data-astro-cid-lcdefpme></span><a href="http://berds-komga-comics.playit.plus:13163/" target="_blank" rel="noreferrer" data-astro-cid-lcdefpme>Berds Komga Comics</a></div></section></main>` })}${renderScript($$result, "D:/Development/server-checker/src/pages/index.astro?astro&type=script&index=0&lang.ts")}`;
}, "D:/Development/server-checker/src/pages/index.astro", void 0);
var $$file = "D:/Development/server-checker/src/pages/index.astro";
//#endregion
//#region \0virtual:astro:page:src/pages/index@_@astro
var page = () => pages_exports;
//#endregion
export { page };
