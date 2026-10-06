import { promises as fs } from "node:fs";
import path from "node:path";
import YAML from "yaml";

export const VENDORS = [
  "cisco-iosxr",
  "cisco-iosxe",
  "juniper-junos",
  "frrouting",
  "linux-kernel",
  "sonic",
] as const;
export type Vendor = (typeof VENDORS)[number];

interface Template {
  description: string;
  notes?: string[];
  parameters: Record<string, string | number>; // defaults
  template: string;
}

async function listFeatures(dir: string): Promise<string[]> {
  try {
    return (await fs.readdir(dir)).filter((f) => f.endsWith(".yaml")).map((f) => f.replace(/\.yaml$/, "")).sort();
  } catch {
    return [];
  }
}

export async function getVendorConfig(
  knowledgeDir: string,
  vendor: Vendor,
  feature: string,
  params: Record<string, unknown> = {},
): Promise<string> {
  const vendorDir = path.join(knowledgeDir, "config-templates", vendor);
  const available = await listFeatures(vendorDir);
  const key = feature.trim().toLowerCase().replace(/[\s_]+/g, "-");

  if (!/^[a-z0-9-]+$/.test(key) || !available.includes(key)) {
    return available.length
      ? `No template "${feature}" for ${vendor}. Available features: ${available.join(", ")}`
      : `No templates for ${vendor} yet. Templates currently exist for: cisco-iosxr, frrouting.`;
  }

  const tpl = YAML.parse(await fs.readFile(path.join(vendorDir, `${key}.yaml`), "utf8")) as Template;
  const values: Record<string, string> = {};
  for (const [k, v] of Object.entries({ ...tpl.parameters, ...params })) values[k] = String(v);

  const unresolved = new Set<string>();
  const config = tpl.template.replace(/\{\{\s*([\w]+)\s*\}\}/g, (_, name: string) => {
    if (name in values) return values[name];
    unresolved.add(name);
    return `{{${name}}}`;
  });

  const unknownParams = Object.keys(params).filter((p) => !(p in tpl.parameters));
  const lang = vendor === "linux-kernel" ? "bash" : "text";
  return [
    `# ${vendor}: ${key}`,
    tpl.description,
    "",
    "```" + lang,
    config.trimEnd(),
    "```",
    ...(tpl.notes?.length ? ["", "Notes:", ...tpl.notes.map((n) => `- ${n}`)] : []),
    ...(unknownParams.length ? ["", `Ignored unknown parameters: ${unknownParams.join(", ")}. Supported: ${Object.keys(tpl.parameters).join(", ")}`] : []),
    ...(unresolved.size ? ["", `Unresolved placeholders: ${[...unresolved].join(", ")}`] : []),
  ].join("\n");
}
