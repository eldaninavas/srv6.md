---
title: Cisco IOS-XR
seo_title: "SRv6 on Cisco IOS-XR: uSID and L3VPN Configuration"
description: "Configure SRv6 on Cisco IOS-XR: supported NCS, ASR 9000 and Cisco 8000 platforms and releases, uSID locator and IS-IS setup, L3VPN over SRv6, and verification."
tags:
  - implementations
  - cisco
  - ios-xr
---

# SRv6 on Cisco IOS-XR

Cisco IOS-XR has supported SRv6 since **Release 6.6.1** (full-length SIDs, IS-IS, TI-LFA, L3VPN and OAM on NCS 5500 and ASR 9000). SRv6 uSID (F3216, the NEXT-C-SID flavor of [RFC 9800](../rfcs/rfc9800.md)) arrived in **7.3.1** and is what Cisco has built most later features on: EVPN-VPWS (7.3.2), EVPN E-LAN (7.5.2), End.DT46 (7.8.1), path MTU discovery and traffic accounting. Full-length SIDs are still documented in the 26.x guides, but only one SID format can be used per network. Per-platform release numbers for every feature are in the [SRv6 Support Matrix](support-matrix.md).

## Supported Platforms

| Platform | SRv6 notes |
|----------|-----------|
| NCS 5500 / 5700 | First-generation NCS 5500 (Jericho) needs `hw-module profile segment-routing srv6 mode micro-segment format f3216` and a reload before uSID works; NCS 5700 sets the format under `segment-routing srv6` |
| NCS 540 | uSID L3VPN and transport, as in the XRdocs tutorial series |
| ASR 9000 | 3rd-, 4th- and 5th-generation line cards and IOS XRv 9000 |
| Cisco 8000 (Silicon One) | Q200-based systems and later only; "SRv6 is not supported on Q100-based line cards and fixed-port routers" |

Documented gaps worth knowing before a design review: SRv6 Tree-SID / P2MP multicast is not supported (Tree-SID is SR-MPLS only), per-CE uDX4/uDX6 allocation is not supported with uSID, PCE-initiated SRv6 policies are listed as unsupported, and the BGP SR Policy SAFI does not carry SRv6 segments.

## Basic Configuration

```cisco
!! Enable SRv6
segment-routing
 srv6
  locators
   locator MAIN
    micro-segment behavior unode psp-usd
    prefix fc00:0:1::/48
   !
  !
 !
!

!! Enable SRv6 in IS-IS
router isis CORE
 address-family ipv6 unicast
  segment-routing srv6
   locator MAIN
  !
 !
!

!! SRv6-based L3VPN
vrf CUSTOMER-A
 address-family ipv4 unicast
  import route-target 100:1
  export route-target 100:1
 !
!

router bgp 65000
 vrf CUSTOMER-A
  rd auto
  address-family ipv4 unicast
   segment-routing srv6
    locator MAIN
    alloc mode per-vrf
   !
  !
 !
!
```

## Verification Commands

```cisco
show segment-routing srv6 locator
show segment-routing srv6 sid
show segment-routing srv6 manager
show isis segment-routing srv6 locators
show bgp vpnv4 unicast vrf CUSTOMER-A
```

## Further Reading

- :material-arrow-right: [GNS3 Labs](../labs/gns3.md) - Test with IOS-XR images
- :material-web: [Cisco ASR 9000 SRv6 Micro-SID Configuration Guide (24.x)](https://www.cisco.com/c/en/us/td/docs/routers/asr9000/software/24xx/segment-routing/configuration/guide/b-segment-routing-cg-asr9000-24xx/configure-srv6-micro-sid.html)
- :material-arrow-right: [SRv6 Support Matrix](support-matrix.md) - IOS-XR next to IOS-XE, Junos, EOS, SR OS and open-source platforms
- :material-arrow-right: [Cisco IOS-XE](cisco-ios-xe.md) - SRv6 uSID on Cisco's enterprise and edge OS
- :material-arrow-right: [netlab Labs](../labs/netlab.md) - IOS-XR SRv6 lab topologies

## References

1. [Segment Routing Configuration Guide for Cisco NCS 5500 Series Routers](https://www.cisco.com/c/en/us/td/docs/iosxr/ncs5500/segment-routing/24xx/configuration/guide/b-segment-routing-cg-ncs5500-24xx/configure-srv6-micro-sid.html) - Official Cisco IOS-XR SRv6 micro-SID configuration guide for NCS 5500
2. [SRv6 Transport on NCS 5500/500 - Part 1 (XRdocs)](https://xrdocs.io/ncs5500/tutorials/srv6-transport-on-ncs-part-1) - XRdocs tutorial series on SRv6 transport configuration
3. [Implementing Layer 3 VPN over SRv6 Transport on NCS 5500/500 (XRdocs)](https://xrdocs.io/ncs5500/tutorials/srv6-transport-on-ncs-part-2) - XRdocs tutorial on L3VPN services over SRv6
4. [Cisco Converged SDN Transport SRv6 High Level Design (XRdocs)](https://xrdocs.io/design/blogs/latest-converged-sdn-transport-srv6) - SRv6 transport design guide for converged SDN networks
5. [Cisco NCS 5500 Series Product Page](https://www.cisco.com/c/en/us/support/routers/network-convergence-system-5500-series/series.html) - NCS 5500 platform support portal with SRv6-capable hardware information
6. [Cisco NCS 5500 Release Notes for IOS XR 6.6.1](https://www.cisco.com/c/en/us/td/docs/iosxr/ncs5500/general/66x/release/notes/b-release-notes-ncs5500-r661.html) - First SRv6 release: SRv6 base, IS-IS, TI-LFA, L3VPN and OAM
7. [Cisco 8000 SRv6 Configuration Guide: Limitations of SRv6](https://www.cisco.com/c/en/us/td/docs/iosxr/cisco8000/SRv6/srv6-config-guide-cisco8000/srv6-fundamentals-and-key-concepts/limitations-of-srv6.html) - Q200-only support on Cisco 8000 and other restrictions
8. [Cisco 8000 Segment Routing Configuration Guide 26.x: Tree-SID](https://www.cisco.com/c/en/us/td/docs/iosxr/cisco8000/segment-routing/26xx/configuration/guide/b-segment-routing-cg-cisco8000-26xx/segment-routing-tree-segment-identifier.html) - Tree-SID is SR-MPLS only; SRv6 Tree-SID is not supported
