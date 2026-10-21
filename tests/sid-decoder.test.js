// Unit tests for the SID decoder core (docs/assets/javascripts/sid-decoder.js).
// Run: node --test tests/sid-decoder.test.js

const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");

const C = require(path.join(__dirname, "..", "docs", "assets", "javascripts", "sid-decoder.js"));

const hex = (v) => v.toString(16);
const parse = (s) => C.parseIPv6(s).value;

test("parses :: in every position", () => {
  assert.equal(parse("::"), 0n);
  assert.equal(parse("::1"), 1n);
  assert.equal(C.expand(parse("1::")), "0001:0000:0000:0000:0000:0000:0000:0000");
  assert.equal(C.expand(parse("fcbb:bb00:100::")), "fcbb:bb00:0100:0000:0000:0000:0000:0000");
  assert.equal(C.expand(parse("2001:db8::1:0:0:1")), "2001:0db8:0000:0000:0001:0000:0000:0001");
  assert.equal(C.expand(parse("1:2:3:4:5:6:7::")), "0001:0002:0003:0004:0005:0006:0007:0000");
  assert.equal(C.expand(parse("::2:3:4:5:6:7:8")), "0000:0002:0003:0004:0005:0006:0007:0008");
  assert.equal(C.expand(parse("1:2:3:4:5:6:7:8")), "0001:0002:0003:0004:0005:0006:0007:0008");
});

test("accepts upper case, leading zeros, brackets, prefix length, zone and dotted IPv4", () => {
  assert.equal(parse("FCBB:BB00:0100:0200::"), parse("fcbb:bb00:100:200::"));
  assert.equal(parse("[5f00::1]"), parse("5f00::1"));
  const p = C.parseIPv6("  fcbb:bb00:1::/48 ");
  assert.equal(p.prefixLen, 48);
  assert.equal(p.value, parse("fcbb:bb00:1::"));
  assert.equal(parse("fe80::1%eth0"), parse("fe80::1"));
  assert.equal(C.expand(parse("::ffff:192.0.2.1")), "0000:0000:0000:0000:0000:ffff:c000:0201");
  assert.equal(C.expand(parse("1:2:3:4:5:6:1.2.3.4")), "0001:0002:0003:0004:0005:0006:0102:0304");
});

test("rejects invalid input", () => {
  const bad = [
    "", "   ", "1:2:3", "1:2:3:4:5:6:7:8:9", "1::2::3", ":::", ":1::", "1::2:", "1:2:3:4:5:6:7:8::",
    "12345::", "g::1", "fcbb:bb00:100:200:300:e004:0:0:0", "1.2.3.4::", "::1.2.3", "::256.1.1.1",
    "1.2.3.4", "::/129", "::/x", "[::1", "fcbb bb00::", "::1.2.3.4:5"
  ];
  for (const s of bad) {
    assert.throws(() => C.parseIPv6(s), { name: "DecodeError" }, JSON.stringify(s));
  }
});

test("compresses to RFC 5952 canonical form", () => {
  assert.equal(C.compress(parse("fcbb:bb00:0100:0200:0300:e004:0000:0000")), "fcbb:bb00:100:200:300:e004::");
  assert.equal(C.compress(parse("2001:db8:0:0:1:0:0:1")), "2001:db8::1:0:0:1");
  assert.equal(C.compress(parse("2001:db8:0:1:1:1:1:1")), "2001:db8:0:1:1:1:1:1");
  assert.equal(C.compress(parse("0:0:1:0:0:0:1:0")), "0:0:1::1:0");
  assert.equal(C.compress(0n), "::");
  assert.equal(C.compress(1n), "::1");
});

test("F3216 container: fields, end-of-container and remaining uSIDs", () => {
  const d = C.decode("fcbb:bb00:100:200:300:e004::", { fmt: "f3216" });
  assert.equal(d.capacity, 6);
  assert.equal(d.padBits, 0);
  assert.equal(hex(d.block), "fcbbbb00");
  assert.equal(d.blockPrefix, "fcbb:bb00::/32");
  assert.equal(hex(d.active), "100");
  assert.equal(d.used, 4);
  assert.equal(d.remaining, 3);
  assert.equal(d.eocSlot, 4);
  assert.deepEqual(d.stray, []);
  assert.deepEqual(d.fields.map((f) => f.kind), ["block", "active", "csid-b", "csid-a", "csid-b", "eoc", "zero"]);
  assert.equal(d.fields[4].scope, "LIB");
  assert.equal(d.fields[1].scope, "GIB");
});

