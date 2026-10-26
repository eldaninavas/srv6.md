---
title: Nokia SR OS
seo_title: "SRv6 on Nokia SR OS: Classic SIDs and uSID"
description: SRv6 on Nokia SR OS — classic SIDs and micro-segment (uSID) SRv6 side by side, services, protection and platforms
tags:
  - implementations
  - nokia
  - usid
  - service-provider
---

# SRv6 on Nokia SR OS

Nokia SR OS supports SRv6 in two forms: **classic** (full-length SIDs per RFC 8986) and **micro-segment SRv6 (uSID)**, which Nokia describes as an extension of the SRv6 network-programming model rather than a replacement. Both can run on the same router at the same time, and Nokia's application note states that uSIDs and classic SIDs can be combined **in the same segment list** — keeping most of the path compressed while still carrying a full-length service or function SID where needed. SRv6 first shipped in **SR OS 21.5.R2 on FP4-based hardware** (IS-IS, VPRN, Flex-Algo, LFA/TI-LFA); EVPN-IFL followed in 22.5.R1 and EVPN-VPLS/VPWS and SRv6 policies in 22.7.R1.

## Key Characteristics

| Aspect | Detail | Source |
|--------|--------|--------|
| SID modes | Classic SRv6 and micro-segment SRv6 concurrently on one platform; SIDs of each type must come from **different SID blocks** | SR OS 26.7 user guide |
| Mixing in a segment list | uSID containers and classic SIDs can be used together in one segment list | Application note |
| Classic SID length | Variable: 32-bit, 16-bit or 128-bit | Application note |
| uSID container | 32-bit block carrying up to six 16-bit uSIDs; uSIDs are global (node) or local (adjacency, service, function) | Application note |
| uSID allocation | `global-sid-entries` (default 16) splits the 16-bit space: `0x0000-0x3FFF` global, `0x4000-0xFFFF` local; `block-length` must be identical network-wide | SR OS 26.7 user guide |
| Maximum SID depth | The application note quotes up to 9 classic SIDs or 47 uSIDs including primary path, LFA backup and service SID. The configurable limit per SR policy segment list is 7 classic segments or 24 micro-segments (42 uSIDs with pre-compressed containers) | Application note; SR OS 26.7 user guide |
| Coexistence | Classic SRv6, uSID and MPLS/SR-MPLS enabled together on the same router, service or IP interface | Application note |

## Behaviors (SR OS 26.7)

| Mode | Behaviors |
|------|-----------|
| **Micro-segment** | uN and uA (advertised by IS-IS); uDT4, uDT6, uDT46, uDX2, uDT2U, uDT2M (BGP services or static) |
| **Classic** | End and End.X (with PSP/USP/USD flavors), End.DT4, End.DT6, End.DT46, End.DX2, End.DT2U, End.DT2M; End.B6.Encaps.Red as the SR policy binding SID |
| **Headend** | H.Encaps.Red and H.Encaps.L2.Red only (plain H.Encaps and H.Encaps.L2 are not supported); H.Insert.Red for LFA repair |
| **Not supported** | End.T, End.DX4, End.DX6 |

## Services and Traffic Engineering

| Area | Supported (classic and uSID) |
|------|------------------------------|
| **L3 services** | Base-router BGP routes, VPRN (IP-VPN), EVPN-IFL |
| **L2 services** | EVPN-VPLS and EVPN-VPWS with single-active or all-active multihoming |
| **Multicast** | Tree-SID SRv6 (replication segments) for NG-MVPN I-PMSI/S-PMSI, first documented in 25.3: static CLI configuration, classic SIDs only, no LFA or BFD protection (see [Multicast](../topics/multicast.md)) |
| **IGP** | IS-IS, including Flex-Algo |
| **TE** | Flex-Algo; SRv6 policies configured statically or via the BGP SR Policy address family (22.7.R1), or from a PCE over PCEP ([RFC 9603](../rfcs/rfc9603.md), first documented in 26.7) |
| **IGP** extras | IS-IS MT0 and MT2; microloop avoidance for SRv6 (first documented in 26.3); BGP-LS export of SRv6 information (IS-IS only) |
| **OAM** | Ping and traceroute to SRv6 SIDs, VRF prefixes and SRv6 policies |
| **Protection** | LFA, remote LFA, TI-LFA (link, node, SRLG); SR OS originates and terminates repair tunnels with `H.Insert.Red` and can terminate `H.Encaps.Red` repair tunnels from other vendors |
| **Gateway** | Interworking between MPLS, SR-MPLS, SRv6 classic, SRv6 uSID, VXLAN and MPLS-over-UDP at transport and service layers |

