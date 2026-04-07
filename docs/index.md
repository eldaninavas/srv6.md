---
title: SRv6 - Segment Routing over IPv6 Knowledge Base
description: The definitive open-source guide to SRv6 (Segment Routing over IPv6). Learn what SRv6 is, how it works, use cases, implementations, labs, and RFCs.
tags:
  - home
  - srv6
  - segment-routing
  - what is srv6
  - srv6 tutorial
hide:
  - toc
---

<div class="srv6-hero" markdown>

# SRv6: Segment Routing over IPv6

<p class="srv6-tagline">
  The definitive open-source knowledge base for <strong>SRv6</strong>.<br>
  Learn how SRv6 works. Build labs. Contribute.
</p>

[:material-rocket-launch: &nbsp; Get Started](topics/index.md){ .srv6-btn .srv6-btn-primary }
&nbsp;&nbsp;
[:fontawesome-brands-github: &nbsp; Contribute](https://github.com/eldaninavas/srv6.md){ .srv6-btn .srv6-btn-secondary }

</div>

<div class="srv6-stats" markdown>
<div class="srv6-stat">
  <span class="srv6-stat-number">6+</span>
  <span class="srv6-stat-label">RFCs Covered</span>
</div>
<div class="srv6-stat">
  <span class="srv6-stat-number">5+</span>
  <span class="srv6-stat-label">Implementations</span>
</div>
<div class="srv6-stat">
  <span class="srv6-stat-number">100%</span>
  <span class="srv6-stat-label">Open Source</span>
</div>
</div>

---

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

Hands-on guides for Linux Kernel, Cisco IOS-XR, Juniper, FRRouting, and SONiC.

[:material-arrow-right: View implementations](implementations/index.md){ .md-button }

</div>

<div class="srv6-card" markdown>

### :material-flask: Labs

Build your own SRv6 lab with Containerlab, GNS3, and other tools. Copy-paste configs included.

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

## :material-head-question: What is SRv6 and How Does It Work?

**SRv6 (Segment Routing over IPv6)** is a next-generation network architecture that encodes forwarding instructions directly in IPv6 packet headers. Instead of relying on MPLS labels and complex signaling protocols like LDP or RSVP, SRv6 uses native 128-bit IPv6 addresses as **Segment Identifiers (SIDs)** to program network paths and behaviors.

SRv6 works by inserting a **Segment Routing Header (SRH)** into IPv6 packets. The source node populates a segment list that defines the packet's path and processing at each hop. This enables powerful capabilities like traffic engineering, VPN services, and service function chaining — all without overlay protocols.

**Why choose SRv6 over traditional MPLS?**

- **Simplified operations** — No more MPLS label management, LDP, or RSVP
- **Native IPv6** — Uses the existing IPv6 data plane with no overlays
- **Network programmability** — Define custom network behaviors with SRv6 functions (End, End.DT4, End.DX6, etc.)
- **Scalability** — 128-bit SID space supports massive networks and micro-segmentation
- **Unified data plane** — Single protocol stack for transport, VPN, and TE services

[:material-arrow-right: Learn what SRv6 is in detail](topics/what-is-srv6.md){ .md-button }  &nbsp; [:material-arrow-right: See how SRv6 works](topics/network-programming.md){ .md-button }

!!! tip "This is a community project"
    SRv6.md is built and maintained by the networking community. Every page has an **edit button** (:material-pencil:) — if you spot an error or want to add content, we welcome your contributions!

---

<p style="text-align: center; color: var(--md-default-fg-color--lighter); font-size: 0.85rem;">
  SRv6.md is not affiliated with any vendor. Content is provided under the MIT License.
</p>