test("NEXT-CSID shift walk follows RFC 9800 N05/N06", () => {
  const d = C.decode("fcbb:bb00:100:200:300:e004::", { fmt: "f3216" });
  const das = d.steps.map((s) => C.compress(s.da));
  assert.deepEqual(das, [
    "fcbb:bb00:100:200:300:e004::",
    "fcbb:bb00:200:300:e004::",
    "fcbb:bb00:300:e004::",
    "fcbb:bb00:e004::"
  ]);
  assert.deepEqual(d.steps.map((s) => s.action), ["shift", "shift", "shift", "last"]);
});

test("full F3216 container has no end-of-container marker", () => {
  const d = C.decode("fcbb:bbbb:1:2:3:4:5:6", { fmt: "f3216" });
  assert.equal(d.used, 6);
  assert.equal(d.eocSlot, -1);
  assert.equal(d.steps.length, 6);
  assert.equal(C.compress(d.steps[5].da), "fcbb:bbbb:6::");
  assert.equal(d.steps[5].action, "last");
});

test("RFC 9800 Figure 2 style container with a 48-bit block", () => {
  const d = C.decode("2001:db8:b1:10:20:30:40:50", { fmt: "usid", lbl: 48, csid: 16 });
  assert.equal(d.capacity, 5);
  assert.equal(d.used, 5);
  assert.equal(d.blockPrefix, "2001:db8:b1::/48");
  assert.equal(d.steps.length, 5);
  assert.equal(C.compress(d.steps[4].da), "2001:db8:b1:50::");
  // F4816 preset is the same thing
  assert.equal(C.decode("2001:db8:b1:10::", { fmt: "f4816" }).used, 1);
});

test("F1616 holds seven uSIDs", () => {
  const d = C.decode("fc00:1:2:3:4:5:6:7", { fmt: "f1616" });
  assert.equal(d.capacity, 7);
  assert.equal(d.used, 7);
  assert.equal(hex(d.block), "fc00");
});

test("non-16-bit uSID lengths, padding and argument length", () => {
  const d = C.decode("2001:db8:1:2:3:4:5:6", { fmt: "usid", lbl: 48, csid: 32 });
  assert.equal(d.capacity, 2);
  assert.equal(d.padBits, 16);
  assert.equal(hex(d.padValue), "6");
  assert.ok(d.facts.some((f) => f.level === "warn" && /padding/.test(f.text)));
  assert.equal(d.argumentLength, 48);
  assert.equal(d.fields[1].scope, null); // GIB/LIB hint only for 16-bit uSIDs
  const steps = C.shiftSteps(parse("2001:db8:1:2:3:4:5:6"), C.resolveFormat({ fmt: "usid", lbl: 48, csid: 32 }));
  // The padding is part of the Argument, so non-zero padding shifts in too
  assert.equal(C.expand(steps[1].da), "2001:0db8:0001:0004:0005:0006:0000:0000");
  assert.equal(C.expand(steps[2].da), "2001:0db8:0001:0006:0000:0000:0000:0000");
  assert.equal(steps.length, 3);
  // Unaligned lengths: 40-bit block, 20-bit uSIDs
  const u = C.decode("fc00:0000:0012:3450:0000::", { fmt: "usid", lbl: 40, csid: 20 });
  assert.equal(u.capacity, 4);
  assert.equal(hex(u.active), "12345");
  assert.equal(u.used, 1);
});

test("block plus one uSID fills the address: argument length 0", () => {
  const d = C.decode("5f00::1", { fmt: "usid", lbl: 112, csid: 16 });
  assert.equal(d.capacity, 1);
  assert.equal(d.steps.length, 1);
  assert.equal(d.steps[0].action, "last");
});

test("stray uSID after end-of-container is flagged and the walk stops", () => {
  const d = C.decode("fcbb:bb00:100:0:300::", { fmt: "f3216" });
  assert.equal(d.eocSlot, 1);
  assert.deepEqual(d.stray, [2]);
  assert.ok(d.facts.some((f) => f.level === "warn" && /malformed/.test(f.text)));
  assert.deepEqual(d.steps.map((s) => s.action), ["shift", "invalid"]);
  assert.ok(!d.facts.some((f) => /A single uSID/.test(f.text)));
  assert.ok(C.decode("fcbb:bb00:100::", { fmt: "f3216" }).facts.some((f) => /A single uSID/.test(f.text)));
});

test("block only: no active uSID", () => {
  const d = C.decode("fcbb:bb00::", { fmt: "f3216" });
  assert.equal(d.used, 0);
  assert.equal(d.steps[0].action, "empty");
  assert.ok(d.facts.some((f) => f.level === "error" && /No active uSID/.test(f.text)));
});

