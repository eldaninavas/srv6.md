---
title: Nokia SR OS
description: SRv6 on Nokia SR OS — classic SIDs and micro-segment (uSID) SRv6 side by side, services, protection and platforms
tags:
  - implementations
  - nokia
  - usid
  - service-provider
---

# SRv6 on Nokia SR OS

Nokia SR OS supports SRv6 in two forms: **classic** (full-length SIDs per RFC 8986) and **micro-segment SRv6 (uSID)**, which Nokia describes as an extension of the SRv6 network-programming model rather than a replacement. Both can run on the same router at the same time, and Nokia's application note states that uSIDs and classic SIDs can be combined **in the same segment list** — keeping most of the path compressed while still carrying a full-length service or function SID where needed.

## Key Characteristics

| Aspect | Detail | Source |
|--------|--------|--------|
| SID modes | Classic SRv6 and micro-segment SRv6 concurrently on one platform; SIDs of each type must come from **different SID blocks** | SR OS 26.7 user guide |
| Mixing in a segment list | uSID containers and classic SIDs can be used together in one segment list | Application note |
| Classic SID length | Variable: 32-bit, 16-bit or 128-bit | Application note |
| uSID container | 32-bit block carrying up to six 16-bit uSIDs; uSIDs are global (node) or local (adjacency, service, function) | Application note |
| uSID allocation | `global-sid-entries` (default 16) splits the 16-bit space: `0x0000-0x3FFF` global, `0x4000-0xFFFF` local; `block-length` must be identical network-wide | SR OS 26.7 user guide |
| Maximum SID depth | Up to 9 classic SIDs or 47 uSIDs (including primary path, LFA backup and service SID) | Application note |
| Coexistence | Classic SRv6, uSID and MPLS/SR-MPLS enabled together on the same router, service or IP interface | Application note |

## Behaviors (SR OS 26.7)

| Mode | Behaviors |
|------|-----------|
| **Micro-segment** | uN and uA (advertised by IS-IS); uDT4, uDT6, uDT46, uDX2, uDT2U, uDT2M (BGP services or static) |
| **Classic** | End and End.X (with PSP/USP/USD flavors), End.DT4, End.DT6, End.DT46, End.DX2 |

## Services and Traffic Engineering

| Area | Supported (classic and uSID) |
|------|------------------------------|
| **L3 services** | Base-router BGP routes, VPRN (IP-VPN), EVPN-IFL |
| **L2 services** | EVPN-VPLS and EVPN-VPWS with single-active or all-active multihoming |
| **Multicast** | Point-to-multipoint SRv6 policy tunnels for multicast replication (see [Multicast](../topics/multicast.md)) |
| **IGP** | IS-IS, including Flex-Algo |
| **TE** | Flex-Algo; SRv6 policies configured statically, via BGP SR-TE policy AF, or from a PCE over PCEP ([RFC 9603](../rfcs/rfc9603.md)) |
| **Protection** | LFA, remote LFA, TI-LFA (link, node, SRLG); SR OS originates and terminates repair tunnels with `H.Insert.Red` and can terminate `H.Encaps.Red` repair tunnels from other vendors |
| **Gateway** | Interworking between MPLS, SR-MPLS, SRv6 classic, SRv6 uSID, VXLAN and MPLS-over-UDP at transport and service layers |

!!! tip "Multi-vendor TI-LFA"
    SR OS builds TI-LFA and remote-LFA repair tunnels with `H.Insert.Red`, while some other implementations use `H.Encaps.Red`. The SR OS guide describes a termination mode to accept encapsulated repair tunnels — check this when mixing vendors in one IGP domain. See [TI-LFA](../topics/ti-lfa.md).

## Platforms

The SR OS 26.7 Segment Routing and PCE User Guide's SRv6 chapter applies to the **7450 ESS, 7750 SR, 7950 XRS and VSR**. The application note covers "Nokia routing platforms" generically and refers to product documentation for per-platform support.

## Further Reading

- :material-arrow-right: [Implementations Overview](index.md)
- :material-arrow-right: [uSID Compression](../topics/usid-compression.md) - How uSID containers and shift-and-forward work
- :material-arrow-right: [Interworking & Migration](../topics/interworking-migration.md) - MPLS/SRv6 gateway designs
- :material-arrow-right: [EVPN Multihoming](../topics/evpn-multihoming.md) - All-active EVPN over SRv6

## References

1. [Nokia: Segment Routing IPv6 (SRv6) on Nokia routing platforms — Application note](https://onestore.nokia.com/asset/f/213966) - 2024 application note: uSID as an extension of SRv6, mixing uSID and classic SIDs, services, TE, protection, gateway
2. [Nokia SR OS 26.7 Segment Routing and PCE User Guide: Segment routing with IPv6 data plane (SRv6)](https://documentation.nokia.com/sr/26-7/7x50-shared/segment-routing-pce-user/segment-rout-with-ipv6-data-plane-srv6.html) - Official SRv6 configuration guide: classic and micro-segment modes, behaviors, IS-IS, BGP services, TI-LFA
3. [RFC 9800](https://datatracker.ietf.org/doc/rfc9800/) - Compressed SRv6 Segment List Encoding (NEXT-C-SID, the IETF form of uSID)
