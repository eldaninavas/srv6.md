---
title: SRv6 for AI
seo_title: "SRv6 for AI: The Complete Guide to SRv6 in AI Networks"
description: "The reference on SRv6 for AI networking: who runs it (OpenAI, Microsoft, Oracle, Meta, Alibaba, Google), how MRC and uSID source routing work in GPU fabrics, scale-across, standards and FAQ."
tags:
  - ai
  - gpu
  - mrc
  - usid
  - data-center
  - srv6 ai
---

# SRv6 for AI: The Complete Guide

**SRv6 has become a foundational protocol for AI networking.** In GPU training fabrics, the sending NIC writes the exact path of every packet as a list of 16-bit uSIDs in the IPv6 destination address. Switches forward it with static tables and no routing protocol, and the transport sprays traffic across hundreds of explicit paths and abandons a failing path within microseconds. Between data centers, SRv6 traffic engineering steers AI traffic across the WAN. OpenAI, Microsoft and Oracle run SRv6 in their AI training fabrics, Meta on the backbone that interconnects its AI clusters, and Alibaba Cloud across its AI computing network.

!!! abstract "Key facts (October 2026)"
    - **Production**: [MRC](mrc.md) over static SRv6 trains frontier models in OpenAI's largest GB200 clusters, Microsoft's Fairwater supercomputers and Oracle's OCI clusters, including Abilene, Texas. Reported jobs reach 75,000 GPUs on fabrics designed for 131,072 GPUs in two tiers.
    - **No BGP in the backend**: switches keep small static uSID tables written once at install time. Failure handling moves to the NIC.
    - **40 bytes**: with uSID, a full path fits in one IPv6 destination address, with no Segment Routing Header.
    - **Scale-across**: Meta (regional backbone, SRv6 TE in production since October 2026) and Alibaba (a dedicated "eCore for AI" with per-job SRv6 TE) use SRv6 between AI sites.
    - **Standards**: data plane in RFC 8986 and RFC 9800; AI usage in [draft-filsfils-srv6ops-srv6-ai-backend](ai-standards.md) (-05, authors from Cisco, OpenAI, Microsoft, Oracle, IBM, NVIDIA and Arrcus); transport in OCP MRC 1.0; switch software in SONiC since 202505.

## Why SRv6 fits AI networks

1. **Deterministic paths, not hashing.** AI training is a few huge, synchronized flows, which is the worst case for ECMP. With SRv6 the sender places every packet on a known path, so there are no hash collisions and path changes are exact. See [SRv6 vs ECMP, Adaptive Routing and Ultra Ethernet](srv6-vs-ai-fabric-alternatives.md).
2. **A static, simpler fabric.** Static uSID routes replace BGP and its reconvergence. The MRC operators reboot spine switches without coordinating with training teams.
3. **Ground-truth visibility.** A probe that uses the same uSID path as data tests exactly what the data experiences. OpenAI's Clustermapper probes every link every millisecond. See [AI Fabric Telemetry](ai-fabric-telemetry.md).
4. **Minimal overhead.** uSID ([RFC 9800](../rfcs/rfc9800.md)) packs up to six hops into one 128-bit address. The cost is a single 40-byte outer IPv6 header, handled at line rate by mainstream switch ASICs.
5. **One technology from GPU to WAN.** The same SRv6 data plane serves the backend fabric, the data center frontend and the inter-DC backbone, with no MPLS gateways at the DC edge. See [Scale-Across](scale-across.md).
6. **Open and multi-vendor.** NICs from NVIDIA, AMD and Broadcom; switches from NVIDIA, Arista (on Broadcom) and Cisco Silicon One; open-source SONiC, SAI and FRR.

## Who uses SRv6 for AI

