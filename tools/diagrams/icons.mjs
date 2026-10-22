// Picks a network icon for each flowchart node from its label (names match
// src/diagrams/icons.mjs). Conservative on purpose: only short labels that
// name a role, and only in diagrams where most nodes are network elements,
// so a decision tree or a concept diagram stays text-only.

const MAX_WORDS = 5;

// First match wins, so the specific roles come before the generic ones.
const RULES = [
  ['gpu', /\bgpus?\b/],
  ['nic', /\bnics?\b/],
  ['satellite', /\b(satellite|leo)\b/],
  ['radio', /\b(ran|gnb|radio unit|radio|distributed unit|centralized unit|5g core|upf)\b/],
  ['kubernetes', /\b(k8s|kubernetes|pod)\b/],
  ['controller', /\b(controller|pce|sdn|orchestrator)\b/],
  ['database', /\b(db|database|time-series)\b/],
  ['telemetry', /\b(telemetry|collector|grafana|dashboard|pm engine)\b/],
  ['internet', /\binternet\b/],
  ['cloud', /\b(cloud|core|wan)\b/],
  ['site', /\b(customer|branch|site|cpe|office|on-prem|client)\b/],
  ['dc', /\b(data ?center|dc|hub)\b/],
  ['switch', /\b(spine|switch|t0|t1|tor)\b/],
  ['server', /\b(host|server)\b/],
  ['router', /\b(pe\d*|p\d*|ce\d*|asbr\d*|abr|router|rr|gateway|headend|ingress|egress|r\d+|bng|bras|replication node)\b/],
];

const ELIGIBLE = new Set(['rect', 'round', 'stadium', 'circle', 'doublecircle', 'subroutine']);

export function iconFor(label, { spine = false } = {}) {
  const text = label.join(' ').toLowerCase().trim();
  if (!text || text.split(/\s+/).length > MAX_WORDS) return undefined;
  if (spine && /\bleaf\b/.test(text)) return 'switch';
  for (const [icon, re] of RULES) if (re.test(text)) return icon;
  return undefined;
}

// Sets node.icon in place when the diagram reads as a network topology.
export function assignIcons(model) {
  if (model.nodes.some((n) => n.shape === 'diamond')) return 0; // a decision tree
  const nodes = model.nodes.filter((n) => ELIGIBLE.has(n.shape));
  const spine = model.nodes.some((n) => /\bspine\b/i.test(n.label.join(' ')));
  const picks = new Map(nodes.map((n) => [n, iconFor(n.label, { spine })]));
  const hits = [...picks.values()].filter(Boolean).length;
  if (hits < 2 || hits < nodes.length / 2) return 0;
  for (const [n, icon] of picks) if (icon) n.icon = icon;
  return hits;
}
