---
title: RFCs & Standards
seo_title: "SRv6 RFCs and IETF Standards: Complete Reference"
description: "Every SRv6 RFC explained: SRH, network programming, uSID compression, BGP services, IGP extensions, SR Policy, OAM and multicast, with plain-language summaries."
tags:
  - rfcs
  - standards
---

# :material-file-document: RFCs & Standards

Comprehensive reference for all SRv6-related IETF RFCs, with summaries, behavior tables, common pitfalls, and links to related drafts.

## Architecture & Foundation

| RFC | Title | Date | Summary |
|-----|-------|:----:|---------|
| [RFC 8402](rfc8402.md) | Segment Routing Architecture | Jul 2018 | Foundational SR architecture for both MPLS and IPv6 data planes |

## SRv6 Data Plane

| RFC | Title | Date | Summary |
|-----|-------|:----:|---------|
| [RFC 8754](rfc8754.md) | IPv6 Segment Routing Header (SRH) | Mar 2020 | SRH format, processing rules, HMAC security |
| [RFC 8986](rfc8986.md) | SRv6 Network Programming | Feb 2021 | All SRv6 behaviors (End, End.X, End.DT4, PSP/USP/USD...) |
| [RFC 9602](rfc9602.md) | SRv6 SIDs in the IPv6 Addressing Architecture | Oct 2024 | IANA `5f00::/16` block for SRv6 SIDs |
| [RFC 9800](rfc9800.md) | Compressed SRv6 Segment List Encoding | Jun 2025 | uSID / micro-SID compression (NEXT-C-SID, REPLACE-C-SID) |

## Routing Protocol Extensions

| RFC | Title | Date | Summary |
|-----|-------|:----:|---------|
| [RFC 9352](rfc9352.md) | IS-IS Extensions for SRv6 | Feb 2023 | IS-IS TLVs for SRv6 locators and SIDs |
| [RFC 9513](rfc9513.md) | OSPFv3 Extensions for SRv6 | Dec 2023 | OSPFv3 TLVs for SRv6 locators and SIDs |
| [RFC 9350](rfc9350.md) | IGP Flexible Algorithm | Feb 2023 | Constraint-based path computation (Flex-Algo) |
| [RFC 9514](rfc9514.md) | BGP-LS Extensions for SRv6 | Dec 2023 | BGP-LS for SRv6 SID advertisement to SDN controllers |

## Controllers & Provisioning

| RFC | Title | Date | Summary |
|-----|-------|:----:|---------|
| [RFC 9603](rfc9603.md) | PCEP Extensions for IPv6 Segment Routing | Jul 2024 | SRv6 path setup type, SRv6-ERO/RRO for PCE-computed SRv6 paths |
| [RFC 9857](rfc9857.md) | Advertisement of SR Policies Using BGP-LS | Oct 2025 | Reports SR Policy candidate-path state (incl. SRv6 BSIDs) to controllers |
| [RFC 10038](rfc10038.md) | Distributing the SRv6 Locator Using DHCPv6 | Aug 2026 | DHCPv6 options to lease SRv6 locators to CPEs and other endpoints |

## Services & Overlay

| RFC | Title | Date | Summary |
|-----|-------|:----:|---------|
| [RFC 9252](rfc9252.md) | BGP Overlay Services Based on SRv6 | Jul 2022 | L3VPN, EVPN, and Internet services over SRv6 |
| [RFC 9256](rfc9256.md) | SR Policy Architecture | Jul 2022 | SR Policy framework for traffic engineering |
| [RFC 9433](rfc9433.md) | SRv6 for the Mobile User Plane | Jul 2023 | MUP behaviors replacing GTP-U for 5G |
| [RFC 9723](rfc9723.md) | BGP Colored Prefix Routing (CPR) for SRv6 Services | May 2025 | Intent-aware inter-AS paths via colored sub-locators (Informational) |
| [RFC 9819](rfc9819.md) | Argument Signaling for BGP Services in SRv6 | Jul 2025 | Updates RFC 9252: End.DT2M ESI-filtering argument signaling |

## Multicast

| RFC | Title | Date | Summary |
|-----|-------|:----:|---------|
| [RFC 9524](rfc9524.md) | SR Replication for Multipoint Service Delivery | Feb 2024 | Replication segment and End.Replicate behavior |
| [RFC 9860](rfc9860.md) | MoFRR Based on TI-LFA | Oct 2025 | PIM standby trees along TI-LFA repair paths (Informational) |
| [RFC 9960](rfc9960.md) | Segment Routing Point-to-Multipoint Policy | Apr 2026 | Tree-SID architecture; updates RFC 9524 |

## Operations & Telemetry

| RFC | Title | Date | Summary |
|-----|-------|:----:|---------|
| [RFC 9259](rfc9259.md) | OAM in SRv6 | Jun 2022 | SRv6 ping, traceroute, O-flag |
| [RFC 9487](rfc9487.md) | IPFIX for SRv6 | Nov 2023 | 11 IPFIX Information Elements for SRv6 telemetry |
| [RFC 9855](rfc9855.md) | TI-LFA Using Segment Routing | Oct 2025 | Sub-50ms fast reroute with 100% topology coverage |

## IETF Drafts (Active)

| Draft | Topic |
|-------|-------|
| `draft-ietf-spring-sr-service-programming` | SR proxy behaviors (End.AS, End.AD, End.AM) for service chaining |
| `draft-ietf-spring-srv6-security` | Security analysis of the SRv6 data plane |
| `draft-ietf-ippm-ioam-srv6-options` | In-situ OAM (IOAM) data fields in SRv6 |
| `draft-filsfils-spring-path-tracing` | Lightweight path tracing for SRv6 |
| `draft-ietf-pce-sr-p2mp-policy` | PCEP signaling for SR P2MP Policy (Tree-SID) |
| `draft-filsfils-srv6ops-srv6-ai-backend` | SRv6 deterministic path placement for AI backends |
| `draft-ietf-spring-srv6-yang` | YANG data model for SRv6 |

!!! note "Recently published"
    The BGP SR Policy SAFI drafts are now [RFC 9830](https://datatracker.ietf.org/doc/rfc9830/) (Advertising SR Policies in BGP) and [RFC 9831](https://datatracker.ietf.org/doc/rfc9831/) (Segment Type Extensions for BGP SR Policy).

!!! info "Stay Updated"
    IETF drafts change frequently. Check [datatracker.ietf.org](https://datatracker.ietf.org) for the latest versions.