| Organization | Where SRv6 runs | What it does | Status | Source |
|--------------|----------------|--------------|--------|--------|
| **OpenAI** | GPU backend fabric | MRC over static uSID source routing; no dynamic routing; Clustermapper probing | Production (largest GB200 clusters) | [MRC paper](https://arxiv.org/abs/2605.04333) |
| **Microsoft** | Fairwater AI supercomputers | Static SRv6 replaces BGP in the scale-out network; SONiC SRv6 contributions | Production | [Azure HPC blog](https://techcommunity.microsoft.com/blog/azurehighperformancecomputingblog/building-resilient-networks-for-ai-supercomputers/4516919) |
| **Oracle (OCI)** | Acceleron multiplanar network, including Abilene, Texas | MRC with SRv6 source routing | Production (per IETF draft) | [draft -05](https://www.ietf.org/archive/id/draft-filsfils-srv6ops-srv6-ai-backend-05.txt) |
| **Meta** | Regional backbone interconnecting DC campuses and AI clusters | uSID traffic engineering from a central controller on FBOSS + Cisco Silicon One | First SRv6 TE site in production, Oct 2026 | [Meta Engineering](https://engineering.fb.com/2026/10/12/open-source/ocp-summit-2026-powering-ai-with-open-innovations-in-scale-up-scale-out-and-scale-across-networks/) |
| **Alibaba Cloud** | AI computing network and "eCore for AI" scale-across backbone | IPv6/SRv6 across 14+ AI clusters (90,000 servers); per-training-job SRv6 TE between sites | Production | [IETF 125](https://datatracker.ietf.org/meeting/125/materials/slides-125-srv6ops-21-ipv6srv6-powering-alibaba-cloud-ai-computing-alibaba-02), [OCP 2026](https://www.segment-routing.net/conferences/2026-10-15-ocp-summit26-alibaba-cisco-te/) |
| **Google** | Virgo AI fabric | SRv6 source routing for bare-metal customers running their own host stack | Offered in the fabric | [OCP 2026](https://www.segment-routing.net/conferences/2026-10-15-ocp-summit26-google-virgo/) |
| **Nebius** | GPU cloud DC and WAN | End-to-end SRv6 VPN and TE without DC/WAN protocol translation | Production | [@Scale 2026](https://www.segment-routing.net/conferences/2026-08-25-atscale-nebius-srv6-interconnects/) |
| **China Telecom** | Computing-power metro network | L3EVPN over SRv6 Policy for cross-cluster training at 100–500 km | Live-network trials | [White paper](https://www.gfnds.com/uploads/20250818/59e55fd7289db89d0a8e02ccd676ae87.pdf) |

For SRv6 deployments outside AI, see [Real-World Deployments](../use-cases/deployments.md).

## Timeline

| Date | Milestone |
|------|-----------|
| Apr 2025 | First IETF draft on SRv6 for AI backends (Cisco) |
| 2025 | SONiC 202505 ships static SRv6 configuration for source-routed AI backends |
| Jun 2025 | Ultra Ethernet 1.0 published (entropy-based spraying; no SRv6) |
| Jan 2026 | Microsoft Research position paper on SRv6 packet steering for AI backends |
| Feb 2026 | NANOG 96: Cisco and Microsoft on deploying SRv6 uSID and SONiC in AI backends |
| Mar 2026 | IETF 125: Alibaba reports its AI computing is fully based on IPv6/SRv6 |
| **5 May 2026** | **OpenAI and partners publish MRC and its static SRv6 design; OCP MRC 1.0 released** |
| Jul 2026 | IETF 126: AI-backend draft authors request working-group adoption |
| Sep 2026 | draft-filsfils-srv6ops-srv6-ai-backend-05 (Cisco, OpenAI, Microsoft, Oracle, IBM, NVIDIA, Arrcus) |
| Oct 2026 | OCP Global Summit: OpenAI Clustermapper, Meta SRv6 backbone in production, Alibaba per-job TE, Google Virgo |

## Explore the SRv6 for AI section

<div class="srv6-grid" markdown>

<div class="srv6-card" markdown>

### :material-lan-connect: MRC and SRv6

How OpenAI's and Microsoft's supercomputer networks use static uSID source routing, multi-plane Clos and packet spraying.

[:material-arrow-right: Read the deep dive](mrc.md){ .md-button }

</div>

<div class="srv6-card" markdown>

### :material-floor-plan: AI Fabric Design

Topology, uSID addressing plan, static switch tables, SONiC and FRR config, NIC side, hardware and security.

[:material-arrow-right: Design a fabric](ai-fabric-design.md){ .md-button }

</div>

<div class="srv6-card" markdown>

### :material-compare: SRv6 vs Alternatives

ECMP, flowlets, adaptive routing, InfiniBand and Ultra Ethernet, and how SRv6 complements them.

[:material-arrow-right: Compare](srv6-vs-ai-fabric-alternatives.md){ .md-button }

</div>

<div class="srv6-card" markdown>

### :material-earth: Scale-Across

Multi-datacenter AI: Meta's SRv6 backbone, Alibaba's eCore for AI, China Telecom, and what is not SRv6.

[:material-arrow-right: Go beyond one site](scale-across.md){ .md-button }

</div>

<div class="srv6-card" markdown>

### :material-radar: AI Fabric Telemetry

Source-routed probing, Clustermapper and finding gray failures in GPU fabrics.

[:material-arrow-right: Observe the fabric](ai-fabric-telemetry.md){ .md-button }

</div>

<div class="srv6-card" markdown>

### :material-file-document-multiple: Standards Tracker

IETF drafts, OCP MRC, Ultra Ethernet and SONiC/SAI/FRR status in one table.

[:material-arrow-right: Track the standards](ai-standards.md){ .md-button }

</div>

<div class="srv6-card" markdown>

### :material-book-alphabet: AI Networking Glossary

All-reduce, RoCEv2, packet spraying, multi-plane, entropy value, uN: defined for network engineers.

[:material-arrow-right: Look up a term](ai-glossary.md){ .md-button }

</div>

<div class="srv6-card" markdown>

### :material-chip: AI/ML Training Networks

The use case in brief: why ECMP fails GPU training and how SRv6 path placement fixes it.

[:material-arrow-right: Read the use case](../use-cases/ai-networking.md){ .md-button }

</div>

</div>

## Frequently Asked Questions

### What is SRv6 used for in AI networks?

SRv6 is used in AI networks for two things. Inside a GPU training cluster, the NIC uses SRv6 uSIDs to choose the exact path of every packet through the backend fabric, which removes ECMP hash collisions, lets switches run without dynamic routing and makes every path testable. Between data centers, SRv6 traffic engineering steers AI traffic onto paths with the right latency and capacity.

### Does OpenAI use SRv6?

Yes. OpenAI's largest GB200 training clusters use MRC (Multipath Reliable Connection) over static SRv6 uSID source routing, with dynamic routing disabled on the switches. OpenAI, Microsoft, AMD, Broadcom and NVIDIA described the design in May 2026, and OpenAI presented its SRv6-based Clustermapper monitoring at the OCP Global Summit in October 2026.

### Why is SRv6 good for AI training?

AI training sends a few very large, synchronized flows, so per-flow hashing creates collisions and the slowest path slows the whole job. SRv6 lets the sender place each packet on an explicit path, spray across hundreds of paths and abandon a failing path in microseconds. The switches stay static and simple, and uSID keeps the overhead to one 40-byte IPv6 header.

### What is the difference between SRv6 and Ultra Ethernet?

Ultra Ethernet defines a transport that sprays packets using entropy values that switches hash, without changing the network layer. SRv6 is a network-layer source-routing technology that can map each entropy value to an explicit path. They are complementary: MRC combines Ultra Ethernet-derived transport features with SRv6 source routing.

### Which switches support SRv6 for AI fabrics?

Published deployments use NVIDIA Spectrum-4 and Spectrum-5 (Cumulus or SONiC), Arista EOS on Broadcom Tomahawk 5, and Cisco Silicon One systems running SONiC. SONiC has supported static SRv6 uSID configuration since release 202505.

### Is SRv6 used between AI data centers?

Yes. Meta uses SRv6 traffic engineering on the regional backbone that interconnects its data center campuses and AI clusters, and Alibaba Cloud runs a dedicated SRv6 network for multi-site AI training with per-job traffic engineering.

## References

1. [Resilient AI Supercomputer Networking using MRC and SRv6](https://arxiv.org/abs/2605.04333) - OpenAI, Microsoft, AMD, Broadcom and NVIDIA, May 2026
2. [draft-filsfils-srv6ops-srv6-ai-backend](https://datatracker.ietf.org/doc/draft-filsfils-srv6ops-srv6-ai-backend/) - SRv6 for Deterministic Path Placement in AI Backends
3. [OCP MRC 1.0 Specification](https://www.opencompute.org/documents/ocp-mrc-1-0-pdf) - Multipath Reliable Connection
4. [Building resilient networks for AI supercomputers](https://techcommunity.microsoft.com/blog/azurehighperformancecomputingblog/building-resilient-networks-for-ai-supercomputers/4516919) - Microsoft Azure HPC blog
5. [OCP Summit 2026: Powering AI with open innovations in scale-up, scale-out and scale-across networks](https://engineering.fb.com/2026/10/12/open-source/ocp-summit-2026-powering-ai-with-open-innovations-in-scale-up-scale-out-and-scale-across-networks/) - Meta Engineering
6. [IPv6 & SRv6 Powering Alibaba Cloud AI Computing (IETF 125)](https://datatracker.ietf.org/meeting/125/materials/slides-125-srv6ops-21-ipv6srv6-powering-alibaba-cloud-ai-computing-alibaba-02) - Alibaba Cloud
7. [SONiC 202505: Powering AI fabrics](https://sonicfoundation.dev/sonic-202505-powering-ai-fabrics-and-enterprise-networks-with-precision-and-insight/) - SONiC Foundation
