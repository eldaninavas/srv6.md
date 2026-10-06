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

export interface Template {
  description: string;
  notes?: string[];
  parameters: Record<string, string | number>; // defaults
  template: string;
}

/** vendor -> feature -> template */
export type TemplateStore = Record<string, Record<string, Template>>;

export async function loadTemplates(knowledgeDir: string): Promise<TemplateStore> {
  const root = path.join(knowledgeDir, "config-templates");
  const store: TemplateStore = {};
  for (const vendor of await fs.readdir(root)) {
    const dir = path.join(root, vendor);
    if (!(await fs.stat(dir)).isDirectory()) continue;
    store[vendor] = {};
    for (const file of await fs.readdir(dir)) {
      if (!file.endsWith(".yaml")) continue;
      store[vendor][file.replace(/\.yaml$/, "")] = YAML.parse(await fs.readFile(path.join(dir, file), "utf8")) as Template;
    }
  }
  return store;
}

export function getVendorConfig(
  store: TemplateStore,
  vendor: Vendor,
  feature: string,
  params: Record<string, unknown> = {},
): string {
  const features = store[vendor] ?? {};
  const available = Object.keys(features).sort();
  const key = feature.trim().toLowerCase().replace(/[\s_]+/g, "-");
  const tpl = Object.hasOwn(features, key) ? features[key] : undefined;

  if (!tpl) {
    return available.length
      ? `No template "${feature}" for ${vendor}. Available features: ${available.join(", ")}`
      : `No templates for ${vendor} yet. Templates currently exist for: ${Object.keys(store).sort().join(", ")}.`;
  }

  const values: Record<string, string> = {};
  for (const [k, v] of Object.entries({ ...tpl.parameters, ...params })) values[k] = String(v);

  const unresolved = new Set<string>();
  const config = tpl.template.replace(/\{\{\s*([\w]+)\s*\}\}/g, (_, name: string) => {
    if (Object.hasOwn(values, name)) return values[name];
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
