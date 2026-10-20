---
title: SRv6 AI Standards Tracker
seo_title: "SRv6 for AI Standards Tracker: IETF Drafts, OCP MRC, SONiC"
description: "Every standard and draft on SRv6 for AI networking in one place: the IETF AI-backend draft, AI DCI and RDMA drafts, OCP MRC 1.0, Ultra Ethernet, and SONiC/SAI/FRR support. Updated October 2026."
tags:
  - ai
  - standards
  - ietf
  - drafts
  - sonic
---

# SRv6 for AI: Standards Tracker

A single reference for the specifications, IETF drafts and open-source releases that define SRv6 in AI networks. **Status as of 20 October 2026.** Drafts are individual submissions unless noted; an IETF draft is a work in progress and carries no standards status until it is published as an RFC.

## The core documents

| Document | Body | Status | What it defines |
|----------|------|--------|-----------------|
| [RFC 9800](../rfcs/rfc9800.md) — Compressed SRv6 Segment List Encoding | IETF | **RFC** (Standards Track) | uSID (NEXT-C-SID): the uN and uA behaviors that AI fabrics use |
| [RFC 8986](../rfcs/rfc8986.md) — SRv6 Network Programming | IETF | **RFC** | H.Encaps.Red, End, End.X, End.DT46 and the other base behaviors |
| [RFC 9602](../rfcs/rfc9602.md) — SRv6 SIDs in the IPv6 Addressing Architecture | IETF | **RFC** | The `5f00::/16` block used in the AI-backend draft's examples |
| [draft-filsfils-srv6ops-srv6-ai-backend](https://datatracker.ietf.org/doc/draft-filsfils-srv6ops-srv6-ai-backend/) | IETF (srv6ops) | Individual draft, **-05** (21 Sep 2026); WG adoption requested at IETF 126 | NIC-driven deterministic path placement with uSID; static fabric; probing; security; deployments at OpenAI, Microsoft and OCI |
| [OCP MRC 1.0](https://www.opencompute.org/documents/ocp-mrc-1-0-pdf) | Open Compute Project | **Published** (released 5 May 2026) | Multipath Reliable Connection transport, with ECMP, structured-entropy and SRv6 (uSID, optional SRH) forwarding modes |
| [Ultra Ethernet 1.0](https://ultraethernet.org/wp-content/uploads/sites/20/2025/06/UE-Specification-6.11.25.pdf) / [1.1](https://ultraethernet.org/wp-content/uploads/sites/20/2026/10/UE-Specification-1.1.pdf) | Ultra Ethernet Consortium | **Published** (Jun 2025 / Oct 2026) | Entropy-based packet spraying transport. No SRv6 in 1.0; 1.1 mentions SRv6 once, as a tunnel option |

### draft-filsfils-srv6ops-srv6-ai-backend in brief

- **Title**: *SRv6 for Deterministic Path Placement in AI Backends* (Informational).
- **Authors (-05)**: Cisco, OpenAI, Microsoft, Oracle, IBM, NVIDIA and Arrcus.
- **History**: started as `draft-filsfils-spring-srv6-ai-backend-00` (April 2025); -00 to -02 in July–August 2025, -03 in March 2026, -04 in June 2026, which added the statically provisioned fabric and the MRC deployment section, and -05 in September 2026.
- **Content**: no new protocol. It specifies how a NIC uses H.Encaps.Red with uN (or uA) uSIDs to pin each packet's path, why the fabric can be static, how to probe deterministically, how to extend across data centers, and its security considerations.

## Other IETF drafts on SRv6 for AI

| Draft | Authors' organizations | Topic |
|-------|------------------------|-------|
| [draft-filsfils-srv6ops-srv6-e2e-dc-frontend-wan](https://datatracker.ietf.org/doc/draft-filsfils-srv6ops-srv6-e2e-dc-frontend-wan/) | Cisco, Deutsche Telekom, Nebius | SRv6 uSID end to end from tenant workloads through the DC frontend to the WAN, for GPU clouds |
| [draft-hss-srv6ops-srv6-routing-planes](https://datatracker.ietf.org/doc/draft-hss-srv6ops-srv6-routing-planes/) | HPE, Microsoft, NVIDIA | BGP-based logical SRv6 routing planes in a DC, for AI/ML traffic separation |
| [draft-cheng-spring-srv6-for-ai-network](https://datatracker.ietf.org/doc/draft-cheng-spring-srv6-for-ai-network/) | China Mobile, New H3C | SRv6 compressed-SID TE inside AI data centers, with pre-installed paths switched on failure or congestion |
| [draft-lll-srv6ops-qp-aware-srv6-lb](https://datatracker.ietf.org/doc/draft-lll-srv6ops-qp-aware-srv6-lb/) | China Mobile | Choosing SRv6 segment lists per RDMA queue pair on AI DCI WANs |
| [draft-lll-srv6ops-dci-srv6-lb](https://datatracker.ietf.org/doc/draft-lll-srv6ops-dci-srv6-lb/) | China Mobile, Huawei, New H3C, ZTE | Closed-loop SRv6 load balancing for AI DCI using telemetry and BGP Flowspec |
| [draft-hu-rtgwg-rocev2-fcn](https://datatracker.ietf.org/doc/draft-hu-rtgwg-rocev2-fcn/) | China Telecom, Huawei | Fast congestion notification for RoCEv2 carried over SRv6 WAN tunnels |
| [draft-hu-acn-rocev2](https://datatracker.ietf.org/doc/draft-hu-acn-rocev2/) | China Telecom, Huawei | SRv6 SIDs that carry congestion notifications across WAN and DC domains |
| [draft-li-spring-rdma-multicast-over-srv6](https://datatracker.ietf.org/doc/draft-li-spring-rdma-multicast-over-srv6/) | China Mobile, Centec | An End.MT behavior for RDMA multicast, for parameter and KV-cache distribution |
| [draft-liu-idr-bgp-ls-sr-policy-spray-state](https://datatracker.ietf.org/doc/draft-liu-idr-bgp-ls-sr-policy-spray-state/) | ZTE | Reporting via BGP-LS when an SR Policy candidate path is used for packet spraying |
| [draft-clad-rtgwg-ipfrr-aiml](https://datatracker.ietf.org/doc/draft-clad-rtgwg-ipfrr-aiml/) | Cisco, Alibaba | Requirements for sub-100 µs convergence in AI DC and DCI fabrics |
| [draft-abdelsalam-rtgwg-ipfrr-bgp-only-network](https://datatracker.ietf.org/doc/draft-abdelsalam-rtgwg-ipfrr-bgp-only-network/) | Cisco, Alibaba Cloud | IP fast reroute for BGP-only fabrics such as SONiC AI fabrics |

### Related, not SRv6-specific

| Draft | Topic |
|-------|-------|
| [draft-hcl-rtgwg-ai-network-problem](https://datatracker.ietf.org/doc/draft-hcl-rtgwg-ai-network-problem/) | Gap analysis and requirements for AI networks (ByteDance, New H3C) |
| [draft-cheng-rtgwg-enhanced-ecmp](https://datatracker.ietf.org/doc/draft-cheng-rtgwg-enhanced-ecmp/) | Enhanced ECMP against hash collisions in AI clusters |
| [draft-hu-6man-ipv6-flowlabel-load-balancing-rdma](https://datatracker.ietf.org/doc/draft-hu-6man-ipv6-flowlabel-load-balancing-rdma/) | Folding the RoCEv2 QP into the IPv6 Flow Label for per-QP ECMP |
| [draft-yang-6man-wide-area-packet-spraying](https://datatracker.ietf.org/doc/draft-yang-6man-wide-area-packet-spraying/) | Order-preserving packet spraying across WAN paths between AI data centers |
| [draft-calabria-bmwg-ai-fabric-training-bench](https://datatracker.ietf.org/doc/draft-calabria-bmwg-ai-fabric-training-bench/) | Benchmarking methodology for AI training fabrics |

## Open source: SONiC, SAI and FRR

| Component | SRv6-for-AI status |
|-----------|-------------------|
| **SONiC 202505** | Static SRv6 via CONFIG_DB (`SRV6_MY_LOCATORS`, `SRV6_MY_SIDS`) with uN and uDT46; announced as SRv6 support for source-routed AI backends |
| **SONiC 202511** | Ships FRR 10.4.1 (static uA available in FRR); CONFIG_DB still uN and uDT46 |
| **SONiC 202605** | Ships FRR 10.5.4; CONFIG_DB still uN and uDT46 |
| **SONiC master** | uA in CONFIG_DB (merged August 2026), FRR 10.7.1, warm-boot for static SIDs |
| **SAI** | `saisrv6.h` defines uN, uA, uDT4/6/46 and uDX4/6 endpoint behaviors and reduced-encapsulation SID lists |
| **FRR 10.4 / 10.5** | Static uA (10.4); multiple uSID locators, F4816 and static uSID in the global table (10.5) |

The 2025 SONiC AI-backend effort merged 122 pull requests across SAI, SONiC and FRR. By mid-2026 the overall SRv6 work totaled more than 460 pull requests, led by Cisco with Microsoft, Alibaba, Broadcom and NVIDIA. Details: [SONiC](../implementations/sonic.md), [SONiC & SAI](../topics/sonic-sai.md), [FRRouting](../implementations/frrouting.md).

## Key papers and talks

| Date | Source | Why it matters |
|------|--------|----------------|
| Jan 2026 | [Microsoft Research, MSR-TR-2026-6](https://www.microsoft.com/en-us/research/publication/towards-fully-controllable-packet-steering-for-ai-backend-networks-with-srv6/) | Position paper: SRv6 as a single, host-driven, per-packet control mechanism for AI backends |
| Feb 2026 | [NANOG 96, Cisco + Microsoft](https://storage.googleapis.com/site-media-prod/meetings/NANOG96/5611/20260202_Camarillo_Ai_Backend_Deploying_v1.pdf) | Deploying SRv6 uSID and SONiC for deterministic load balancing |
| May 2026 | [MRC + SRv6 paper (arXiv 2605.04333)](https://arxiv.org/abs/2605.04333) | Production design and results from OpenAI and Microsoft clusters |
| Oct 2026 | [OCP Global Summit talks](https://www.segment-routing.net/conferences/2026-10-15-ocp-summit26-openai-clustermapper/) | OpenAI Clustermapper, Meta SRv6 backbone, Alibaba per-job TE, Google Virgo |

## Frequently Asked Questions

### Is there an IETF standard for SRv6 in AI data centers?

The data-plane standards already exist: RFC 8986 (behaviors) and RFC 9800 (uSID). The AI-specific usage is described in draft-filsfils-srv6ops-srv6-ai-backend, an Informational individual draft at revision -05 (September 2026) whose authors requested working-group adoption at IETF 126. It defines no new protocol.

### Is MRC an IETF standard?

No. MRC (Multipath Reliable Connection) is an Open Compute Project specification, OCP MRC 1.0, released in May 2026. It uses SRv6 as one of its forwarding modes.

## Further Reading

- :material-arrow-right: [SRv6 for AI](index.md) - The hub
- :material-arrow-right: [RFCs & Standards](../rfcs/index.md) - All SRv6 RFCs explained
- :material-arrow-right: [MRC and SRv6](mrc.md) - The OCP specification in depth

## References

1. [draft-filsfils-srv6ops-srv6-ai-backend history](https://datatracker.ietf.org/doc/draft-filsfils-srv6ops-srv6-ai-backend/history/) - Revision dates
2. [IETF 126 srv6ops: SRv6 in AI Backend](https://datatracker.ietf.org/meeting/126/materials/slides-126-srv6ops-34-srv6-in-ai-backend-01) - Request for WG adoption
3. [IETF 126 srv6ops: SRv6 in SONiC](https://datatracker.ietf.org/meeting/126/materials/slides-126-srv6ops-23-srv6-sonic-01) - SONiC/SAI/FRR contribution figures
4. [SONiC Static SRv6 Configuration HLD](https://github.com/sonic-net/SONiC/blob/master/doc/srv6/srv6_static_config_hld.md) - CONFIG_DB schema
5. [sonic-buildimage PR #27903](https://github.com/sonic-net/sonic-buildimage/pull/27903) - uA support in bgpcfgd
6. [SAI saisrv6.h](https://github.com/opencomputeproject/SAI/blob/master/inc/saisrv6.h) - SRv6 behaviors in the switch abstraction interface
7. [FRR 10.4.0 release](https://github.com/FRRouting/frr/releases/tag/frr-10.4.0) and [FRR 10.5.0 release](https://github.com/FRRouting/frr/releases/tag/frr-10.5.0) - SRv6 features
8. [Ultra Ethernet specifications](https://ultraethernet.org/specification) - UEC 1.0 and later
