// SRv6 SID / uSID decoder for docs/tools/sid-decoder.md.
// The decoding core is pure (no DOM) and also loads under Node, where
// tests/sid-decoder.test.js exercises it with known vectors.

;(function (root) {
"use strict";

// ---------------------------------------------------------------------------
// Core: parsing, formatting, decoding
// ---------------------------------------------------------------------------

var MASK128 = (1n << 128n) - 1n;

function DecodeError(message) {
  var e = new Error(message);
  e.name = "DecodeError";
  return e;
}

function parseIPv4(str) {
  var octets = str.split(".");
  if (octets.length !== 4) throw DecodeError("Embedded IPv4 address must have four octets");
  var v = 0;
  for (var i = 0; i < 4; i++) {
    if (!/^\d{1,3}$/.test(octets[i]) || +octets[i] > 255) {
      throw DecodeError("Invalid IPv4 octet \"" + octets[i] + "\"");
    }
    v = v * 256 + +octets[i];
  }
  return v;
}

// Accepts any RFC 4291 text form: "::" compression, leading zeros, upper case,
// a trailing dotted IPv4, [brackets], a /prefix-length and a %zone suffix.
function parseIPv6(input) {
  var s = String(input == null ? "" : input).trim();
  var prefixLen = null;
  if (s.charAt(0) === "[") {
    var close = s.indexOf("]");
    if (close < 0) throw DecodeError("Missing closing \"]\"");
    s = s.slice(1, close);
  }
  var slash = s.indexOf("/");
  if (slash >= 0) {
    var p = s.slice(slash + 1);
    if (!/^\d{1,3}$/.test(p) || +p > 128) throw DecodeError("Prefix length must be 0 to 128");
    prefixLen = +p;
    s = s.slice(0, slash);
  }
  var pct = s.indexOf("%");
  if (pct >= 0) s = s.slice(0, pct);
  if (!s) throw DecodeError("Enter an IPv6 address");
  if (!/^[0-9a-fA-F:.]+$/.test(s)) {
    throw DecodeError("Only hex digits, \":\" and \".\" are allowed in an IPv6 address");
  }

  var halves = s.split("::");
  if (halves.length > 2) throw DecodeError("\"::\" may appear only once");
  var compressed = halves.length === 2;
  var head = halves[0] === "" ? [] : halves[0].split(":");
  var tail = compressed ? (halves[1] === "" ? [] : halves[1].split(":")) : [];

  var groups = head.concat(tail);
  // The text's final group is the last of `groups` unless the address ends in "::"
  var finalIndex = compressed && tail.length === 0 ? -1 : groups.length - 1;
  for (var i = 0; i < groups.length; i++) {
    var g = groups[i];
    if (g.indexOf(".") >= 0) {
      if (i !== finalIndex) throw DecodeError("A dotted IPv4 part is only allowed at the end");
    } else if (g === "") {
      throw DecodeError("Empty group: a single \":\" at the start or end, or \":::\"");
    } else if (g.length > 4) {
      throw DecodeError("Group \"" + g + "\" has more than 4 hex digits");
    }
  }

  function toWords(list) {
    var out = [];
    list.forEach(function (g) {
      if (g.indexOf(".") >= 0) {
        var v4 = parseIPv4(g);
        out.push(Math.floor(v4 / 65536), v4 % 65536);
      } else {
        out.push(parseInt(g, 16));
      }
    });
    return out;
  }
  var hw = toWords(head);
  var tw = toWords(tail);
  var words;
  if (compressed) {
    if (hw.length + tw.length > 7) throw DecodeError("Too many groups for \"::\" (at most 7 besides it)");
    words = hw.concat(new Array(8 - hw.length - tw.length).fill(0), tw);
  } else {
    if (hw.length !== 8) {
      throw DecodeError("An IPv6 address has 8 groups; found " + hw.length + " (use \"::\" to compress zeros)");
    }
    words = hw;
  }

  var value = 0n;
  for (var j = 0; j < 8; j++) value = (value << 16n) | BigInt(words[j]);
  return { value: value, prefixLen: prefixLen };
}

function hextets(value) {
  var out = [];
  for (var i = 7; i >= 0; i--) out.push(Number((value >> BigInt(i * 16)) & 0xffffn));
  return out;
}

function expand(value) {
  return hextets(value).map(function (w) { return w.toString(16).padStart(4, "0"); }).join(":");
}

// RFC 5952 canonical text form.
function compress(value) {
  var w = hextets(value);
  var bestStart = -1, bestLen = 0;
  for (var i = 0; i < 8;) {
    if (w[i] !== 0) { i++; continue; }
    var j = i;
    while (j < 8 && w[j] === 0) j++;
    if (j - i > bestLen) { bestStart = i; bestLen = j - i; }
    i = j;
  }
  var hex = w.map(function (x) { return x.toString(16); });
  if (bestLen < 2) return hex.join(":");
  return hex.slice(0, bestStart).join(":") + "::" + hex.slice(bestStart + bestLen).join(":");
}

// Bits are numbered 0 (most significant) to 127, as in the RFCs.
function getBits(value, start, len) {
  if (len <= 0) return 0n;
  return (value >> BigInt(128 - start - len)) & ((1n << BigInt(len)) - 1n);
}

function prefixOf(value, len) {
  if (len <= 0) return 0n;
  var keep = BigInt(128 - len);
  return (value >> keep) << keep;
}

function inPrefix(value, prefix, len) {
  return prefixOf(value, len) === prefixOf(prefix, len);
}

function hexOf(bigint, bits) {
  return bigint.toString(16).padStart(Math.max(1, Math.ceil(bits / 4)), "0");
}

var PRESETS = {
  f3216: { kind: "usid", lbl: 32, csid: 16, name: "F3216" },
  f1616: { kind: "usid", lbl: 16, csid: 16, name: "F1616" },
  f4816: { kind: "usid", lbl: 48, csid: 16, name: "F4816" }
};

function intIn(v, lo, hi, what) {
  var n = typeof v === "number" ? v : (/^\s*\d+\s*$/.test(String(v)) ? parseInt(v, 10) : NaN);
  if (!Number.isInteger(n) || n < lo || n > hi) {
    throw DecodeError(what + " must be a whole number from " + lo + " to " + hi);
  }
  return n;
}

// Turns {fmt, lbl, csid, b, n, f, a} into a validated format description.
function resolveFormat(opts) {
  opts = opts || {};
  var fmt = String(opts.fmt || "f3216").toLowerCase();
  if (PRESETS[fmt]) {
    var p = PRESETS[fmt];
    return { kind: "usid", id: fmt, lbl: p.lbl, csid: p.csid, name: p.name };
  }
  if (fmt === "usid") {
    var lbl = intIn(opts.lbl, 1, 120, "Locator-Block length");
    var csid = intIn(opts.csid, 1, 64, "uSID length");
    if (lbl + csid > 128) throw DecodeError("Locator-Block + uSID length cannot exceed 128 bits");
    return { kind: "usid", id: "usid", lbl: lbl, csid: csid, name: "F" + lbl + csid };
  }
  if (fmt === "classic") {
    var b = intIn(opts.b, 0, 128, "Locator Block length");
    var n = intIn(opts.n, 0, 128, "Locator Node length");
    var f = intIn(opts.f, 0, 128, "Function length");
    var a = intIn(opts.a, 0, 128, "Argument length");
    if (b + n < 1) throw DecodeError("The locator (Block + Node) needs at least 1 bit");
    if (b + n + f + a > 128) throw DecodeError("Block + Node + Function + Argument cannot exceed 128 bits");
    return { kind: "classic", id: "classic", b: b, n: n, f: f, a: a, name: "Classic SID" };
  }
  throw DecodeError("Unknown format \"" + fmt + "\"");
}

// 16-bit uSID GIB/LIB split from draft-filsfils-spring-net-pgm-extension-srv6-usid
// (first nibble 0-D global, E-F local). RFC 9800 Section 9.2 leaves it to the operator.
function csidScope(value, csidLen) {
  if (csidLen !== 16 || value === 0n) return null;
  return value >= 0xe000n ? "LIB" : "GIB";
}

function decodeUsid(value, fmt) {
  var lbl = fmt.lbl, csid = fmt.csid;
  var capacity = Math.floor((128 - lbl) / csid);
  var padBits = 128 - lbl - capacity * csid;
  var fields = [{
    key: "block", kind: "block", label: "Locator-Block", start: 0, len: lbl,
    value: getBits(value, 0, lbl)
  }];
  var slots = [];
  var eoc = -1;
  for (var i = 0; i < capacity; i++) {
    var start = lbl + i * csid;
    var v = getBits(value, start, csid);
    if (v === 0n && eoc < 0) eoc = i;
    slots.push({ index: i, start: start, len: csid, value: v });
  }
  var used = eoc < 0 ? capacity : eoc;
  var stray = slots.filter(function (s) { return eoc >= 0 && s.index > eoc && s.value !== 0n; })
    .map(function (s) { return s.index; });

  slots.forEach(function (s) {
    var kind, label;
    if (s.index === 0 && s.value !== 0n) { kind = "active"; label = "uSID 1 (active)"; }
    else if (s.index < used) { kind = s.index % 2 ? "csid-b" : "csid-a"; label = "uSID " + (s.index + 1); }
    else if (s.index === eoc) { kind = "eoc"; label = "End-of-container"; }
    else if (s.value !== 0n) { kind = "stray"; label = "Stray uSID"; }
    else { kind = "zero"; label = "Empty"; }
    fields.push({
      key: "csid" + s.index, kind: kind, label: label, start: s.start, len: s.len,
      value: s.value, slot: s.index, scope: csidScope(s.value, csid)
    });
  });
  var padValue = padBits ? getBits(value, 128 - padBits, padBits) : 0n;
  if (padBits) {
    fields.push({
      key: "pad", kind: "pad", label: "Padding", start: 128 - padBits, len: padBits, value: padValue
    });
  }

  return {
    kind: "usid",
    format: fmt,
    value: value,
    fields: fields,
    capacity: capacity,
    used: used,
    remaining: Math.max(0, used - 1),
    eocSlot: eoc,
    stray: stray,
    padBits: padBits,
    padValue: padValue,
    argumentLength: 128 - lbl - csid,
    block: getBits(value, 0, lbl),
    blockPrefix: compress(prefixOf(value, lbl)) + "/" + lbl,
    active: slots.length ? slots[0].value : 0n,
    activeSidPrefix: compress(prefixOf(value, lbl + csid)) + "/" + (lbl + csid)
  };
}

function decodeClassic(value, fmt) {
  var b = fmt.b, n = fmt.n, f = fmt.f, a = fmt.a;
  var used = b + n + f + a;
  var fields = [];
  function add(key, kind, label, start, len) {
    if (len > 0) fields.push({ key: key, kind: kind, label: label, start: start, len: len, value: getBits(value, start, len) });
  }
  add("block", "block", "Locator Block", 0, b);
  add("node", "node", "Locator Node", b, n);
  add("func", "func", "Function", b + n, f);
  add("arg", "arg", "Argument", b + n + f, a);
  add("pad", "pad", "Unused (must be 0)", used, 128 - used);
  return {
    kind: "classic",
    format: fmt,
    value: value,
    fields: fields,
    locator: compress(prefixOf(value, b + n)) + "/" + (b + n),
    sidPrefix: compress(prefixOf(value, b + n + f)) + "/" + (b + n + f),
    block: getBits(value, 0, b),
    node: getBits(value, b, n),
    func: getBits(value, b + n, f),
    arg: getBits(value, b + n + f, a),
    padBits: 128 - used,
    padValue: getBits(value, used, 128 - used)
  };
}

// NEXT-CSID processing per RFC 9800 Section 4.1.1, lines N01-N09: while the
// Argument (bits LBL+LNFL..127) is non-zero, copy it to the bits right after
// the Locator-Block and zero the last LNFL bits. Segments Left is untouched.
function shiftSteps(value, fmt) {
  var lbl = fmt.lbl, csid = fmt.csid;
  var al = 128 - lbl - csid;
  var argMask = (1n << BigInt(al)) - 1n;
  var steps = [];
  var da = value;
  for (var guard = 0; guard <= 128; guard++) {
    var active = getBits(da, lbl, csid);
    var arg = da & argMask;
    var step = { index: steps.length, da: da, active: active, argument: arg, scope: csidScope(active, csid) };
    steps.push(step);
    if (active === 0n) {
      step.action = arg === 0n ? "empty" : "invalid";
      break;
    }
    if (arg === 0n) {
      step.action = "last";
      break;
    }
    step.action = "shift";
    da = (prefixOf(da, lbl) | (arg << BigInt(csid))) & MASK128;
    step.next = da;
  }
  return steps;
}

var PREFIX_FACTS = [
  { p: "ff00::", len: 8, level: "error", text: "Multicast address (ff00::/8). A multicast address cannot be an SRv6 SID or locator." },
  { p: "fe80::", len: 10, level: "warn", text: "Link-local address (fe80::/10). SIDs must be routable inside the SR domain, so link-local addresses are not used as SIDs." },
  { p: "::ffff:0:0", len: 96, level: "warn", text: "IPv4-mapped address (::ffff:0:0/96), not an SRv6 SID." },
  { p: "5f00::", len: 16, level: "ok", srv6Block: true, text: "Inside the IANA SRv6 SID block 5f00::/16 (RFC 9602): forwardable inside the SR domain, not globally reachable. Filter it at the domain edge.", href: "/rfcs/rfc9602/" },
  { p: "2001:db8::", len: 32, level: "info", text: "Documentation prefix 2001:db8::/32 (RFC 3849). Fine for examples and labs, never on a production network." },
  { p: "3fff::", len: 20, level: "info", text: "Documentation prefix 3fff::/20 (RFC 9637). Fine for examples and labs, never on a production network." },
  { p: "fd00::", len: 8, level: "info", text: "Unique Local Address (fd00::/8, RFC 4193). A common choice for a private SRv6 locator space; not reachable from the Internet." },
  { p: "fc00::", len: 8, level: "info", text: "Unique Local range fc00::/8 (RFC 4193 leaves this L=0 half undefined; locally assigned ULAs use fd00::/8). Vendor examples often use fcbb:bb00::/32 from it." },
  { p: "2000::", len: 3, level: "info", text: "Global unicast (2000::/3): an operator GUA locator. RFC 9602 allows this; filter the locator range at the domain edge (RFC 8754 Section 5.1)." }
];
PREFIX_FACTS.forEach(function (f) { f.value = parseIPv6(f.p).value; });
var SRV6_BLOCK = PREFIX_FACTS.filter(function (f) { return f.srv6Block; })[0].value;

function addressFacts(value) {
  var facts = [];
  if (value === 0n) return [{ level: "error", text: "The unspecified address :: cannot be a SID." }];
  if (value === 1n) return [{ level: "error", text: "The loopback address ::1 cannot be a SID." }];
  for (var i = 0; i < PREFIX_FACTS.length; i++) {
    var f = PREFIX_FACTS[i];
    if (inPrefix(value, f.value, f.len)) { facts.push({ level: f.level, text: f.text, href: f.href }); break; }
  }
  if (!inPrefix(value, SRV6_BLOCK, 16)) {
    facts.push({ level: "info", text: "Not in 5f00::/16. RFC 9602 does not require it: operator GUA and ULA locators are equally valid.", href: "/rfcs/rfc9602/" });
  }
  return facts;
}

function plural(n, one, many) { return n + " " + (n === 1 ? one : (many || one + "s")); }

function formatFacts(d) {
  var facts = [];
  if (d.kind === "usid") {
    var fmt = d.format;
    facts.push({ level: "info", text: "Container capacity: " + plural(d.capacity, "uSID") + " of " + fmt.csid + " bits after a " + fmt.lbl + "-bit Locator-Block" + (d.padBits ? ", plus " + d.padBits + " padding bits" : "") + "." });
    if (fmt.lbl === 32 && fmt.csid === 16) {
      facts.push({ level: "info", text: "F3216 is the format every NEXT-CSID implementation must support (RFC 9800 Section 4.1).", href: "/rfcs/rfc9800/" });
    }
    if (d.active === 0n) {
      facts.push({ level: "error", text: "No active uSID: the bits right after the Locator-Block are 0, and CSID value 0 is reserved as the end-of-container marker (RFC 9800 Section 5)." });
    } else {
      var t = "Active uSID 0x" + hexOf(d.active, fmt.csid) + "; " + plural(d.remaining, "more uSID") + " after it in this container (" + d.used + " of " + d.capacity + " slots used).";
      facts.push({ level: "ok", text: t });
      if (d.eocSlot >= 0) {
        var s = fmt.lbl + d.eocSlot * fmt.csid;
        facts.push({ level: "info", text: "End-of-container (0000) at slot " + (d.eocSlot + 1) + ", bits " + s + "-" + (s + fmt.csid - 1) + ". After the last uSID the Argument is 0, so that node takes the next SRH segment, or is the final destination if there is none." });
      } else {
        facts.push({ level: "info", text: "Container is full (no end-of-container marker). After the last uSID the Argument is 0 and processing moves to the next SRH segment, if any." });
      }
      if (d.used === 1 && !d.stray.length) {
        facts.push({ level: "info", text: "A single uSID: this is just the SID " + d.activeSidPrefix + " with Argument 0, the way it is written in a ping or a service route." });
      }
    }
    if (d.stray.length) {
      facts.push({ level: "warn", text: "Non-zero bits after the end-of-container (slot " + d.stray.map(function (i) { return i + 1; }).join(", ") + "). A node shifts the 0000 into the active position and the DA no longer matches a uSID: malformed container." });
    }
    if (d.padBits && d.padValue !== 0n) {
      facts.push({ level: "warn", text: "The " + d.padBits + " padding bits are not zero." });
    }
    if (fmt.csid === 16 && d.active !== 0n) {
      facts.push({ level: "info", text: d.active >= 0xe000n
        ? "0x" + hexOf(d.active, 16) + " is in the usual local range (LIB, 0xE000-0xFFFF): typically uA (End.X), uDT or uDX, meaningful only on the node that owns the previous uSID."
        : "0x" + hexOf(d.active, 16) + " is in the usual global range (GIB, 0x0000-0xDFFF): typically a node's uN (End with NEXT-CSID) SID." });
    }
  } else {
    facts.push({ level: "ok", text: "Locator " + d.locator + " (routed in the IGP); SID " + d.sidPrefix + " selects function 0x" + hexOf(d.func, d.format.f) + " on that node." });
    if (d.format.a > 0) {
      facts.push({ level: "info", text: "Argument 0x" + hexOf(d.arg, d.format.a) + (d.arg === 0n ? " (zero)." : ": parameterizes the behavior, e.g. the ESI filter of End.DT2M.") });
    }
    if (d.padBits && d.padValue !== 0n) {
      facts.push({ level: "warn", text: "The " + d.padBits + " bits after the Argument are not zero. RFC 8986 Section 3.1 requires them to be zero when Locator + Function + Argument is shorter than 128 bits." });
    }
    if (d.format.f === 0) {
      facts.push({ level: "info", text: "Function length 0: the locator itself is the SID, as in RFC 9800's uN example (FL = 0)." });
    }
  }
  return facts;
}

function decode(input, opts) {
  var parsed = parseIPv6(input);
  var fmt = resolveFormat(opts);
  var d = fmt.kind === "usid" ? decodeUsid(parsed.value, fmt) : decodeClassic(parsed.value, fmt);
  d.prefixLen = parsed.prefixLen;
  d.expanded = expand(parsed.value);
  d.compressed = compress(parsed.value);
  d.facts = addressFacts(parsed.value).concat(formatFacts(d));
  if (parsed.prefixLen !== null) {
    d.facts.push({ level: "info", text: "The /" + parsed.prefixLen + " prefix length was ignored; the decoder reads all 128 bits." });
  }
  d.steps = fmt.kind === "usid" ? shiftSteps(parsed.value, fmt) : null;
  return d;
}

// IANA "SRv6 Endpoint Behaviors" registry (Segment Routing Parameters),
// retrieved 2026-10-20 from iana.org/assignments/segment-routing.
// [first, last, name, reference]; names as registered.
var IANA = [
  [0, 0, "Reserved", "RFC 8986"],
  [1, 1, "End", "RFC 8986"],
  [2, 2, "End with PSP", "RFC 8986"],
  [3, 3, "End with USP", "RFC 8986"],
  [4, 4, "End with PSP & USP", "RFC 8986"],
  [5, 5, "End.X", "RFC 8986"],
  [6, 6, "End.X with PSP", "RFC 8986"],
  [7, 7, "End.X with USP", "RFC 8986"],
  [8, 8, "End.X with PSP & USP", "RFC 8986"],
  [9, 9, "End.T", "RFC 8986"],
  [10, 10, "End.T with PSP", "RFC 8986"],
  [11, 11, "End.T with USP", "RFC 8986"],
  [12, 12, "End.T with PSP & USP", "RFC 8986"],
  [13, 13, "End.B6.Insert", "draft-filsfils-spring-srv6-net-pgm-insertion"],
  [14, 14, "End.B6.Encaps", "RFC 8986"],
  [15, 15, "End.BM", "RFC 8986"],
  [16, 16, "End.DX6", "RFC 8986"],
  [17, 17, "End.DX4", "RFC 8986"],
  [18, 18, "End.DT6", "RFC 8986"],
  [19, 19, "End.DT4", "RFC 8986"],
  [20, 20, "End.DT46", "RFC 8986"],
  [21, 21, "End.DX2", "RFC 8986"],
  [22, 22, "End.DX2V", "RFC 8986"],
  [23, 23, "End.DT2U", "RFC 8986"],
  [24, 24, "End.DT2M", "RFC 8986"],
  [25, 25, "Reserved", "RFC 8986"],
  [26, 26, "End.B6.Insert.Red", "draft-filsfils-spring-srv6-net-pgm-insertion"],
  [27, 27, "End.B6.Encaps.Red", "RFC 8986"],
  [28, 28, "End with USD", "RFC 8986"],
  [29, 29, "End with PSP & USD", "RFC 8986"],
  [30, 30, "End with USP & USD", "RFC 8986"],
  [31, 31, "End with PSP, USP & USD", "RFC 8986"],
  [32, 32, "End.X with USD", "RFC 8986"],
  [33, 33, "End.X with PSP & USD", "RFC 8986"],
  [34, 34, "End.X with USP & USD", "RFC 8986"],
  [35, 35, "End.X with PSP, USP & USD", "RFC 8986"],
  [36, 36, "End.T with USD", "RFC 8986"],
  [37, 37, "End.T with PSP & USD", "RFC 8986"],
  [38, 38, "End.T with USP & USD", "RFC 8986"],
  [39, 39, "End.T with PSP, USP & USD", "RFC 8986"],
  [40, 40, "End.MAP", "RFC 9433"],
  [41, 41, "End.Limit", "RFC 9433"],
  [42, 42, "End with NEXT-ONLY-CSID", "draft-filsfils-spring-net-pgm-extension-srv6-usid"],
  [43, 43, "End with NEXT-CSID", "RFC 9800"],
  [44, 44, "End with NEXT-CSID & PSP", "RFC 9800"],
  [45, 45, "End with NEXT-CSID & USP", "RFC 9800"],
  [46, 46, "End with NEXT-CSID, PSP & USP", "RFC 9800"],
  [47, 47, "End with NEXT-CSID & USD", "RFC 9800"],
  [48, 48, "End with NEXT-CSID, PSP & USD", "RFC 9800", "uN"],
  [49, 49, "End with NEXT-CSID, USP & USD", "RFC 9800"],
  [50, 50, "End with NEXT-CSID, PSP, USP & USD", "RFC 9800"],
  [51, 51, "End.X with NEXT-ONLY-CSID", "draft-filsfils-spring-net-pgm-extension-srv6-usid"],
  [52, 52, "End.X with NEXT-CSID", "RFC 9800"],
  [53, 53, "End.X with NEXT-CSID & PSP", "RFC 9800"],
  [54, 54, "End.X with NEXT-CSID & USP", "RFC 9800"],
  [55, 55, "End.X with NEXT-CSID, PSP & USP", "RFC 9800"],
  [56, 56, "End.X with NEXT-CSID & USD", "RFC 9800"],
  [57, 57, "End.X with NEXT-CSID, PSP & USD", "RFC 9800", "uA"],
  [58, 58, "End.X with NEXT-CSID, USP & USD", "RFC 9800"],
  [59, 59, "End.X with NEXT-CSID, PSP, USP & USD", "RFC 9800"],
  [60, 60, "uDX6 (End.DX6 with NEXT-CSID)", "draft-filsfils-spring-net-pgm-extension-srv6-usid"],
  [61, 61, "uDX4 (End.DX4 with NEXT-CSID)", "draft-filsfils-spring-net-pgm-extension-srv6-usid"],
  [62, 62, "uDT6 (End.DT6 with NEXT-CSID)", "draft-filsfils-spring-net-pgm-extension-srv6-usid"],
  [63, 63, "uDT4 (End.DT4 with NEXT-CSID)", "draft-filsfils-spring-net-pgm-extension-srv6-usid"],
  [64, 64, "uDT46 (End.DT46 with NEXT-CSID)", "draft-filsfils-spring-net-pgm-extension-srv6-usid"],
  [65, 65, "uDX2 (End.DX2 with NEXT-CSID)", "draft-filsfils-spring-net-pgm-extension-srv6-usid"],
  [66, 66, "uDX2V (End.DX2V with NEXT-CSID)", "draft-filsfils-spring-net-pgm-extension-srv6-usid"],
  [67, 67, "uDT2U (End.DT2U with NEXT-CSID)", "draft-filsfils-spring-net-pgm-extension-srv6-usid"],
  [68, 68, "uDT2M (End.DT2M with NEXT-CSID)", "draft-filsfils-spring-net-pgm-extension-srv6-usid"],
  [69, 69, "End.M.GTP6.D", "RFC 9433"],
  [70, 70, "End.M.GTP6.Di", "RFC 9433"],
  [71, 71, "End.M.GTP6.E", "RFC 9433"],
  [72, 72, "End.M.GTP4.E", "RFC 9433"],
  [73, 73, "End.DTM", "draft-agrawal-spring-srv6-mpls-interworking"],
  [74, 74, "End.M (Mirror SID)", "draft-ietf-rtgwg-srv6-egress-protection"],
  [75, 75, "End.Replicate", "RFC 9524"],
  [76, 76, "End.DTMC4", "RFC 10018"],
  [77, 77, "End.DTMC6", "RFC 10018"],
  [78, 78, "End.DTMC46", "RFC 10018"],
  [79, 79, "End.BXC", "draft-han-spring-srv6-underlay-tunnel-programming"],
  [80, 80, "End.BXC with PSP", "draft-han-spring-srv6-underlay-tunnel-programming"],
  [81, 81, "End.BXC with USP", "draft-han-spring-srv6-underlay-tunnel-programming"],
  [82, 82, "End.BXC with USD", "draft-han-spring-srv6-underlay-tunnel-programming"],
  [83, 83, "End.BXC with PSP, USP & USD", "draft-han-spring-srv6-underlay-tunnel-programming"],
  [84, 84, "End.NSH - NSH Segment", "RFC 9491"],
  [85, 85, "End.T with NEXT-CSID", "RFC 9800"],
  [86, 86, "End.T with NEXT-CSID & PSP", "RFC 9800"],
  [87, 87, "End.T with NEXT-CSID & USP", "RFC 9800"],
  [88, 88, "End.T with NEXT-CSID, PSP & USP", "RFC 9800"],
  [89, 89, "End.T with NEXT-CSID & USD", "RFC 9800"],
  [90, 90, "End.T with NEXT-CSID, PSP & USD", "RFC 9800"],
  [91, 91, "End.T with NEXT-CSID, USP & USD", "RFC 9800"],
  [92, 92, "End.T with NEXT-CSID, PSP, USP & USD", "RFC 9800"],
  [93, 93, "End.B6.Encaps with NEXT-CSID", "RFC 9800"],
  [94, 94, "End.B6.Encaps.Red with NEXT-CSID", "RFC 9800"],
  [95, 95, "End.BM with NEXT-CSID", "RFC 9800"],
  [96, 96, "End.LBS with NEXT-CSID", "RFC 9800"],
  [97, 97, "End.XLBS with NEXT-CSID", "RFC 9800"],
  [98, 98, "End.B6.Encaps.Red with NEXT-CSID, PSP & USD", "IANA (Pablo Camarillo)"],
  [99, 99, "End.B6.Insert.Red with NEXT-CSID, PSP & USD", "IANA (Pablo Camarillo)"],
  [100, 100, "End.PSID", "draft-ietf-spring-srv6-path-segment"],
  [101, 101, "End with REPLACE-CSID", "RFC 9800"],
  [102, 102, "End with REPLACE-CSID & PSP", "RFC 9800"],
  [103, 103, "End with REPLACE-CSID & USP", "RFC 9800"],
  [104, 104, "End with REPLACE-CSID, PSP & USP", "RFC 9800"],
  [105, 105, "End.X with REPLACE-CSID", "RFC 9800"],
  [106, 106, "End.X with REPLACE-CSID & PSP", "RFC 9800"],
  [107, 107, "End.X with REPLACE-CSID & USP", "RFC 9800"],
  [108, 108, "End.X with REPLACE-CSID, PSP & USP", "RFC 9800"],
  [109, 109, "End.T with REPLACE-CSID", "RFC 9800"],
  [110, 110, "End.T with REPLACE-CSID & PSP", "RFC 9800"],
  [111, 111, "End.T with REPLACE-CSID & USP", "RFC 9800"],
  [112, 112, "End.T with REPLACE-CSID, PSP & USP", "RFC 9800"],
  [113, 113, "End.M with REPLACE-CSID", "draft-ietf-rtgwg-srv6-egress-protection"],
  [114, 114, "End.B6.Encaps with REPLACE-CSID", "RFC 9800"],
  [115, 115, "End.BM with REPLACE-CSID", "RFC 9800"],
  [116, 116, "End.DX6 with REPLACE-CSID", "RFC 9800"],
  [117, 117, "End.DX4 with REPLACE-CSID", "RFC 9800"],
  [118, 118, "End.DT6 with REPLACE-CSID", "RFC 9800"],
  [119, 119, "End.DT4 with REPLACE-CSID", "RFC 9800"],
  [120, 120, "End.DT46 with REPLACE-CSID", "RFC 9800"],
  [121, 121, "End.DX2 with REPLACE-CSID", "RFC 9800"],
  [122, 122, "End.DX2V with REPLACE-CSID", "RFC 9800"],
  [123, 123, "End.DT2U with REPLACE-CSID", "RFC 9800"],
  [124, 124, "End.DT2M with REPLACE-CSID", "RFC 9800"],
  [125, 126, "Unassigned", ""],
  [127, 127, "End.B6.Encaps.Red with REPLACE-CSID", "RFC 9800"],
  [128, 128, "End with REPLACE-CSID & USD", "RFC 9800"],
  [129, 129, "End with REPLACE-CSID, PSP & USD", "RFC 9800"],
  [130, 130, "End with REPLACE-CSID, USP & USD", "RFC 9800"],
  [131, 131, "End with REPLACE-CSID, PSP, USP & USD", "RFC 9800"],
  [132, 132, "End.X with REPLACE-CSID & USD", "RFC 9800"],
  [133, 133, "End.X with REPLACE-CSID, PSP & USD", "RFC 9800"],
  [134, 134, "End.X with REPLACE-CSID, USP & USD", "RFC 9800"],
  [135, 135, "End.X with REPLACE-CSID, PSP, USP & USD", "RFC 9800"],
  [136, 136, "End.T with REPLACE-CSID & USD", "RFC 9800"],
  [137, 137, "End.T with REPLACE-CSID, PSP & USD", "RFC 9800"],
  [138, 138, "End.T with REPLACE-CSID, USP & USD", "RFC 9800"],
  [139, 139, "End.T with REPLACE-CSID, PSP, USP & USD", "RFC 9800"],
  [140, 140, "End.LBS with REPLACE-CSID", "RFC 9800"],
  [141, 141, "End.XLBS with REPLACE-CSID", "RFC 9800"],
  [142, 142, "End.DTM46", "draft-ietf-spring-srv6-mpls-interworking"],
  [143, 143, "End.DXM4", "draft-ietf-spring-srv6-mpls-interworking"],
  [144, 144, "End.DXM6", "draft-ietf-spring-srv6-mpls-interworking"],
  [145, 145, "End.DXM2", "draft-ietf-spring-srv6-mpls-interworking"],
  [146, 149, "Unassigned", ""],
  [150, 150, "End.XU", "draft-dong-spring-srv6-inter-layer-programming"],
  [151, 151, "End.XU with PSP", "draft-dong-spring-srv6-inter-layer-programming"],
  [152, 152, "End.XU with USP", "draft-dong-spring-srv6-inter-layer-programming"],
  [153, 153, "End.XU with USD", "draft-dong-spring-srv6-inter-layer-programming"],
  [154, 154, "End.XU with PSP, USP & USD", "draft-dong-spring-srv6-inter-layer-programming"],
  [155, 155, "End.XU with REPPLACE-CSID", "draft-dong-spring-srv6-inter-layer-programming"],
  [156, 156, "End.XU with REPPLACE-CSID & PSP", "draft-dong-spring-srv6-inter-layer-programming"],
  [157, 157, "End.XU with REPPLACE-CSID & PSP & USP & USD", "draft-dong-spring-srv6-inter-layer-programming"],
  [158, 158, "End.DX1", "RFC 9801"],
  [159, 159, "End.DX1 with NEXT-CSID", "RFC 9801"],
  [160, 160, "End.DX1 with REPLACE-CSID", "RFC 9801"],
  [161, 161, "End.AN - SR-aware function", "draft-ietf-spring-sr-service-programming"],
  [162, 162, "End.AS - Static proxy", "draft-ietf-spring-sr-service-programming"],
  [163, 163, "End.AD - Dynamic proxy", "draft-ietf-spring-sr-service-programming"],
  [164, 164, "End.AM - Masquerading proxy", "draft-ietf-spring-sr-service-programming"],
  [165, 165, "End.AM - Masquerading proxy with NAT", "draft-ietf-spring-sr-service-programming"],
  [166, 166, "End.AM - Masquerading proxy with Caching", "draft-ietf-spring-sr-service-programming"],
  [167, 167, "End.AM - Masquerading proxy with NAT & Caching", "draft-ietf-spring-sr-service-programming"],
  [168, 168, "End.M.GTP6.E.Red", "draft-kawakami-dmm-srv6-gtp6e-reduced"],
  [169, 169, "End.AN.CI.S", "draft-lin-spring-srv6-aware-context-indicator"],
  [170, 170, "End.AN.CI.D.A", "draft-lin-spring-srv6-aware-context-indicator"],
  [171, 171, "End.AN.CI.D.T", "draft-lin-spring-srv6-aware-context-indicator"],
  [172, 172, "End.AN.CI.D.V", "draft-lin-spring-srv6-aware-context-indicator"],
  [173, 173, "End.AN.CI.D.D", "draft-lin-spring-srv6-aware-context-indicator"],
  [174, 179, "Unassigned", ""],
  [180, 180, "End.AS with REPLACE-CSID", "draft-lh-spring-srv6-sfc-csid"],
  [181, 181, "End.AS with NEXT-CSID", "draft-lh-spring-srv6-sfc-csid"],
  [182, 182, "End.AD with REPLACE-CSID", "draft-lh-spring-srv6-sfc-csid"],
  [183, 183, "End.AD with NEXT-CSID", "draft-lh-spring-srv6-sfc-csid"],
  [184, 184, "End.AM with REPLACE-CSID", "draft-lh-spring-srv6-sfc-csid"],
  [185, 185, "End.AM with NEXT-CSID", "draft-lh-spring-srv6-sfc-csid"],
  [186, 186, "End.AMN with REPLACE-CSID", "draft-lh-spring-srv6-sfc-csid"],
  [187, 187, "End.AMN with NEXT-CSID", "draft-lh-spring-srv6-sfc-csid"],
  [188, 188, "End.B6.Insert with NEXT-CSID", "draft-chen-spring-srv6-compressed-bsid-insertion"],
  [189, 189, "End.B6.Insert.Red with NEXT-CSID", "draft-chen-spring-srv6-compressed-bsid-insertion"],
  [190, 32766, "Unassigned", ""],
  [32767, 32767, "The SID defined in RFC 8754", "RFC 8986, RFC 8754"],
  [32768, 34815, "Reserved for Private Use", "RFC 8986"],
  [34816, 65534, "Reserved", "RFC 8986"],
  [65535, 65535, "Opaque", "RFC 8986"]
];

var BEHAVIORS = IANA.map(function (r) {
  return { first: r[0], last: r[1], name: r[2], ref: r[3], alias: r[4] || "" };
});

function parseCodepoint(q) {
  var s = String(q).trim().toLowerCase();
  if (/^0x[0-9a-f]{1,4}$/.test(s)) return parseInt(s, 16);
  if (/^\d{1,5}$/.test(s) && +s <= 65535) return +s;
  return null;
}

function lookupCodepoint(n) {
  for (var i = 0; i < BEHAVIORS.length; i++) {
    if (n >= BEHAVIORS[i].first && n <= BEHAVIORS[i].last) return BEHAVIORS[i];
  }
  return null;
}

// A number (decimal or 0x hex) matches its codepoint; text matches names,
// aliases (uN, uA) and references.
function searchBehaviors(query) {
  var q = String(query == null ? "" : query).trim();
  if (!q) return BEHAVIORS.filter(function (b) { return b.first === b.last; });
  var cp = parseCodepoint(q);
  if (cp !== null) {
    var hit = lookupCodepoint(cp);
    return hit ? [hit] : [];
  }
  var words = q.toLowerCase().split(/\s+/);
  return BEHAVIORS.filter(function (b) {
    var hay = (b.name + " " + b.alias + " " + b.ref).toLowerCase();
    return words.every(function (w) { return hay.indexOf(w) >= 0; });
  });
}

// Shareable state: ?addr=...&fmt=f3216 | fmt=usid&lbl=48&csid=16 |
// fmt=classic&b=32&n=16&f=16&a=0
var DEFAULT_STATE = { addr: "", fmt: "f3216", lbl: 48, csid: 16, b: 32, n: 16, f: 16, a: 0 };

function parseQuery(search) {
  var params = new URLSearchParams(search || "");
  var st = Object.assign({}, DEFAULT_STATE);
  if (params.has("addr")) st.addr = params.get("addr").slice(0, 100);
  if (params.has("fmt")) st.fmt = params.get("fmt").toLowerCase();
  ["lbl", "csid", "b", "n", "f", "a"].forEach(function (k) {
    if (params.has(k) && /^\d{1,3}$/.test(params.get(k))) st[k] = parseInt(params.get(k), 10);
  });
  return st;
}

function buildQuery(st) {
  var params = new URLSearchParams();
  if (st.addr) params.set("addr", st.addr);
  params.set("fmt", st.fmt);
  if (st.fmt === "usid") { params.set("lbl", st.lbl); params.set("csid", st.csid); }
  if (st.fmt === "classic") { ["b", "n", "f", "a"].forEach(function (k) { params.set(k, st[k]); }); }
  return "?" + params.toString().replace(/%3A/gi, ":");
}

var Core = {
  DecodeError: DecodeError,
  parseIPv6: parseIPv6,
  expand: expand,
  compress: compress,
  getBits: getBits,
  resolveFormat: resolveFormat,
  decode: decode,
  shiftSteps: shiftSteps,
  addressFacts: addressFacts,
  behaviors: BEHAVIORS,
  lookupCodepoint: lookupCodepoint,
  searchBehaviors: searchBehaviors,
  parseQuery: parseQuery,
  buildQuery: buildQuery,
  DEFAULT_STATE: DEFAULT_STATE
};

if (typeof module === "object" && module.exports) {
  module.exports = Core;
  return;
}
root.SidDecoderCore = Core;

// ---------------------------------------------------------------------------
// UI
// ---------------------------------------------------------------------------

var RFC_PAGES = { "8754": 1, "8986": 1, "9433": 1, "9524": 1, "9602": 1, "9800": 1 };

function esc(s) {
  return String(s).replace(/[&<>"']/g, function (c) {
    return { "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" }[c];
  });
}

// Long addresses wrap at a group boundary instead of mid-hextet.
function addrHtml(a) {
  return esc(a).replace(/:/g, ":<wbr>");
}

function refLinks(ref) {
  if (!ref) return "";
  return ref.split(/,\s*/).map(function (r) {
    var m = r.match(/^RFC (\d+)$/);
    if (m) {
      var href = RFC_PAGES[m[1]] ? "/rfcs/rfc" + m[1] + "/" : "https://www.rfc-editor.org/rfc/rfc" + m[1];
      return "<a href=\"" + href + "\">" + esc(r) + "</a>";
    }
    if (/^draft-/.test(r)) {
      return "<a href=\"https://datatracker.ietf.org/doc/" + esc(r) + "/\" rel=\"noopener\">" + esc(r) + "</a>";
    }
    return esc(r);
  }).join(", ");
}

function fieldHex(f) {
  return "0x" + hexOf(f.value, f.len);
}

function fieldNote(f, d) {
  if (f.kind === "block") return d.kind === "usid" ? "Shared by every uSID in the domain (" + d.blockPrefix + ")" : "SRv6 SID block of the domain";
  if (f.kind === "node") return "Identifies the node; Block + Node = locator " + d.locator;
  if (f.kind === "func") return "Local behavior on that node (End, End.X, End.DT4...)";
  if (f.kind === "arg") return "Parameter for the behavior, if it takes one";
  if (f.kind === "active") return "Processed by the node that owns it" + (f.scope ? " (" + f.scope + ")" : "");
  if (f.kind === "csid-a" || f.kind === "csid-b") return "Shifted into the active position later" + (f.scope ? " (" + f.scope + ")" : "");
  if (f.kind === "eoc") return "CSID value 0: end of this container";
  if (f.kind === "stray") return "Non-zero after the end-of-container";
  if (f.kind === "zero") return "Unused slot";
  if (f.kind === "pad") return d.kind === "usid" ? "Too short for another uSID" : "Must be zero (RFC 8986 Section 3.1)";
  return "";
}

// Nibble-aligned fields keep the address's own ":" every 16 bits (fcbb:bb00).
function groupedHex(f) {
  var h = hexOf(f.value, f.len);
  if (f.start % 4 || f.len % 4) return h;
  var out = "";
  for (var i = 0, n = f.start / 4; i < h.length; i++, n++) {
    if (i > 0 && n % 4 === 0) out += ":";
    out += h.charAt(i);
  }
  return out;
}

function renderChips(d, fieldsOverride) {
  var fields = fieldsOverride || d.fields;
  return "<div class=\"sidd-chips\">" + fields.map(function (f) {
    return "<div class=\"sidd-chip sidd-k-" + f.kind + "\">" +
      "<span class=\"sidd-chip-val\">" + esc(groupedHex(f)) + "</span>" +
      "<span class=\"sidd-chip-lbl\">" + esc(f.label) + " <span class=\"sidd-chip-bits\">" + f.len + "b</span></span>" +
      "</div>";
  }).join("") + "</div>";
}

function renderBits(d) {
  var kindAt = new Array(128);
  var startAt = {};
  d.fields.forEach(function (f) {
    for (var i = f.start; i < f.start + f.len; i++) kindAt[i] = f.kind;
    startAt[f.start] = true;
  });
  var words = hextets(d.value);
  var rows = "";
  for (var r = 0; r < 8; r++) {
    var cells = "";
    for (var c = 0; c < 16; c++) {
      var bit = r * 16 + c;
      var on = getBits(d.value, bit, 1) === 1n;
      cells += "<span class=\"sidd-bit sidd-k-" + kindAt[bit] + (on ? " sidd-on" : "") +
        (startAt[bit] && bit > 0 ? " sidd-edge" : "") + "\" title=\"bit " + bit + "\">" + (on ? 1 : 0) + "</span>";
    }
    rows += "<div class=\"sidd-bitrow\"><span class=\"sidd-bitlbl\">" + words[r].toString(16).padStart(4, "0") +
      "<small>" + (r * 16) + "</small></span><span class=\"sidd-bitcells\">" + cells + "</span></div>";
  }
  return "<div class=\"sidd-bits\" role=\"img\" aria-label=\"128-bit binary view of the address, colored by field\">" + rows + "</div>";
}

function renderTable(d) {
  var rows = d.fields.map(function (f) {
    return "<tr><td><span class=\"sidd-swatch sidd-k-" + f.kind + "\"></span>" + esc(f.label) + "</td>" +
      "<td>" + f.start + "&ndash;" + (f.start + f.len - 1) + "</td><td>" + f.len + "</td>" +
      "<td><code>" + esc(fieldHex(f)) + "</code></td><td>" + esc(fieldNote(f, d)) + "</td></tr>";
  }).join("");
  return "<div class=\"md-typeset__scrollwrap\"><div class=\"md-typeset__table\"><table>" +
    "<thead><tr><th>Field</th><th>Bits</th><th>Length</th><th>Value</th><th>Meaning</th></tr></thead>" +
    "<tbody>" + rows + "</tbody></table></div></div>";
}

var FACT_ICON = { ok: "✓", info: "i", warn: "!", error: "×" };

function renderFacts(facts) {
  return "<ul class=\"sidd-facts\">" + facts.map(function (f) {
    var link = f.href ? " <a href=\"" + esc(f.href) + "\">Read more</a>" : "";
    return "<li class=\"sidd-fact sidd-fact-" + f.level + "\"><span class=\"sidd-fact-icon\" aria-hidden=\"true\">" +
      FACT_ICON[f.level] + "</span><span><span class=\"sidd-sr\">" + f.level + ": </span>" + esc(f.text) + link + "</span></li>";
  }).join("") + "</ul>";
}

function stepFields(da, fmt) {
  var sub = decodeUsid(da, fmt);
  return sub.fields;
}

function stepText(step, fmt, i) {
  var a = "0x" + hexOf(step.active, fmt.csid);
  if (step.action === "shift") {
    return "Node owning uSID " + a + " sees a non-zero Argument, so it shifts the Argument " + fmt.csid +
      " bits left into the position after the Locator-Block, zeroes the last " + fmt.csid +
      " bits and forwards on the new DA. Segments Left is not changed.";
  }
  if (step.action === "last") {
    return "uSID " + a + " is the last one in this container (Argument = 0). Its node runs the plain behavior: with an SRH and Segments Left > 0 it copies the next segment into the DA; otherwise it is the final destination (for example uDT4/uDT6 decapsulates).";
  }
  if (step.action === "invalid") {
    return "The active uSID is 0000 but bits follow it. No node owns this DA, so the packet is dropped or follows the block route: the container is malformed.";
  }
  return i === 0 ? "No active uSID: the address is just the Locator-Block." : "";
}

function renderStepper(d, st) {
  var steps = d.steps, fmt = d.format;
  var i = Math.min(st.step, steps.length - 1);
  var s = steps[i];
  var list = steps.map(function (x, j) {
    return "<li><button type=\"button\" class=\"sidd-steplink" + (j === i ? " sidd-current" : "") + "\" data-step=\"" + j + "\"" +
      (j === i ? " aria-current=\"step\"" : "") + "><code>" + addrHtml(compress(x.da)) + "</code></button></li>";
  }).join("");
  return "<div class=\"sidd-stepper\">" +
    "<div class=\"sidd-stepnav\">" +
      "<button type=\"button\" class=\"md-button sidd-prev\"" + (i === 0 ? " disabled" : "") + ">&larr; Previous</button>" +
      "<span class=\"sidd-stepcount\">Step " + (i + 1) + " of " + steps.length + "</span>" +
      "<button type=\"button\" class=\"md-button sidd-next\"" + (i === steps.length - 1 ? " disabled" : "") + ">Next &rarr;</button>" +
    "</div>" +
    "<p class=\"sidd-da\"><span>DA</span> <code>" + addrHtml(compress(s.da)) + "</code></p>" +
    renderChips(null, stepFields(s.da, fmt)) +
    "<p class=\"sidd-steptext\">" + esc(stepText(s, fmt, i)) + "</p>" +
    (s.action === "shift" ? "<p class=\"sidd-da\"><span>New DA</span> <code>" + addrHtml(compress(s.next)) + "</code></p>" : "") +
    "<ol class=\"sidd-steplist\">" + list + "</ol>" +
  "</div>";
}

function DecoderUI(rootEl) {
  this.el = rootEl;
  this.q = function (sel) { return rootEl.querySelector(sel); };
  this.state = Object.assign(parseQuery(location.search), { step: 0 });
}

DecoderUI.prototype.readForm = function () {
  var q = this.q.bind(this);
  var st = this.state;
  st.addr = q("#sidd-addr").value.trim();
  st.fmt = q("#sidd-fmt").value;
  ["lbl", "csid", "b", "n", "f", "a"].forEach(function (k) {
    var v = q("#sidd-" + k).value;
    st[k] = /^\d{1,3}$/.test(v) ? parseInt(v, 10) : v;
  });
};

DecoderUI.prototype.writeForm = function () {
  var q = this.q.bind(this);
  var st = this.state;
  q("#sidd-addr").value = st.addr;
  q("#sidd-fmt").value = PRESETS[st.fmt] || st.fmt === "usid" || st.fmt === "classic" ? st.fmt : "f3216";
  ["lbl", "csid", "b", "n", "f", "a"].forEach(function (k) { q("#sidd-" + k).value = st[k]; });
};

DecoderUI.prototype.syncOptions = function () {
  var fmt = this.q("#sidd-fmt").value;
  this.q("#sidd-usid-opts").hidden = fmt !== "usid";
  this.q("#sidd-classic-opts").hidden = fmt !== "classic";
};

DecoderUI.prototype.updateUrl = function () {
  if (!this.state.addr) return;
  var url = location.pathname + buildQuery(this.state) + location.hash;
  try { history.replaceState(history.state, "", url); } catch (e) { /* file:// or sandboxed */ }
};

DecoderUI.prototype.render = function () {
  var out = this.q("#sidd-out");
  var st = this.state;
  if (!st.addr) {
    out.innerHTML = "<p class=\"sidd-hint\">Paste a SID above or pick an example.</p>";
    return;
  }
  var d;
  try {
    d = decode(st.addr, st);
  } catch (e) {
    if (e.name !== "DecodeError") throw e;
    out.innerHTML = "<p class=\"sidd-error\" role=\"alert\"><strong>Cannot decode:</strong> " + esc(e.message) + "</p>";
    return;
  }
  var fmt = d.format;
  var fmtLine = fmt.kind === "usid"
    ? fmt.name + ": " + fmt.lbl + "-bit Locator-Block, " + fmt.csid + "-bit uSIDs"
    : "Classic SID: B " + fmt.b + " + N " + fmt.n + " + F " + fmt.f + " + A " + fmt.a + " bits";
  var html =
    "<div class=\"sidd-summary\">" +
      "<p><span>Compressed</span> <code>" + addrHtml(d.compressed) + "</code></p>" +
      "<p><span>Expanded</span> <code>" + addrHtml(d.expanded) + "</code></p>" +
      "<p><span>Format</span> " + esc(fmtLine) + "</p>" +
      "<p class=\"sidd-share\"><button type=\"button\" class=\"md-button sidd-copy\">Copy link to this decode</button> <span class=\"sidd-copied\" aria-live=\"polite\"></span></p>" +
    "</div>" +
    "<h3 id=\"sidd-fields-h\">Field breakdown</h3>" +
    renderChips(d) + renderBits(d) + renderTable(d) +
    "<h3>What this address tells you</h3>" + renderFacts(d.facts);
  if (d.steps) {
    html += "<h3>Shift-and-forward walk (RFC 9800 NEXT-CSID)</h3>" + renderStepper(d, st);
  }
  out.innerHTML = html;
};

DecoderUI.prototype.run = function (pushUrl) {
  this.readForm();
  this.syncOptions();
  this.render();
  if (pushUrl) this.updateUrl();
};

DecoderUI.prototype.bind = function () {
  var self = this;
  var form = this.q("#sidd-form");
  var timer = null;
  form.addEventListener("submit", function (e) { e.preventDefault(); self.state.step = 0; self.run(true); });
  form.addEventListener("input", function () {
    clearTimeout(timer);
    timer = setTimeout(function () { self.state.step = 0; self.run(true); }, 150);
  });
  form.addEventListener("change", function () { self.state.step = 0; self.run(true); });

  this.el.addEventListener("click", function (e) {
    var t = e.target.closest("button");
    if (!t || !self.el.contains(t)) return;
    if (t.dataset.example) {
      var ex = JSON.parse(t.dataset.example);
      Object.assign(self.state, DEFAULT_STATE, ex, { step: 0 });
      self.writeForm();
      self.run(true);
    } else if (t.classList.contains("sidd-next") || t.classList.contains("sidd-prev") || t.dataset.step) {
      var n = t.dataset.step ? +t.dataset.step : self.state.step + (t.classList.contains("sidd-next") ? 1 : -1);
      self.state.step = Math.max(0, n);
      self.render();
      var again = self.q(t.dataset.step ? ".sidd-current" : (t.classList.contains("sidd-next") ? ".sidd-next" : ".sidd-prev"));
      if (again && !again.disabled) again.focus();
      else { var cur = self.q(".sidd-current"); if (cur) cur.focus(); }
    } else if (t.classList.contains("sidd-copy")) {
      self.updateUrl();
      var note = self.q(".sidd-copied");
      var url = location.origin + location.pathname + buildQuery(self.state);
      var done = function () { if (note) note.textContent = "Link copied"; };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(url).then(done, function () { if (note) note.textContent = url; });
      } else if (note) {
        note.textContent = url;
      }
    }
  });
};

function initBehaviors(el) {
  var input = el.querySelector("#sidd-beh-q");
  var out = el.querySelector("#sidd-beh-out");
  if (!input || !out) return;
  function show() {
    var hits = searchBehaviors(input.value);
    var q = input.value.trim();
    if (!hits.length) {
      out.innerHTML = "<p class=\"sidd-hint\">No behavior matches \"" + esc(q) + "\".</p>";
      return;
    }
    var shown = hits.slice(0, 60);
    out.innerHTML = "<p class=\"sidd-hint\">" + (q ? plural(hits.length, "match", "matches") : "All " + hits.length + " assigned codepoints") +
      (hits.length > shown.length ? ", showing the first " + shown.length : "") + ".</p>" +
      "<div class=\"md-typeset__scrollwrap\"><div class=\"md-typeset__table\"><table><thead><tr><th>Codepoint</th><th>Behavior and definition</th></tr></thead><tbody>" +
      shown.map(function (b) {
        var range = b.first === b.last ? String(b.first) : b.first + "&ndash;" + b.last;
        var hex = "0x" + b.first.toString(16).toUpperCase().padStart(4, "0") + (b.first === b.last ? "" : "&ndash;0x" + b.last.toString(16).toUpperCase().padStart(4, "0"));
        return "<tr><td>" + range + "<br><code>" + hex + "</code></td><td>" + esc(b.name) +
          (b.alias ? " <strong>(" + esc(b.alias) + ")</strong>" : "") +
          (b.ref ? "<br><small class=\"sidd-ref\">" + refLinks(b.ref) + "</small>" : "") + "</td></tr>";
      }).join("") + "</tbody></table></div></div>";
  }
  input.addEventListener("input", show);
  el.addEventListener("click", function (e) {
    var t = e.target.closest("button[data-beh]");
    if (!t) return;
    input.value = t.dataset.beh;
    show();
  });
  show();
}

function init() {
  var el = document.getElementById("sid-decoder");
  if (el && !el.dataset.init) {
    el.dataset.init = "1";
    var ui = new DecoderUI(el);
    ui.writeForm();
    ui.bind();
    ui.run(false);
  }
  var beh = document.getElementById("sidd-behaviors");
  if (beh && !beh.dataset.init) {
    beh.dataset.init = "1";
    initBehaviors(beh);
  }
}

// Instant navigation re-runs this script when the page is swapped in; a full
// load runs it before or after DOMContentLoaded. The data-init guard makes a
// second call (from either path or from document$) a no-op.
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
if (typeof root.document$ !== "undefined" && !root.__siddSubscribed) {
  root.__siddSubscribed = true;
  root.document$.subscribe(function () { init(); });
}
})(typeof window !== "undefined" ? window : globalThis);
