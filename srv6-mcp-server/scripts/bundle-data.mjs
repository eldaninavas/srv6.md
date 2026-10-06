// Bundles docs/ + knowledge/ into worker/generated/data.json for the Cloudflare Worker (no fs at runtime).
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadDocs } from "../dist/data/loader.js";
import { loadBehaviors } from "../dist/tools/behaviors.js";
import { loadTemplates } from "../dist/tools/configs.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const docsPath = path.resolve(root, process.argv[2] ?? "../docs");
const knowledge = path.join(root, "knowledge");

const pages = await loadDocs(docsPath);
const data = { pages, behaviors: await loadBehaviors(knowledge), templates: await loadTemplates(knowledge) };
const out = path.join(root, "worker", "generated", "data.json");
mkdirSync(path.dirname(out), { recursive: true });
writeFileSync(out, JSON.stringify(data));
console.error(`bundled ${pages.length} pages, ${data.behaviors.length} behaviors -> ${path.relative(root, out)}`);
