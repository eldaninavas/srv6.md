---
title: RFCs & Standards
description: Comprehensive reference for all SRv6-related IETF RFCs
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
| [RFC 9800](rfc9800.md) | Compressed SRv6 Segment List Encoding | Jun 2025 | uSID / micro-SID compression (NEXT-C-SID, REPLACE-C-SID) |

## Routing Protocol Extensions

| RFC | Title | Date | Summary |
|-----|-------|:----:|---------|
| [RFC 9352](rfc9352.md) | IS-IS Extensions for SRv6 | Feb 2023 | IS-IS TLVs for SRv6 locators and SIDs |
| [RFC 9513](rfc9513.md) | OSPFv3 Extensions for SRv6 | Dec 2023 | OSPFv3 TLVs for SRv6 locators and SIDs |
| [RFC 9350](rfc9350.md) | IGP Flexible Algorithm | Feb 2023 | Constraint-based path computation (Flex-Algo) |
| [RFC 9514](rfc9514.md) | BGP-LS Extensions for SRv6 | Dec 2023 | BGP-LS for SRv6 SID advertisement to SDN controllers |

## Services & Overlay

| RFC | Title | Date | Summary |
|-----|-------|:----:|---------|
| [RFC 9252](rfc9252.md) | BGP Overlay Services Based on SRv6 | Jul 2022 | L3VPN, EVPN, and Internet services over SRv6 |
| [RFC 9256](rfc9256.md) | SR Policy Architecture | Jul 2022 | SR Policy framework for traffic engineering |
| [RFC 9433](rfc9433.md) | SRv6 for the Mobile User Plane | Jul 2023 | MUP behaviors replacing GTP-U for 5G |

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
| `draft-ietf-idr-sr-policy-safi` | BGP SR Policy SAFI |
| `draft-filsfils-srv6ops-srv6-ai-backend` | SRv6 deterministic path placement for AI backends |
| `draft-ietf-spring-srv6-yang` | YANG data model for SRv6 |

!!! info "Stay Updated"
    IETF drafts change frequently. Check [datatracker.ietf.org](https://datatracker.ietf.org) for the latest versions.