test("classic SID with configurable lengths", () => {
  const d = C.decode("fc00:0:2:e004::", { fmt: "classic", b: 32, n: 16, f: 16, a: 0 });
  assert.equal(d.locator, "fc00:0:2::/48");
  assert.equal(d.sidPrefix, "fc00:0:2:e004::/64");
  assert.equal(hex(d.node), "2");
  assert.equal(hex(d.func), "e004");
  assert.equal(d.padBits, 64);
  assert.equal(d.steps, null);
  assert.deepEqual(d.fields.map((f) => f.kind), ["block", "node", "func", "pad"]);

  const withArg = C.decode("2001:db8:0:a:e010:5::", { fmt: "classic", b: 48, n: 16, f: 16, a: 16 });
  assert.equal(hex(withArg.func), "e010");
  assert.equal(hex(withArg.arg), "5");

  const dirty = C.decode("fc00:0:2:e004::1", { fmt: "classic", b: 32, n: 16, f: 16, a: 0 });
  assert.ok(dirty.facts.some((f) => f.level === "warn" && /RFC 8986/.test(f.text)));

  const odd = C.decode("5f00:0:1:8000::", { fmt: "classic", b: 33, n: 15, f: 1, a: 0 });
  assert.equal(hex(odd.func), "1");
});

test("rejects impossible formats", () => {
  assert.throws(() => C.resolveFormat({ fmt: "classic", b: 64, n: 32, f: 32, a: 8 }), /cannot exceed 128/);
  assert.throws(() => C.resolveFormat({ fmt: "classic", b: 0, n: 0, f: 16, a: 0 }), /at least 1 bit/);
  assert.throws(() => C.resolveFormat({ fmt: "usid", lbl: 120, csid: 16 }), /cannot exceed 128/);
  assert.throws(() => C.resolveFormat({ fmt: "usid", lbl: "x", csid: 16 }), /whole number/);
  assert.throws(() => C.resolveFormat({ fmt: "f9999" }), /Unknown format/);
});

test("address facts: RFC 9602 block, ULA, documentation, multicast", () => {
  const levels = (s) => C.addressFacts(parse(s));
  assert.ok(levels("5f00:0:1::").some((f) => f.level === "ok" && /5f00::\/16/.test(f.text)));
  assert.ok(levels("fcbb:bb00::").some((f) => /fc00::\/8/.test(f.text)));
  assert.ok(levels("fd12:3456::").some((f) => /fd00::\/8/.test(f.text)));
  assert.ok(levels("2001:db8::").some((f) => /RFC 3849/.test(f.text)));
  assert.ok(levels("3fff:1::").some((f) => /RFC 9637/.test(f.text)));
  assert.ok(levels("ff02::1").some((f) => f.level === "error"));
  assert.ok(levels("2a00:1::").some((f) => /GUA/.test(f.text)));
  assert.ok(levels("2a00:1::").some((f) => /Not in 5f00::\/16/.test(f.text)));
  assert.equal(levels("::")[0].level, "error");
});

test("IANA behavior lookup matches the registry", () => {
  const name = (n) => C.lookupCodepoint(n).name;
  assert.equal(name(1), "End");
  assert.equal(name(5), "End.X");
  assert.equal(name(19), "End.DT4");
  assert.equal(name(27), "End.B6.Encaps.Red");
  assert.equal(name(48), "End with NEXT-CSID, PSP & USD");
  assert.equal(name(57), "End.X with NEXT-CSID, PSP & USD");
  assert.equal(name(63), "uDT4 (End.DT4 with NEXT-CSID)");
  assert.equal(name(101), "End with REPLACE-CSID");
  assert.equal(name(126), "Unassigned");
  assert.equal(name(33000), "Reserved for Private Use");
  assert.equal(name(65535), "Opaque");
  assert.equal(C.searchBehaviors("0x30")[0].alias, "uN");
  assert.equal(C.searchBehaviors("uA")[0].first, 57);
  assert.deepEqual(C.searchBehaviors("end.dt46").map((b) => b.first), [20, 64, 120]);
  assert.deepEqual(C.searchBehaviors("99999"), []);
  // No gaps or overlaps from 0 to 65535
  let next = 0;
  for (const b of C.behaviors) {
    assert.equal(b.first, next, "gap before " + b.first);
    next = b.last + 1;
  }
  assert.equal(next, 65536);
});

test("URL state round-trips", () => {
  const st = C.parseQuery("?addr=fcbb:bb00:100::&fmt=usid&lbl=40&csid=20");
  assert.equal(st.addr, "fcbb:bb00:100::");
  assert.equal(st.lbl, 40);
  assert.equal(st.csid, 20);
  assert.equal(C.buildQuery(st), "?addr=fcbb:bb00:100::&fmt=usid&lbl=40&csid=20");
  const cl = C.parseQuery(C.buildQuery({ addr: "fc00:0:2:e004::", fmt: "classic", b: 32, n: 16, f: 16, a: 0 }));
  assert.equal(cl.fmt, "classic");
  assert.equal(cl.b, 32);
  assert.equal(C.parseQuery("").fmt, "f3216");
  assert.equal(C.parseQuery("?lbl=abc").lbl, C.DEFAULT_STATE.lbl);
});
