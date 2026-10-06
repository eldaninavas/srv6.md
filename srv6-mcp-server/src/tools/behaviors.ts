import { promises as fs } from "node:fs";
import path from "node:path";

export interface Behavior {
  name: string;
  aliases?: string[];
  rfc: string;
  category: string;
  summary: string;
  definition: string;
  pseudocode: string[];
  use_cases: string[];
  vendor_support: string[];
}

export async function loadBehaviors(knowledgeDir: string): Promise<Behavior[]> {
  const file = path.join(knowledgeDir, "behaviors.json");
  const parsed = JSON.parse(await fs.readFile(file, "utf8")) as { behaviors: Behavior[] };
  return parsed.behaviors;
}

const norm = (s: string) => s.toLowerCase().replace(/[\s_-]+/g, "");

export function getBehavior(behaviors: Behavior[], query: string, includePseudocode: boolean): string {
  const q = norm(query);
  const found = behaviors.find((b) => norm(b.name) === q || b.aliases?.some((a) => norm(a) === q));
  if (!found) {
    const close = behaviors.filter((b) => norm(b.name).includes(q) || q.includes(norm(b.name))).map((b) => b.name);
    return [
      `Unknown behavior "${query}".`,
      close.length ? `Did you mean: ${close.join(", ")}?` : "",
      `Available: ${behaviors.map((b) => b.name).join(", ")}`,
    ]
      .filter(Boolean)
      .join("\n");
  }
  const out = [
    `# ${found.name}`,
    `**Reference:** ${found.rfc} | **Category:** ${found.category}`,
    "",
    found.summary,
    "",
    "## Definition",
    found.definition,
    "",
    "## Use cases",
    ...found.use_cases.map((u) => `- ${u}`),
    "",
    "## Vendor support (indicative; check the implementation pages for versions)",
    ...found.vendor_support.map((v) => `- ${v}`),
  ];
  if (includePseudocode) {
    out.push("", "## Pseudocode (condensed from the RFC)", "```text", ...found.pseudocode, "```");
  }
  return out.join("\n");
}