!!! tip "Multi-vendor TI-LFA"
    SR OS builds TI-LFA and remote-LFA repair tunnels with `H.Insert.Red`, while some other implementations use `H.Encaps.Red`. The SR OS guide describes a termination mode to accept encapsulated repair tunnels — check this when mixing vendors in one IGP domain. See [TI-LFA](../topics/ti-lfa.md).

## Platforms

The SR OS 26.7 Segment Routing and PCE User Guide's SRv6 chapter applies to the **7450 ESS, 7750 SR, 7950 XRS and VSR**. Nokia's advanced configuration guides add the hardware condition: SRv6 "is supported on FP4-based equipment in SR OS Release 21.5.R2 and later", and the EVPN chapters require FP4-based network ports. The application note covers "Nokia routing platforms" generically.

**SR Linux** (Nokia's data-center NOS) is a separate implementation: its SRv6 chapter first appears in SR Linux 26.3 and lists the 7730 SXR and the 7220 IXR-H5/H6, the latter as basic uSID transit nodes for AI back-end fabrics. EVPN-VPLS (MAC-VRF) over SRv6 is not supported there.

## Further Reading

- :material-arrow-right: [Implementations Overview](index.md)
- :material-arrow-right: [SRv6 Support Matrix](support-matrix.md) - SR OS feature by feature next to IOS-XR, Junos, EOS, VRP and open-source platforms
- :material-arrow-right: [uSID Compression](../topics/usid-compression.md) - How uSID containers and shift-and-forward work
- :material-arrow-right: [MPLS to SRv6 Migration](../topics/interworking-migration.md) - MPLS/SRv6 gateway designs
- :material-arrow-right: [EVPN Multihoming](../topics/evpn-multihoming.md) - All-active EVPN over SRv6

## References

1. [Nokia: Segment Routing IPv6 (SRv6) on Nokia routing platforms — Application note](https://onestore.nokia.com/asset/f/213966) - 2024 application note: uSID as an extension of SRv6, mixing uSID and classic SIDs, services, TE, protection, gateway
2. [Nokia SR OS 26.7 Segment Routing and PCE User Guide: Segment routing with IPv6 data plane (SRv6)](https://documentation.nokia.com/sr/26-7/7x50-shared/segment-routing-pce-user/segment-rout-with-ipv6-data-plane-srv6.html) - Official SRv6 configuration guide: classic and micro-segment modes, behaviors, IS-IS, BGP services, TI-LFA
3. [RFC 9800](https://datatracker.ietf.org/doc/rfc9800/) - Compressed SRv6 Segment List Encoding (NEXT-C-SID, the IETF form of uSID)
4. [Nokia Advanced Configuration Guide: Segment Routing with IPv6 Data Plane](https://documentation.nokia.com/acg/25-3-2/books/segment-routing-and-pce-classic/c233-seg-rout-ipv6.html) - SRv6 on FP4-based equipment from SR OS 21.5.R2
5. [Nokia SR OS 26.7 Multicast Guide: SR P2MP policy](https://documentation.nokia.com/sr/26-7/7x50-shared/multicast/sr-p2mp-policy.html) - Tree-SID SRv6 for NG-MVPN and its restrictions
6. [Nokia SR Linux 26.7 Segment Routing Guide: SRv6](https://documentation.nokia.com/srlinux/26-7/books/segment-routing/segment_routing_with_ipv6_data_plane_srv6.html) - SR Linux SRv6 platforms and features
