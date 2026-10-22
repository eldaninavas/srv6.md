---
title: SRv6 Documentation
seo_title: "SRv6 Documentation: Official Docs for Every Vendor and Project"
description: "SRv6 documentation index: official SRv6 configuration guides from Cisco, Juniper, Nokia, Arista, 6WIND and H3C, plus Linux, FRRouting, VPP, SONiC, SAI, IETF and IANA."
tags:
  - documentation
  - references
  - implementations
  - SRv6 docs
  - SRv6 documentation
---

# SRv6 Documentation

**The index of SRv6 documentation: the SRv6.md learning path, plus the official SRv6 configuration guides and reference docs of every vendor and open-source project.** Each link goes straight to the SRv6 chapter, not to a generic landing page. Every link was checked on 22 October 2026, against the latest release we could find.

!!! tip "Looking for one place to learn SRv6?"
    Start with [What is SRv6?](../topics/what-is-srv6.md), then follow the [SRv6 fundamentals learning path](../topics/index.md). For design and migration decisions, read the free [SRv6 White Paper 2026](../white-papers/srv6-white-paper-2026.md). Every other public white paper is in the [SRv6 white paper library](../white-papers/index.md).

## SRv6.md documentation

Vendor-neutral documentation, written for engineers, with RFC references on every page.

| Area | Start here | Then |
|------|-----------|------|
| Fundamentals | [What is SRv6?](../topics/what-is-srv6.md) | [SID structure](../topics/sid-structure.md), [SRH and packet walk](../topics/srh-packet-walk.md), [network programming](../topics/network-programming.md), [glossary](../topics/glossary.md) |
| Compression | [uSID](../topics/usid-compression.md) | [SID decoder](../tools/sid-decoder.md), [RFC 9800](../rfcs/rfc9800.md) |
| Control plane | [Flex-Algorithm](../topics/flex-algorithm.md) | [TI-LFA](../topics/ti-lfa.md), [SR Policy](../topics/sr-policy.md), [BGP overlay services](../topics/bgp-overlay-services.md) |
| Operations | [OAM and troubleshooting](../topics/oam-troubleshooting.md) | [SRPM](../topics/srpm.md), [telemetry](../topics/telemetry.md), [security](../topics/security.md) |
| Migration | [Migration from MPLS](../topics/interworking-migration.md) | [SRv6 vs SR-MPLS](../topics/srv6-vs-sr-mpls.md) |
| Vendors | [Support matrix](../implementations/support-matrix.md) | [Implementations](../implementations/index.md) |
| Hands-on | [Labs](../labs/index.md) | [Containerlab](../labs/containerlab.md), [netlab](../labs/netlab.md), [packet captures](../labs/pcaps.md) |
| AI networking | [SRv6 for AI](../ai/index.md) | [MRC and SRv6](../ai/mrc.md), [AI fabric design](../ai/ai-fabric-design.md) |
| Standards | [RFCs & Standards](../rfcs/index.md) | [State of SRv6 2026](../reports/state-of-srv6-2026.md) |

## Vendor documentation

### Cisco IOS XR

Our overview: [Cisco IOS-XR](../implementations/cisco-ios-xr.md).

