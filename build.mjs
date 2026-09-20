// Syncs src/style.css, src/cover.html and src/cover.js into page.html (the artifact fragment),
// then wraps it into a complete index.html for local viewing or hosting.  Run: node build.mjs
import { readFile, writeFile } from "node:fs/promises";

const here = new URL("./", import.meta.url);
const read = (p) => readFile(new URL(p, here), "utf8");
let frag = await read("page.html");
const css = await read("src/style.css");
const cover = await read("src/cover.html");
const coverJs = (await read("src/cover.js")) + (await read("src/ambience.js"));

const rep = (re, val, label) => { if (!re.test(frag)) throw new Error("build: could not find " + label); frag = frag.replace(re, () => val); };
rep(/<style>[\s\S]*?<\/style>/, `<style>\n${css}</style>`, "style block");
rep(/<header class="cover"[\s\S]*?<\/header>\n/, cover, "cover header");
rep(/\/\* =+ COVER ART =+ \*\/[\s\S]*?(?=\/\* =+ ACTIVE TAB)/, coverJs, "cover script");
await writeFile(new URL("page.html", here), frag);

const split = frag.indexOf("<header");
const head = frag.slice(0, split);
const body = frag.slice(split);
const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="description" content="Six mountain escapes from Delhi over the Gandhi Jayanti long weekend, 1–5 Oct 2026, all by overnight bus from Kashmere Gate.">
<meta name="color-scheme" content="light dark">
<meta property="og:title" content="The Overnight Issue">
<meta property="og:description" content="Six hill escapes from Delhi by night bus — compared, planned day by day, for the Gandhi Jayanti weekend.">
<meta property="og:image" content="img/mcleod.jpg">
${head}
<style>html,body{margin:0}img{max-width:100%}[hidden]{display:none!important}</style>
</head>
<body>
${body}
</body>
</html>
`;
await writeFile(new URL("index.html", here), html);
console.log("page.html synced, index.html written,", Math.round(html.length / 1024), "KB");
