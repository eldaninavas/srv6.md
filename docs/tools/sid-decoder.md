---
title: SID Decoder
seo_title: "SRv6 SID Decoder and uSID Calculator (F3216, RFC 9800)"
description: "Free SRv6 SID decoder and uSID calculator. Paste a SID to see its locator, function and argument bits, F3216 uSIDs and the RFC 9800 shift walk."
web_application: true
tags:
  - tools
  - sid
  - usid
  - SRv6 SID decoder
  - uSID calculator
  - SRv6 SID format
  - F3216
---

<style>
.sidd { --sidd-radius: 6px; margin: 1rem 0 1.5rem; }
.sidd-form { display: grid; gap: 0.75rem; padding: 1rem; border: 1px solid var(--md-default-fg-color--lightest); border-radius: 10px; background: var(--md-code-bg-color); }
.sidd-row { display: grid; gap: 0.25rem; }
.sidd-form label, .sidd-lens legend { font-size: 0.72rem; font-weight: 600; color: var(--md-default-fg-color--light); }
.sidd-form input, .sidd-form select { font: inherit; font-size: 0.8rem; color: var(--md-default-fg-color); background: var(--md-default-bg-color); border: 1px solid var(--md-default-fg-color--lighter); border-radius: var(--sidd-radius); padding: 0.45rem 0.6rem; min-width: 0; }
.sidd-form #sidd-addr { font-family: var(--md-code-font-family); font-size: 0.85rem; }
.sidd-form input:focus, .sidd-form select:focus { outline: 2px solid var(--md-accent-fg-color); outline-offset: 1px; }
.sidd-lens { display: flex; flex-wrap: wrap; gap: 0.6rem; border: 0; margin: 0; padding: 0; }
.sidd-lens[hidden] { display: none; }
.sidd-lens legend { padding: 0; margin-bottom: 0.25rem; }
.sidd-lens label { display: grid; gap: 0.2rem; font-weight: 500; }
.sidd-lens input { width: 5.2rem; }
.sidd-examples { display: flex; flex-wrap: wrap; align-items: center; gap: 0.4rem; font-size: 0.72rem; color: var(--md-default-fg-color--light); }
.sidd-examples button, .sidd-chipbtn { font: inherit; font-size: 0.7rem; cursor: pointer; color: var(--md-typeset-a-color); background: transparent; border: 1px solid var(--md-typeset-a-color); border-radius: 999px; padding: 0.15rem 0.6rem; }
.sidd-examples button:hover, .sidd-chipbtn:hover { background: var(--md-accent-fg-color--transparent); }
.sidd-hint { color: var(--md-default-fg-color--light); font-size: 0.75rem; }
.sidd-error { border-left: 4px solid #c62828; padding: 0.5rem 0.75rem; background: rgba(198, 40, 40, 0.08); border-radius: var(--sidd-radius); }
.sidd-summary p { margin: 0.2rem 0; display: flex; flex-wrap: wrap; gap: 0.5rem; align-items: baseline; }
.sidd-summary p > span:first-child, .sidd-da > span { display: inline-block; min-width: 6.5rem; font-size: 0.7rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em; color: var(--md-default-fg-color--light); }
.sidd code { overflow-wrap: anywhere; }
.sidd-share { margin-top: 0.6rem !important; }
.sidd .md-button { font-size: 0.7rem; padding: 0.3em 0.9em; margin: 0; }
.sidd .md-button[disabled] { opacity: 0.4; pointer-events: none; }
.sidd-copied { font-size: 0.72rem; color: var(--md-default-fg-color--light); word-break: break-all; }
/* Field colors: --c accent, --t tint. Light scheme first, slate below. */
.sidd-k-block { --c: #6a1b9a; --t: rgba(106, 27, 154, 0.12); }
.sidd-k-node { --c: #1565c0; --t: rgba(21, 101, 192, 0.12); }
.sidd-k-func { --c: #bf360c; --t: rgba(230, 81, 0, 0.13); }
.sidd-k-arg { --c: #2e7d32; --t: rgba(46, 125, 50, 0.13); }
.sidd-k-active { --c: #8a4b00; --t: rgba(255, 179, 0, 0.32); }
.sidd-k-csid-a { --c: #00695c; --t: rgba(0, 105, 92, 0.12); }
.sidd-k-csid-b { --c: #01579b; --t: rgba(2, 119, 189, 0.12); }
.sidd-k-eoc { --c: #455a64; --t: rgba(84, 110, 122, 0.16); }
.sidd-k-zero { --c: #78909c; --t: transparent; }
.sidd-k-stray { --c: #b71c1c; --t: rgba(198, 40, 40, 0.16); }
.sidd-k-pad { --c: #616161; --t: repeating-linear-gradient(135deg, rgba(97, 97, 97, 0.12) 0 3px, transparent 3px 6px); }
[data-md-color-scheme="slate"] .sidd-k-block { --c: #ce93d8; --t: rgba(206, 147, 216, 0.18); }
[data-md-color-scheme="slate"] .sidd-k-node { --c: #90caf9; --t: rgba(144, 202, 249, 0.16); }
[data-md-color-scheme="slate"] .sidd-k-func { --c: #ffab91; --t: rgba(255, 171, 145, 0.16); }
[data-md-color-scheme="slate"] .sidd-k-arg { --c: #a5d6a7; --t: rgba(165, 214, 167, 0.16); }
[data-md-color-scheme="slate"] .sidd-k-active { --c: #ffd54f; --t: rgba(255, 213, 79, 0.24); }
[data-md-color-scheme="slate"] .sidd-k-csid-a { --c: #80cbc4; --t: rgba(128, 203, 196, 0.16); }
[data-md-color-scheme="slate"] .sidd-k-csid-b { --c: #81d4fa; --t: rgba(129, 212, 250, 0.16); }
[data-md-color-scheme="slate"] .sidd-k-eoc { --c: #b0bec5; --t: rgba(176, 190, 197, 0.16); }
[data-md-color-scheme="slate"] .sidd-k-zero { --c: #78909c; --t: transparent; }
[data-md-color-scheme="slate"] .sidd-k-stray { --c: #ef9a9a; --t: rgba(239, 154, 154, 0.2); }
[data-md-color-scheme="slate"] .sidd-k-pad { --c: #9e9e9e; --t: repeating-linear-gradient(135deg, rgba(158, 158, 158, 0.16) 0 3px, transparent 3px 6px); }
.sidd-chips { display: flex; flex-wrap: wrap; gap: 0.35rem; margin: 0.6rem 0; }
.sidd-chip { display: grid; padding: 0.3rem 0.55rem; border-radius: var(--sidd-radius); border: 1px solid var(--c); border-left-width: 4px; background: var(--t); }
.sidd-k-zero.sidd-chip, .sidd-k-eoc.sidd-chip { border-style: dashed; border-left-style: solid; }
.sidd-chip-val { font-family: var(--md-code-font-family); font-size: 0.82rem; font-weight: 600; color: var(--md-default-fg-color); }
.sidd-chip-lbl { font-size: 0.62rem; color: var(--md-default-fg-color--light); }
.sidd-chip-bits { opacity: 0.8; }
.sidd-bits { font-family: var(--md-code-font-family); font-size: 0.62rem; display: grid; gap: 2px; margin: 0.8rem 0; max-width: 34rem; }
.sidd-bitrow { display: grid; grid-template-columns: 3.4rem 1fr; align-items: center; gap: 0.4rem; }
.sidd-bitlbl { display: flex; justify-content: space-between; gap: 0.2rem; font-weight: 600; color: var(--md-default-fg-color); }
.sidd-bitlbl small { font-weight: 400; color: var(--md-default-fg-color--light); }
.sidd-bitcells { display: grid; grid-template-columns: repeat(16, 1fr); gap: 1px; }
.sidd-bit { text-align: center; line-height: 1.5; background: var(--t); color: var(--md-default-fg-color--light); border-radius: 2px; }
.sidd-bit:nth-child(4n):not(:last-child) { margin-right: 3px; }
.sidd-bit.sidd-on { color: var(--c); font-weight: 700; }
.sidd-bit.sidd-edge { box-shadow: inset 2px 0 0 var(--c); }
.sidd-swatch { display: inline-block; width: 0.7rem; height: 0.7rem; border-radius: 2px; margin-right: 0.4rem; vertical-align: -0.05rem; border: 1px solid var(--c); background: var(--t); }
.md-typeset #sidd-out table, .md-typeset #sidd-beh-out table { font-size: 0.7rem; }
.md-typeset #sidd-out td, .md-typeset #sidd-out th, .md-typeset #sidd-beh-out td, .md-typeset #sidd-beh-out th { padding: 0.45em 0.8em; }
.sidd table code, .sidd-beh table code { word-break: normal; white-space: nowrap; }
.md-typeset #sidd-beh-out .sidd-ref { overflow-wrap: anywhere; color: var(--md-default-fg-color--light); }
.sidd-facts { list-style: none; margin: 0.5rem 0 !important; padding: 0; }
.md-typeset .sidd-facts li { display: flex; gap: 0.55rem; align-items: flex-start; margin: 0 0 0.45rem; }
.sidd-fact-icon { flex: none; width: 1.15rem; height: 1.15rem; border-radius: 50%; display: inline-grid; place-items: center; font-size: 0.65rem; font-weight: 700; color: #fff; margin-top: 0.1rem; }
.sidd-fact-ok .sidd-fact-icon { background: #2e7d32; }
.sidd-fact-info .sidd-fact-icon { background: #1565c0; }
.sidd-fact-warn .sidd-fact-icon { background: #b45309; }
.sidd-fact-error .sidd-fact-icon { background: #c62828; }
.sidd-sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }
.sidd-stepper { border: 1px solid var(--md-default-fg-color--lightest); border-radius: 10px; padding: 0.8rem 1rem; }
.sidd-stepnav { display: flex; align-items: center; justify-content: space-between; gap: 0.5rem; flex-wrap: wrap; }
.sidd-stepcount { font-size: 0.75rem; font-weight: 600; }
.sidd-da { margin: 0.5rem 0 0.2rem; display: flex; flex-wrap: wrap; gap: 0.5rem; align-items: baseline; }
.sidd-steptext { font-size: 0.75rem; }
.md-typeset .sidd-steplist { margin: 0.5rem 0 0 1.2rem; font-size: 0.72rem; }
.md-typeset .sidd-steplist li { margin: 0.1rem 0; }
.sidd-steplink { font: inherit; cursor: pointer; background: none; border: 0; padding: 0.1rem 0.2rem; border-radius: 4px; color: inherit; text-align: left; }
.sidd-steplink.sidd-current { outline: 2px solid var(--md-accent-fg-color); }
.sidd-beh { margin: 1rem 0; }
.sidd-beh .sidd-row { max-width: 26rem; }
.sidd-beh input { font: inherit; font-size: 0.8rem; color: var(--md-default-fg-color); background: var(--md-default-bg-color); border: 1px solid var(--md-default-fg-color--lighter); border-radius: var(--sidd-radius); padding: 0.45rem 0.6rem; }
.sidd-beh label { font-size: 0.72rem; font-weight: 600; color: var(--md-default-fg-color--light); }
.sidd-beh .sidd-examples { margin-top: 0.5rem; }
</style>

# SRv6 SID Decoder and uSID Calculator

Paste any **SRv6 SID** — a classic SID or a **uSID** container — and the decoder splits it into its Locator-Block, node, function and argument bits, flags what the address tells you, and walks the container hop by hop the way an RFC 9800 NEXT-CSID router processes it. Every decode has its own URL, so you can link a colleague straight to it. It runs entirely in your browser: nothing you paste is sent anywhere.

<div id="sid-decoder" class="sidd">
<form id="sidd-form" class="sidd-form" autocomplete="off" novalidate>
<div class="sidd-row">
<label for="sidd-addr">SRv6 SID or IPv6 address</label>
<input id="sidd-addr" name="addr" type="text" spellcheck="false" autocapitalize="off" autocorrect="off" maxlength="100" placeholder="fcbb:bb00:100:200:300:e004::">
</div>
<div class="sidd-row">
<label for="sidd-fmt">SID format</label>
<select id="sidd-fmt" name="fmt">
<option value="f3216">uSID F3216: 32-bit block, 16-bit uSIDs</option>
<option value="f4816">uSID F4816: 48-bit block, 16-bit uSIDs</option>
<option value="f1616">uSID F1616: 16-bit block, 16-bit uSIDs</option>
<option value="usid">uSID with custom lengths</option>
<option value="classic">Classic SID: Block, Node, Function, Argument</option>
</select>
</div>
<fieldset id="sidd-usid-opts" class="sidd-lens" hidden>
<legend>uSID lengths in bits</legend>
<label>Locator-Block <input id="sidd-lbl" type="number" min="1" max="120" inputmode="numeric"></label>
<label>uSID (LNFL) <input id="sidd-csid" type="number" min="1" max="64" inputmode="numeric"></label>
</fieldset>
<fieldset id="sidd-classic-opts" class="sidd-lens" hidden>
<legend>Field lengths in bits (RFC 8986 Section 3.1)</legend>
<label>Block (B) <input id="sidd-b" type="number" min="0" max="128" inputmode="numeric"></label>
<label>Node (N) <input id="sidd-n" type="number" min="0" max="128" inputmode="numeric"></label>
<label>Function (F) <input id="sidd-f" type="number" min="0" max="128" inputmode="numeric"></label>
<label>Argument (A) <input id="sidd-a" type="number" min="0" max="128" inputmode="numeric"></label>
</fieldset>
<div class="sidd-examples">
<span>Examples:</span>
<button type="button" data-example='{"addr":"fcbb:bb00:100:200:300:e004::","fmt":"f3216"}'>F3216 uSID path</button>
<button type="button" data-example='{"addr":"5f00:0:1:e001::","fmt":"f3216"}'>5f00::/16 SID</button>
<button type="button" data-example='{"addr":"2001:db8:b1:10:20:30:40:50","fmt":"f4816"}'>RFC 9800 container</button>
<button type="button" data-example='{"addr":"fc00:0:2:e004::","fmt":"classic","b":32,"n":16,"f":16,"a":0}'>Classic SID</button>
<button type="button" data-example='{"addr":"fcbb:bb00:100:0:300::","fmt":"f3216"}'>Malformed</button>
</div>
</form>
<div id="sidd-out"><noscript><p class="sidd-hint">The decoder needs JavaScript. The explanations below work without it.</p></noscript></div>
</div>

<script src="../../assets/javascripts/sid-decoder.js"></script>

## How to Read an SRv6 SID

An SRv6 SID is a 128-bit IPv6 address that the network treats as an instruction. [RFC 8986](../rfcs/rfc8986.md) splits it into three parts, written **LOC:FUNCT:ARG**:

| Part | What it is | Who reads it |
|------|-----------|--------------|
| **Locator** (L bits) | A routable prefix that leads to one node. It is itself split into the **Block** (B), the prefix shared by the whole SR domain, and the **Node** (N) part that picks one router | Every router: it is an ordinary IPv6 route in IS-IS, OSPFv3 or BGP |
| **Function** (F bits) | Selects the behavior bound to the SID on that node: End, End.X, End.DT4, and so on | Only the node that owns the locator |
| **Argument** (A bits) | Optional per-packet parameter for the behavior, such as the ESI filter of End.DT2M | Only the owning node, and only for behaviors that take one |

L + F + A can be at most 128, and when it is less, the remaining low bits must be zero (RFC 8986 Section 3.1). The lengths are a **design choice of the operator**, not something you can infer from the address, which is why the decoder asks for them. A common classic layout is a /48 locator (32-bit block + 16-bit node), a 16-bit function, and no argument: `fc00:0:2:e004::` is function `0xe004` on the node with locator `fc00:0:2::/48`.

Transit routers never look past the locator: they do a longest-prefix match on the destination address like for any IPv6 packet. That is the whole trick that lets SRv6 run over routers with no SRv6 support. The full anatomy, including the IANA block, is in [SID Structure](../topics/sid-structure.md).

## SRv6 SID Formats: Classic SIDs and uSIDs

A classic SID spends 128 bits on one instruction. A **uSID** (micro-SID, the NEXT-CSID flavor of [RFC 9800](../rfcs/rfc9800.md)) packs several short instructions into one 128-bit **container**: a Locator-Block followed by a list of compressed SIDs, each one the Node and Function of a SID with the shared block left out. The format name gives the two lengths: **F3216** means a 32-bit Locator-Block and 16-bit uSIDs.

| Format | Locator-Block | uSID length | uSIDs per container | Where you see it |
|--------|:-------------:|:-----------:|:-------------------:|------------------|
| **F3216** | 32 bits | 16 bits | 6 | The format every NEXT-CSID implementation must support (RFC 9800 Section 4.1). Cisco [IOS-XR](../implementations/cisco-ios-xr.md) and [IOS-XE](../implementations/cisco-ios-xe.md) call it `usid-f3216`; [Arista EOS](../implementations/arista-eos.md) and [Juniper](../implementations/juniper.md) use it too |
| **F4816** | 48 bits | 16 bits | 5 | The examples in RFC 9800, with blocks such as `2001:db8:b1::/48` |
| **F1616** | 16 bits | 16 bits | 7 | Maximum packing, but the block takes a whole /16 |
| Custom NEXT-CSID | any | any | floor((128 − block) / uSID) | RFC 9800 allows other lengths; leftover bits are padding |
| Classic SID | — | — | 1 | RFC 8986 SIDs, one per SRH entry |

The capacity formula is from RFC 9800: a container holds K = floor((128 − LBL) / LNFL) uSIDs, where LBL is the Locator-Block length and LNFL the uSID length. RFC 9800's other flavor, REPLACE-CSID (G-SRv6), uses 16- or 32-bit C-SIDs and an index in the argument instead of a shift, so it is not visualized here. See [uSID Compression](../topics/usid-compression.md) for the overhead comparison.

### Reading an F3216 uSID

```text
fcbb:bb00:0100:0200:0300:e004:0000:0000
└─block──┘└uN1┘└uN2┘└uN3┘└uDT┘└EoC┘
```

- `fcbb:bb00` is the 32-bit **Locator-Block**, the same on every node of the domain.
- `0100` is the **active uSID**. Node 1 advertises `fcbb:bb00:0100::/48` in the IGP, so plain longest-prefix match delivers the packet there.
- `0200`, `0300` are the next nodes; `e004` is a local service uSID (here uDT4 on node 3).
- `0000` is the **end-of-container** marker. CSID value 0 is reserved for exactly this (RFC 9800 Section 5).

A common convention from the uSID draft splits the 16-bit space into a **GIB** (`0x0000`–`0xDFFF`, global uSIDs such as a node's uN) and a **LIB** (`0xE000`–`0xFFFF`, local uSIDs such as uA adjacencies and uDT/uDX services). RFC 9800 Section 9.2 leaves the split to the operator, so the decoder labels it as a hint, not a fact.

## How uSID Shift-and-Forward Works

When a router receives a packet whose destination matches one of its NEXT-CSID SIDs, it applies RFC 9800 Section 4.1.1, lines N01 to N09:

1. If the **Argument** (every bit after the active uSID) is not zero, copy it into the bits right after the Locator-Block, overwriting the active uSID, and set the last uSID-length bits to zero. In F3216, that is "shift bits 48–127 left by 16".
2. Decrement the Hop Limit and forward on the new destination address. Segments Left in the SRH is **not** touched, and in many deployments there is no SRH at all.
3. If the Argument is zero, this uSID is the last one in the container: the node runs the ordinary RFC 8986 behavior, taking the next 128-bit entry from the SRH if Segments Left is above zero, or acting as the final destination (a uDT4, for example, decapsulates and looks up the inner packet).

Applied to the example above:

```text
received       fcbb:bb00:0100:0200:0300:e004:0000:0000   node 1 (uN 0100) shifts
after node 1   fcbb:bb00:0200:0300:e004:0000:0000:0000   node 2 (uN 0200) shifts
after node 2   fcbb:bb00:0300:e004:0000:0000:0000:0000   node 3 (uN 0300) shifts
after node 3   fcbb:bb00:e004:0000:0000:0000:0000:0000   node 3 (uDT4 e004): Argument 0, decapsulate
```

Four instructions, sixteen bytes, no SRH. The decoder's step-through shows the same walk for whatever you paste.

## Worked Examples

Each link opens the decoder with the example loaded.

1. **F3216 uSID path with a VPN service.** [`fcbb:bb00:100:200:300:e004::`](./?addr=fcbb:bb00:100:200:300:e004::&fmt=f3216) carries three node uSIDs and a local uDT4 in one destination address, the case walked through above.
2. **A SID from the IANA block.** [`5f00:0:1:e001::`](./?addr=5f00:0:1:e001::&fmt=f3216) uses `5f00::/32` as its Locator-Block, carved from `5f00::/16`, the block [RFC 9602](../rfcs/rfc9602.md) reserves for SRv6 SIDs: node uSID `0001`, then local service uSID `e001`. It is the layout of the [Juniper example](../implementations/juniper.md). Using `5f00::/16` is optional; operator GUA and ULA locators are just as valid.
3. **A full container from RFC 9800.** [`2001:db8:b1:10:20:30:40:50`](./?addr=2001:db8:b1:10:20:30:40:50&fmt=f4816) has a 48-bit block and five uSIDs with no end-of-container marker, like the first container of RFC 9800 Figure 2. After the fifth uSID the Argument is zero and processing continues with the next SRH entry.
4. **A classic SID.** [`fc00:0:2:e004::`](./?addr=fc00:0:2:e004::&fmt=classic&b=32&n=16&f=16&a=0) with B=32, N=16, F=16, A=0 is function `0xe004` behind locator `fc00:0:2::/48`, the End.DT4 SID used in the [L3VPN example](../topics/network-programming.md#putting-it-together-an-l3vpn-program).
5. **A malformed container.** [`fcbb:bb00:100:0:300::`](./?addr=fcbb:bb00:100:0:300::&fmt=f3216) has a uSID after the end-of-container. Node 1 shifts `0000` into the active position, no node owns the resulting address, and the decoder says so.

## Function Bits vs Behavior Codepoints

The function bits in a SID are **allocated locally** by the router; `0xe004` means End.DT4 on one node and something else on the next. What is standardized is the **behavior codepoint** a router advertises next to each SID in IS-IS, OSPFv3, BGP and BGP-LS, from the IANA "SRv6 Endpoint Behaviors" registry. So you cannot tell a SID's behavior from its bits alone: look the SID up in the router's SID table, or take the codepoint from the routing protocol and look it up here.

<div id="sidd-behaviors" class="sidd-beh">
<div class="sidd-row">
<label for="sidd-beh-q">Codepoint (decimal or 0x hex) or behavior name</label>
<input id="sidd-beh-q" type="text" spellcheck="false" autocapitalize="off" autocomplete="off" placeholder="48, 0x30, uN, End.DT4, REPLACE-CSID">
</div>
<div class="sidd-examples">
<span>Try:</span>
<button type="button" class="sidd-chipbtn" data-beh="48">48 (uN)</button>
<button type="button" class="sidd-chipbtn" data-beh="57">57 (uA)</button>
<button type="button" class="sidd-chipbtn" data-beh="End.DT">End.DT*</button>
<button type="button" class="sidd-chipbtn" data-beh="NEXT-CSID">NEXT-CSID</button>
<button type="button" class="sidd-chipbtn" data-beh="RFC 8986">RFC 8986</button>
</div>
<div id="sidd-beh-out"><noscript><p class="sidd-hint">The lookup needs JavaScript; see the table in <a href="../../topics/network-programming/">Network Programming</a>.</p></noscript></div>
</div>

The registry above is the complete IANA list as of October 2026, including codepoints assigned to drafts. Vendors shorten the common NEXT-CSID behaviors as **uN** (End with NEXT-CSID, PSP & USD, codepoint 48) and **uA** (End.X with NEXT-CSID, PSP & USD, codepoint 57). [Network Programming](../topics/network-programming.md) explains what each behavior does.

## Frequently Asked Questions

### What is an SRv6 SID?

An SRv6 Segment Identifier (SID) is a 128-bit IPv6 address that encodes an instruction. Its locator routes the packet to a node, its function selects what that node does (forward, cross-connect, decapsulate into a VRF), and its optional argument parameterizes the function. Routers that do not own the locator forward it as normal IPv6.

### What does F3216 mean?

F3216 is the most common SRv6 uSID format: a 32-bit Locator-Block followed by 16-bit uSIDs, so one 128-bit address holds up to six uSIDs. RFC 9800 requires every NEXT-CSID implementation to support it, and Cisco IOS-XR and IOS-XE configure it as usid-f3216.

### How many uSIDs fit in one container?

floor((128 − Locator-Block length) / uSID length). That is 6 for F3216, 5 for a 48-bit block with 16-bit uSIDs, and 7 for F1616. When a path needs more, the source puts further containers in the SRH and the last uSID of each container moves processing to the next one.

### What is the end-of-container (0000) in a uSID?

RFC 9800 reserves the CSID value 0 to mark the end of a container. When the bits after the active uSID are all zero, the node knows it holds the last uSID of the container and takes the next SID from the SRH, or is the final destination if there is none.

### Do SRv6 SIDs have to be in 5f00::/16?

No. RFC 9602 reserves 5f00::/16 so SIDs are easy to recognize and filter, and marks it as not globally reachable, but operators can keep using their own global unicast or unique local prefixes as locators. Whatever the prefix, filter it at the SR domain edge.

### Can I tell the behavior of a SID from its bits?

No. Function values are allocated locally by each router. The behavior is known from the router's SID table or from the IANA codepoint it advertises in the IGP or BGP, which you can look up in the behavior table on this page.

## Further Reading

- :material-arrow-right: [SID Structure](../topics/sid-structure.md) - Locator, function, argument and the 5f00::/16 block
- :material-arrow-right: [uSID Compression](../topics/usid-compression.md) - Overhead savings and uSID vs G-SRv6
- :material-arrow-right: [Network Programming](../topics/network-programming.md) - What every RFC 8986 and RFC 9800 behavior does
- :material-arrow-right: [SRH & Packet Walk](../topics/srh-packet-walk.md) - Classic SIDs and Segments Left hop by hop
- :material-file-document: [RFC 9800](../rfcs/rfc9800.md) - Compressed SRv6 segment lists (NEXT-CSID, REPLACE-CSID)
- :material-file-document: [RFC 9602](../rfcs/rfc9602.md) - The 5f00::/16 SRv6 SID block

## References

1. [RFC 8986 - SRv6 Network Programming](https://www.rfc-editor.org/rfc/rfc8986) - SID structure (Section 3.1), endpoint behaviors and flavors
2. [RFC 9800 - Compressed SRv6 Segment List Encoding](https://www.rfc-editor.org/rfc/rfc9800) - NEXT-CSID pseudocode (Section 4.1.1), CSID allocation (Section 5), GIB/LIB guidance (Section 9.2)
3. [RFC 9602 - SRv6 SIDs in the IPv6 Addressing Architecture](https://www.rfc-editor.org/rfc/rfc9602) - The 5f00::/16 block
4. [IANA - SRv6 Endpoint Behaviors](https://www.iana.org/assignments/segment-routing/segment-routing.xhtml) - The registry of behavior codepoints used in the lookup table
5. [draft-filsfils-spring-net-pgm-extension-srv6-usid](https://datatracker.ietf.org/doc/draft-filsfils-spring-net-pgm-extension-srv6-usid/) - uN/uA naming and the 0x0000-0xDFFF / 0xE000-0xFFFF GIB/LIB convention
6. [RFC 5952 - IPv6 Address Text Representation](https://www.rfc-editor.org/rfc/rfc5952) - The compressed form the decoder prints
