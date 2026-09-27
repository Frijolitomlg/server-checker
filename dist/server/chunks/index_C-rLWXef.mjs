import { t as __exportAll } from "./rolldown-runtime_BBjsoOtd.mjs";
import { S as createAstro, d as maybeRenderHead, f as renderHead, i as renderComponent, m as createRenderInstruction, p as addAttribute, s as renderSlot, u as renderTemplate } from "./server_qN_EnC_d.mjs";
import { t as createComponent } from "./compiler_CrnhIda2.mjs";
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
	return renderTemplate`<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><link rel="icon" type="image/svg+xml" href="/favicon.svg"><link rel="icon" href="/favicon.ico"><meta name="generator"${addAttribute(Astro.generator, "content")}><meta name="theme-color" content="#171717"><meta name="description" content="Live status for the Legit Gaming servers: Minecraft Vanilla, Minecraft Modded, Project Zomboid and Komga Readings."><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bungee&family=Coustard&family=Creepster&family=Inter:wght@400;700&family=Press+Start+2P&display=swap"><title>Legit Gaming — Server Status Checker</title>${renderHead($$result)}</head><body>${renderSlot($$result, $$slots["default"])}</body></html>`;
}, "D:/Development/legit-servers-status-check/src/layouts/Layout.astro", void 0);
//#endregion
//#region src/assets/Minecraft-Vanilla-BG.png
var Minecraft_Vanilla_BG_default = new Proxy({
	"src": "/_astro/Minecraft-Vanilla-BG.DPUpNTg-.png",
	"width": 2920,
	"height": 800,
	"format": "png"
}, { get(target, name, receiver) {
	if (name === "clone") return structuredClone(target);
	if (name === "fsPath") return "D:/Development/legit-servers-status-check/src/assets/Minecraft-Vanilla-BG.png";
	return target[name];
} });
//#endregion
//#region src/assets/Minecraft-modded-BG.png
var Minecraft_modded_BG_default = new Proxy({
	"src": "/_astro/Minecraft-modded-BG.Cps93Aq_.png",
	"width": 2920,
	"height": 800,
	"format": "png"
}, { get(target, name, receiver) {
	if (name === "clone") return structuredClone(target);
	if (name === "fsPath") return "D:/Development/legit-servers-status-check/src/assets/Minecraft-modded-BG.png";
	return target[name];
} });
//#endregion
//#region src/assets/Zomboid-BG.png
var Zomboid_BG_default = new Proxy({
	"src": "/_astro/Zomboid-BG.RtP92OLx.png",
	"width": 2920,
	"height": 800,
	"format": "png"
}, { get(target, name, receiver) {
	if (name === "clone") return structuredClone(target);
	if (name === "fsPath") return "D:/Development/legit-servers-status-check/src/assets/Zomboid-BG.png";
	return target[name];
} });
//#endregion
//#region src/assets/Komga-bg.png
var Komga_bg_default = new Proxy({
	"src": "/_astro/Komga-bg.B23wLg0e.png",
	"width": 2920,
	"height": 800,
	"format": "png"
}, { get(target, name, receiver) {
	if (name === "clone") return structuredClone(target);
	if (name === "fsPath") return "D:/Development/legit-servers-status-check/src/assets/Komga-bg.png";
	return target[name];
} });
//#endregion
//#region src/assets/mc-map-icon.png
var mc_map_icon_default = new Proxy({
	"src": "/_astro/mc-map-icon.BOeGyhuY.png",
	"width": 64,
	"height": 64,
	"format": "png"
}, { get(target, name, receiver) {
	if (name === "clone") return structuredClone(target);
	if (name === "fsPath") return "D:/Development/legit-servers-status-check/src/assets/mc-map-icon.png";
	return target[name];
} });
//#endregion
//#region src/assets/fabric-icon.png
var fabric_icon_default = new Proxy({
	"src": "/_astro/fabric-icon.BTUfRGNB.png",
	"width": 64,
	"height": 64,
	"format": "png"
}, { get(target, name, receiver) {
	if (name === "clone") return structuredClone(target);
	if (name === "fsPath") return "D:/Development/legit-servers-status-check/src/assets/fabric-icon.png";
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
	const servers = [
		{
			key: "Minecraft Vanilla",
			title: "Minecraft Vanilla",
			version: "1.26.2",
			titleFont: "'Press Start 2P'",
			background: Minecraft_Vanilla_BG_default,
			icons: [{
				src: mc_map_icon_default,
				href: "http://roosevelt-intact.tun.ply.gg:44435",
				alt: "Minecraft Map"
			}, {
				src: fabric_icon_default,
				href: "#",
				alt: "Fabric Link"
			}],
			compact: false
		},
		{
			key: "Minecraft Modded",
			title: "Minecraft Modded",
			version: "1.21.1",
			titleFont: "'Press Start 2P'",
			background: Minecraft_modded_BG_default,
			icons: [{
				src: fabric_icon_default,
				href: "#",
				alt: "Fabric Link"
			}],
			compact: false
		},
		{
			key: "Project Zomboid",
			title: "Project Zomboid",
			version: "B 42",
			titleFont: "'Creepster'",
			background: Zomboid_BG_default,
			icons: [],
			compact: true
		}
	];
	return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "data-astro-cid-lcdefpme": true }, { "default": ($$result2) => renderTemplate`${maybeRenderHead($$result2)}<main class="page" data-astro-cid-lcdefpme><header class="page-header" data-astro-cid-lcdefpme><div class="page-header__inner" data-astro-cid-lcdefpme><h1 class="page-header__title" data-astro-cid-lcdefpme>Legit Gaming</h1><p class="page-header__subtitle" data-astro-cid-lcdefpme>Server Status Checker</p></div></header><section class="server-list" aria-label="Gaming server status" data-astro-cid-lcdefpme>${servers.map((server) => renderTemplate`<article class="server-card"${addAttribute(server.key, "data-server-name")}${addAttribute(`--card-bg: url('${server.background.src}'); --title-font: ${server.titleFont};`, "style")} data-astro-cid-lcdefpme><h2 class="server-card__title" data-astro-cid-lcdefpme>${server.title}</h2><div class="server-card__body" data-astro-cid-lcdefpme><dl${addAttribute(["server-details", { "server-details--compact": server.compact }], "class:list")} data-astro-cid-lcdefpme><div class="server-details__row" data-astro-cid-lcdefpme><dt class="server-details__label" data-astro-cid-lcdefpme>Version:</dt><dd class="server-details__value" data-astro-cid-lcdefpme>${server.version}</dd></div><div class="server-details__row" data-astro-cid-lcdefpme><dt class="server-details__label" data-astro-cid-lcdefpme>Status:</dt><dd class="server-details__value server-status" data-status data-astro-cid-lcdefpme>Checking...</dd></div><div class="server-details__row" data-astro-cid-lcdefpme><dt class="server-details__label" data-astro-cid-lcdefpme>Code</dt><dd class="server-details__value" data-code data-astro-cid-lcdefpme>-</dd></div></dl>${server.icons.length > 0 && renderTemplate`<div class="server-icons" data-astro-cid-lcdefpme>${server.icons.map((icon) => icon.href ? renderTemplate`<a class="server-icon-button"${addAttribute(icon.href, "href")} target="_blank" rel="noreferrer"${addAttribute(icon.alt, "aria-label")} data-astro-cid-lcdefpme><img class="server-icon"${addAttribute(icon.src.src, "src")}${addAttribute(icon.alt, "alt")} width="64" height="64" loading="lazy" decoding="async" data-astro-cid-lcdefpme></a>` : renderTemplate`<img class="server-icon"${addAttribute(icon.src.src, "src")}${addAttribute(icon.alt, "alt")} width="64" height="64" loading="lazy" decoding="async" data-astro-cid-lcdefpme>`)}</div>`}</div><p class="visually-hidden" data-output aria-live="polite" data-astro-cid-lcdefpme>Waiting for probe...</p></article>`)}<article class="server-card server-card--komga"${addAttribute(`--card-bg: url('${Komga_bg_default.src}'); --title-font: 'Coustard';`, "style")} data-astro-cid-lcdefpme><h2 class="server-card__title server-card__title--large" data-astro-cid-lcdefpme>Komga Readings</h2><div class="komga-body" data-astro-cid-lcdefpme><div class="komga-body__row" data-astro-cid-lcdefpme><a class="komga-login" href="https://berds-komga-comics.playit.plus:13163/" data-astro-cid-lcdefpme>Log in</a></div></div></article></section></main>` })}${renderScript($$result, "D:/Development/legit-servers-status-check/src/pages/index.astro?astro&type=script&index=0&lang.ts")}`;
}, "D:/Development/legit-servers-status-check/src/pages/index.astro", void 0);
var $$file = "D:/Development/legit-servers-status-check/src/pages/index.astro";
//#endregion
//#region \0virtual:astro:page:src/pages/index@_@astro
var page = () => pages_exports;
//#endregion
export { page };
