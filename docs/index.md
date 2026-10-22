---
title: SRv6 - Segment Routing over IPv6 Knowledge Base
seo_title: "SRv6 (Segment Routing over IPv6): The Open Knowledge Base"
description: The definitive open-source guide to SRv6 (Segment Routing over IPv6). Learn what SRv6 is, how it works, use cases, implementations, labs, and RFCs.
tags:
  - home
  - srv6
  - segment-routing
  - what is srv6
  - srv6 tutorial
hide:
  - toc
  - navigation
  - tags
---

<div class="srv6-hero" markdown>

<div class="srv6-hero-text" markdown>

# SRv6: Segment Routing over IPv6

<p class="srv6-tagline">
  The definitive open-source knowledge base for <strong>SRv6</strong>.<br>
  Learn how SRv6 works. Build labs. Contribute.
</p>

[:material-rocket-launch: &nbsp; Get Started](topics/index.md){ .srv6-btn .srv6-btn-primary }
&nbsp;&nbsp;
[:fontawesome-brands-github: &nbsp; Contribute](https://github.com/eldaninavas/srv6.md){ .srv6-btn .srv6-btn-secondary }

</div>

<div class="srv6-hero-stage"></div>

</div>

<div class="srv6-stats" markdown>
<div class="srv6-stat">
  <span class="srv6-stat-number">20+</span>
  <span class="srv6-stat-label">RFCs Covered</span>
</div>
<div class="srv6-stat">
  <span class="srv6-stat-number">10+</span>
  <span class="srv6-stat-label">Implementations</span>
</div>
<div class="srv6-stat">
  <span class="srv6-stat-number">100%</span>
  <span class="srv6-stat-label">Open Source</span>
</div>
</div>

---

<div class="srv6-contributors-card">
  <div class="srv6-contributors-card-header">
    <span class="srv6-contributors-card-title">Top Contributors</span>
    <a href="https://github.com/eldaninavas/srv6.md/graphs/contributors" target="_blank" rel="noopener" class="srv6-contributors-card-link">View all</a>
  </div>
  <ul id="srv6-contributors" class="srv6-contributors-list">
    <li class="srv6-contributor-loading">Loading…</li>
  </ul>
  <a href="https://github.com/eldaninavas/srv6.md" target="_blank" rel="noopener" class="srv6-contributors-join">+ Become a contributor</a>
</div>

## :material-robot-outline: SRv6 for AI

SRv6 now runs inside some of the largest AI training networks in the world. OpenAI, Microsoft and Oracle use static SRv6 uSID source routing in their GPU fabrics through [MRC](ai/mrc.md), with no BGP in the backend. Meta and Alibaba use SRv6 traffic engineering to connect AI clusters across sites. The [SRv6 for AI](ai/index.md) section covers who runs it, how it works, how to design a fabric, and the standards behind it.

[:material-arrow-right: SRv6 for AI: the complete guide](ai/index.md){ .md-button .md-button--primary }  &nbsp; [:material-arrow-right: How MRC uses SRv6](ai/mrc.md){ .md-button }

## :material-tools: SRv6 SID Decoder

Paste any SRv6 SID or uSID container and see what every bit means: Locator-Block, node, function and argument, F3216 uSIDs, the end-of-container, and a hop-by-hop walk of the RFC 9800 shift-and-forward. It also looks up any IANA behavior codepoint, and every decode has a link you can share.

[:material-arrow-right: Open the SID decoder](tools/sid-decoder.md){ .md-button .md-button--primary }

## :material-chart-bar: State of SRv6 2026

How far has SRv6 come? Our data report counts 23 SRv6 RFCs, 65 active IETF drafts, 19 organizations with public deployments and uSID support across 11 implementations, with a source for every number and charts you can reuse.

[:material-arrow-right: Read the State of SRv6 2026 report](reports/state-of-srv6-2026.md){ .md-button .md-button--primary }

## :material-compass: Explore

<div class="srv6-grid" markdown>

<div class="srv6-card" markdown>

### :material-book-open-variant: Topics

New to SRv6? Start here. Understand the core concepts of Segment Routing over IPv6, SID structure, and network programming.

[:material-arrow-right: Learn the basics](topics/index.md){ .md-button }

</div>

<div class="srv6-card" markdown>

### :material-traffic-light: Use Cases

Discover real-world applications: Traffic Engineering, VPN services, service function chaining, and more.

[:material-arrow-right: See use cases](use-cases/index.md){ .md-button }

</div>

<div class="srv6-card" markdown>

### :material-server-network: Implementations

Hands-on guides for Linux, Cisco IOS-XR and IOS-XE, Juniper, Arista, Nokia, FRRouting, and SONiC.

[:material-arrow-right: View implementations](implementations/index.md){ .md-button }

</div>

<div class="srv6-card" markdown>

### :material-flask: Labs

Build your own SRv6 lab with netlab, Containerlab, and GNS3. Copy-paste configs included.

[:material-arrow-right: Start a lab](labs/index.md){ .md-button }

</div>

<div class="srv6-card" markdown>

### :material-file-document: RFCs & Standards

Quick reference for all SRv6-related RFCs and IETF drafts with plain-English summaries.

[:material-arrow-right: Browse RFCs](rfcs/index.md){ .md-button }

</div>

<div class="srv6-card" markdown>

### :material-account-group: Community

Join the community! Learn how to contribute, report issues, or suggest new content.

[:material-arrow-right: Get involved](community/index.md){ .md-button }

</div>

</div>

---

## :material-head-question: SRv6 (IPv6 Segment Routing) in a Nutshell

**SRv6 (Segment Routing over IPv6)** — also written **Segment Routing v6**, SR v6 or **IPv6 Segment Routing** — is the IPv6 data plane of the Segment Routing architecture ([RFC 8402](rfcs/rfc8402.md)). It encodes forwarding instructions directly in IPv6 packet headers. Instead of relying on MPLS labels and signaling protocols like LDP or RSVP-TE, SRv6 uses native 128-bit IPv6 addresses as **Segment Identifiers (SIDs)** to program network paths and behaviors.

The source node builds an ordered list of segments that defines the packet's path and the processing at each hop. The active segment sits in the IPv6 destination address; when there is more than one, the rest travel in a **Segment Routing Header (SRH)** — and with [uSID compression](topics/usid-compression.md) a whole path often fits in the destination address with no SRH at all. Transit routers simply forward on the destination address. This enables traffic engineering, VPN services, fast reroute and service function chaining on a plain IPv6 network.

**Why choose SRv6 over traditional MPLS?**

- **Simplified operations** — No more MPLS label management, LDP, or RSVP
- **Native IPv6** — Uses the existing IPv6 data plane with no overlays
- **Network programmability** — Define custom network behaviors with SRv6 functions (End, End.DT4, End.DX6, etc.)
- **Scalability** — 128-bit SID space supports massive networks and micro-segmentation
- **Unified data plane** — Single protocol stack for transport, VPN, and TE services

[:material-arrow-right: What is SRv6? The full explanation](topics/what-is-srv6.md){ .md-button }  &nbsp; [:material-arrow-right: See how SRv6 works](topics/network-programming.md){ .md-button }  &nbsp; [:material-book-alphabet: SRv6 glossary](topics/glossary.md){ .md-button }

!!! tip "This is a community project"
    SRv6.md is built and maintained by the networking community. Every page has an **edit button** (:material-pencil:) — if you spot an error or want to add content, we welcome your contributions!

---

<p style="text-align: center; color: var(--md-default-fg-color--lighter); font-size: 0.85rem;">
  SRv6.md is not affiliated with any vendor. Content is provided under the MIT License. <a href="community/about/">About SRv6.md and how content is verified</a>.
</p>