| Document | Platform and release | Covers |
|----------|---------------------|--------|
| [Segment Routing v6 Configuration Guide for Cisco 8000 Series Routers](https://www.cisco.com/c/en/us/td/docs/iosxr/cisco8000/SRv6/srv6-config-guide-cisco8000.html) | Cisco 8000, IOS XR 26.3.1 | The dedicated SRv6 guide: uSID, locators, IS-IS, Flex-Algo, TI-LFA, PCEP, SRv6-TE, L2/L3VPN, SRv6–MPLS gateways, performance measurement, migration |
| [SRv6 Fundamentals and Key Concepts](https://www.cisco.com/c/en/us/td/docs/iosxr/cisco8000/SRv6/srv6-config-guide-cisco8000/srv6-fundamentals-and-key-concepts.html) | Cisco 8000, 26.3.1 | SRH, SIDs, node roles, headend and endpoint behaviors, SID management |
| [Configure SRv6 with Micro-SIDs (NCS 5500/5700)](https://www.cisco.com/c/en/us/td/docs/iosxr/ncs5500/segment-routing/26xx/configuration/guide/b-segment-routing-cg-ncs5500-26xx/configure-srv6-micro-sid.html) | NCS 5500 and NCS 5700, 26.x | Locators, IS-IS, BGP services and verification. Part of the [NCS 5500 Segment Routing guide](https://www.cisco.com/c/en/us/td/docs/iosxr/ncs5500/segment-routing/26xx/configuration/guide/b-segment-routing-cg-ncs5500-26xx.html) |
| [Configure SRv6 with Micro-SIDs (ASR 9000)](https://www.cisco.com/c/en/us/td/docs/routers/asr9000/software/26xx/segment-routing/configuration/guide/b-segment-routing-cg-asr9000-26xx/configure-srv6-micro-sid.html) | ASR 9000, 26.x | uSID concepts, locators, IS-IS and BGP services. Part of the [ASR 9000 Segment Routing guide](https://www.cisco.com/c/en/us/td/docs/routers/asr9000/software/26xx/segment-routing/configuration/guide/b-segment-routing-cg-asr9000-26xx.html) |

### Cisco IOS XE and NX-OS

Our overview: [Cisco IOS-XE](../implementations/cisco-ios-xe.md).

| Document | Platform and release | Covers |
|----------|---------------------|--------|
| [Segment Routing over IPv6 (IOS XE 17)](https://www.cisco.com/c/en/us/td/docs/ios-xml/ios/seg_routing/configuration/xe-17/segrt-xe-17-book/m_srv6.html) | ASR 1000, Catalyst 8000V/8200/8300/8500, 17.12 to 17.16 | The main IOS XE SRv6 chapter. The full [IOS XE 17 Segment Routing guide](https://www.cisco.com/c/en/us/td/docs/ios-xml/ios/seg_routing/configuration/xe-17/segrt-xe-17-book.html) adds uLoop avoidance, TI-LFA, Flex-Algo, path MTU and multicast VPN over SRv6 |
| [Cisco Nexus 9000 Series NX-OS SRv6 Configuration Guide, Release 10.6(x)](https://www.cisco.com/c/en/us/td/docs/dcn/nx-os/nexus9000/106x/configuration/srv6/cisco-nexus-9000-series-nx-os-srv6-configuration-guide-106x.html) | Nexus 9000, NX-OS 10.6(x) | SRv6, SRv6-TE and SRv6 OAM in the data center |

### Juniper

Our overview: [Juniper](../implementations/juniper.md).

| Document | Platform and release | Covers |
|----------|---------------------|--------|
| [Segment Routing User Guide](https://www.juniper.net/documentation/us/en/software/junos/segment-routing/index.html) | Junos OS, current | Landing page for SR-MPLS, SRv6 and micro-SIDs |
| [SRv6 Network Programming and Layer 3 Services in BGP Networks](https://www.juniper.net/documentation/us/en/software/junos/segment-routing/topics/topic-map/bgp-srv6-network-programming.html) | Junos OS (MX) | BGP L3VPN over SRv6 with End.DT4 and End.DT6 SIDs |
| [Understanding SRv6 Network Programming in IS-IS Networks](https://www.juniper.net/documentation/us/en/software/junos/is-is/topics/concept/isis-srv6-network-programming.html) | Junos OS 20.3R1 and later | IS-IS SRv6 concepts and configuration |
| [SRv6 in AI-ML Data Centers](https://www.juniper.net/documentation/us/en/software/junos/ai-ml-evo/topics/concept/srv6-overview.html) | Junos OS Evolved | SRv6 in AI and ML data center fabrics |
| [Day One: Introduction to SRv6](https://www.juniper.net/documentation/en_US/day-one-books/DayOne-Intro-SRv6.pdf) (PDF) | Junos up to 22.3 | Introductory book, from basics to interworking. Older than the guides above |

### Nokia

Our overview: [Nokia SR OS](../implementations/nokia-sros.md).

| Document | Platform and release | Covers |
|----------|---------------------|--------|
| [Segment routing with IPv6 data plane (SRv6)](https://documentation.nokia.com/sr/26-7/7x50-shared/segment-routing-pce-user/segment-rout-with-ipv6-data-plane-srv6.html) | SR OS 26.7 | SRv6 encapsulation, SID encoding, SRH and PCE, in the Segment Routing and PCE User Guide |
| [Segment Routing and PCE Advanced Configuration Guide for MD CLI](https://documentation.nokia.com/acg/26-3-3/pdf/Segment_Routing_and_PCE_Adv_Config_Guide_for_MD_CLI.pdf) (PDF) | SR OS up to 26.3.R3 | Worked examples: SRv6 base encapsulation, SRv6 LFA, SRv6 policies for L2 and L3 services |
| [Segment routing with IPv6 data plane (SRv6), SR Linux](https://documentation.nokia.com/srlinux/26-7/books/segment-routing/segment_routing_with_ipv6_data_plane_srv6.html) | SR Linux 26.7 | SRv6 on Nokia's data center NOS |

### Arista

Our overview: [Arista EOS](../implementations/arista-eos.md).

| Document | Platform and release | Covers |
|----------|---------------------|--------|
| [Segment Routing Over IPv6 (SRv6)](https://www.arista.com/en/um-eos/eos-segment-routing-over-ipv6-srv6) | EOS 4.36.2F user manual | uSID, locators, SRv6 ping and traceroute, show commands |
| [SRv6 technical notes (TOI)](https://www.arista.com/en/support/toi/tag/srv6) | EOS 4.35.2F to 4.36.2F | Index of feature notes for IS-IS SRv6, static uA, counters and SSU. The notes themselves need an Arista login |

### Huawei and H3C

| Document | Platform and release | Covers |
|----------|---------------------|--------|
| [What Is SRv6? How Does SRv6 Work?](https://info.support.huawei.com/info-finder/encyclopedia/en/SRv6.html) | Huawei, not version-specific | Huawei's public explainer. NetEngine configuration guides are on the Huawei support portal, which requires an account |
| [What Is G-SRv6?](https://info.support.huawei.com/info-finder/encyclopedia/en/G-SRv6.html) | Huawei, not version-specific | Huawei's 32-bit compressed SIDs, standardized as REPLACE-C-SID in [RFC 9800](../rfcs/rfc9800.md) |
| [SRv6 configuration (VSR)](https://www.h3c.com/en/d_202507/2582224_294551_0.htm) | H3C VSR, Comware V7, July 2025 | SRv6 configuration chapter |
| [SRv6 configuration (MSR 5600)](https://www.h3c.com/en/d_202507/2577522_294551_0.htm) | H3C MSR 5600, Comware V7, July 2025 | SRv6 configuration chapter |
| [SRv6 configuration (CR16000-F)](https://www.h3c.com/en/d_202212/1732798_294551_0.htm) | H3C CR16000-F, December 2022 | SRv6 on H3C carrier routers |

### Software routers

| Document | Platform and release | Covers |
|----------|---------------------|--------|
| [SRv6 (6WIND VSR)](https://doc.6wind.com/new/vsr-3/latest/vsr-guide/user-guide/cli/routing/srv6/overview.html) | 6WIND VSR 3.12 | Locators, compressed and uncompressed SIDs, source encapsulation. See also [IS-IS SRv6](https://doc.6wind.com/new/vsr-3/latest/vsr-guide/user-guide/cli/routing/isis/segmentroutingipv6.html) and [BGP VPNs](https://doc.6wind.com/new/vsr-3/latest/vsr-guide/user-guide/cli/routing/bgp/vpn/overview.html) |
| [Segment Routing v6 Configuration (OcNOS-SP)](https://docs.ipinfusion.com/sp-6.3.4-configuration-guide/OcNOS-SP/SegRoute-Config/SR_v6.html) | IP Infusion OcNOS-SP 6.3.4 | SRv6 with IS-IS, locators, VPNv4 SRv6 SIDs and SR-TE |

## Open-source documentation

| Project | Document | Covers | Our page |
|---------|----------|--------|----------|
| Linux kernel | [Seg6 sysctl variables](https://docs.kernel.org/networking/seg6-sysctl.html) | `seg6_enabled`, HMAC and flow label settings | [Linux kernel](../implementations/linux-kernel.md) |
| iproute2 | [ip-route(8)](https://man7.org/linux/man-pages/man8/ip-route.8.html) and [ip-sr(8)](https://man7.org/linux/man-pages/man8/ip-sr.8.html) | `encap seg6` and `seg6local` actions, uSID flavors, tunnel source and HMAC | [Linux kernel](../implementations/linux-kernel.md) |
| FRRouting | [Zebra: Segment-Routing IPv6](https://docs.frrouting.org/en/latest/zebra.html#segment-routing-ipv6), [IS-IS SRv6](https://docs.frrouting.org/en/latest/isisd.html#segment-routing-over-ipv6-srv6), [BGP L3 services over SRv6](https://docs.frrouting.org/en/latest/bgp.html#bgp-based-l3-service-over-srv6), [static SRv6 SIDs](https://docs.frrouting.org/en/latest/static.html#srv6-static-sids-commands) | Locators, IS-IS, L3VPN and static SIDs | [FRRouting](../implementations/frrouting.md) |
| FD.io VPP | [SRv6: Segment Routing for IPv6](https://s3-docs.fd.io/vpp/26.10/developer/corefeatures/sr/sr_doc.html) and [SRv6 plugins](https://s3-docs.fd.io/vpp/26.10/developer/plugins/srv6/index.html) | Local SIDs, policies, steering, SRv6 proxies and mobile plugins | |
| SONiC | [SRv6 HLD](https://github.com/sonic-net/SONiC/blob/master/doc/srv6/srv6_hld.md) and [related designs](https://github.com/sonic-net/SONiC/tree/master/doc/srv6) | SRv6, uSID, static SRv6 configuration and SRv6 VPN on SONiC | [SONiC](../implementations/sonic.md) |
| SAI | [SAI IPv6 Segment Routing](https://github.com/opencomputeproject/SAI/blob/master/doc/SAI-Proposal-IPv6_Segment_Routing-1.md) and [SRv6 VPN](https://github.com/opencomputeproject/SAI/blob/master/doc/SAI-IPv6-Segment-Routing-VPN.md) | The switch ASIC API for SRv6 | [SONiC & SAI](../topics/sonic-sai.md) |
| Cilium | [cilium-dbg bpf srv6](https://docs.cilium.io/en/stable/cmdref/cilium-dbg_bpf_srv6/) | SRv6 BPF map commands (open-source Cilium has no SRv6 feature guide) | [Cilium](../implementations/cilium.md) |
| GoBGP | [MUP SAFI](https://github.com/osrg/gobgp/blob/master/docs/sources/srv6_mup.md) and [BGP-LS](https://github.com/osrg/gobgp/blob/master/docs/sources/bgp-ls.md) | SRv6 Mobile User Plane and SRv6 fields in BGP-LS | |
| Vinbero | [README](https://github.com/takehaya/Vinbero) | XDP/TC SRv6 data plane with built-in GoBGP | [Vinbero](../implementations/vinbero.md) |
| zebra-rs | [SRv6 chapter](https://github.com/zebra-rs/zebra-rs/blob/main/book/src/ch-04-00-srv6.md) | SRv6 and uSID in the Rust routing stack | [zebra-rs](../implementations/zebra-rs.md) |
| P4 | [ngsdn-tutorial: SRv6 exercise](https://github.com/opennetworkinglab/ngsdn-tutorial/blob/advanced/EXERCISE-6.md) | SRv6 in a P4 pipeline (ONF tutorial) | |
| Wireshark | [Routing Header display filters](https://www.wireshark.org/docs/dfref/i/ipv6.routing.html) | `ipv6.routing.srh.*` fields for filtering SRv6 captures | [Packet captures](../labs/pcaps.md) |

## Standards and registries

| Source | Link | Covers |
|--------|------|--------|
| IETF SPRING WG | [datatracker](https://datatracker.ietf.org/wg/spring/about/) | Segment Routing and SRv6 architecture |
| IETF srv6ops WG | [datatracker](https://datatracker.ietf.org/wg/srv6ops/about/) | SRv6 operations and deployment practices |
| IANA | [Segment Routing registries](https://www.iana.org/assignments/segment-routing/segment-routing.xhtml#srv6-endpoint-behaviors) | SRv6 Endpoint Behavior codepoints |
| IANA | [IPv6 Parameters](https://www.iana.org/assignments/ipv6-parameters/ipv6-parameters.xhtml) | Routing Type 4 (SRH), SRH flags and TLVs |
| SRv6.md | [RFCs & Standards](../rfcs/index.md) | Every SRv6 RFC explained, from [RFC 8754](../rfcs/rfc8754.md) to [RFC 10038](../rfcs/rfc10038.md) |

## Missing documentation?

This index only links public documentation that loads without an account. Some vendors (DriveNets, Arrcus, ZTE, and Huawei's configuration guides) keep their SRv6 documentation behind a customer login. If you find a public SRv6 guide that is missing, or a link that broke after a new release, open an issue or pull request on [GitHub](https://github.com/eldaninavas/srv6.md).

## Further Reading

- :material-arrow-right: [SRv6 White Paper 2026](../white-papers/srv6-white-paper-2026.md) - Architecture, design and deployment, free PDF
- :material-arrow-right: [SRv6 white paper library](../white-papers/index.md) - Every public SRv6 white paper with a summary
- :material-arrow-right: [SRv6 Support Matrix](../implementations/support-matrix.md) - Feature support per vendor and project
- :material-arrow-right: [SRv6 fundamentals](../topics/index.md) - The learning path
