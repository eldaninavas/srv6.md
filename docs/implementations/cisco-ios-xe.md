---
title: Cisco IOS-XE
seo_title: "SRv6 on Cisco IOS-XE: uSID Configuration Guide"
description: "Configure SRv6 uSID on Cisco IOS-XE (ASR 1000, Catalyst 8000, 8000 Secure Routers) since 17.12.1a: F3216 locators, IS-IS, per-VRF L3VPN, Flex-Algo and TI-LFA."
tags:
  - implementations
  - cisco
  - ios-xe
---

# SRv6 on Cisco IOS-XE

Cisco's SRv6 story is usually told on [IOS-XR](cisco-ios-xr.md) (NCS, ASR 9000, Cisco 8000), but **IOS-XE has shipped SRv6 since 17.12.1a** (Dublin), as the "Segment Routing over IPv6 Dataplane" feature on the ASR 1000 and Catalyst 8000 edge routers. It is uSID-only (F3216) and covers IS-IS, BGP L3VPN with per-VRF SIDs, local SRv6-TE policies, static routes, performance measurement and OAM. Later 17.x releases added TI-LFA, microloop avoidance, Flex-Algo and multicast VPN. The 2026 CVD [*Quantum-Safe SRv6 Fabric for Mission-Critical Networks*](https://www.cisco.com/c/en/us/td/docs/solutions/CVD/Campus/SRv6_Fabric-Mission-Critical_Networks.html) validated the design on IOS-XE 26.1.1 with the Cisco 8000 Series Secure Routers, which brings SRv6 to the WAN-edge and branch platforms that historically terminated SD-WAN or DMVPN.

## Supported Platforms

| Release | Platforms | Source |
|---------|-----------|--------|
| 17.12.1a | ASR 1000 with RP3 and ESP100-X/ESP200-X, ASR 1001-HX, ASR 1002-HX, Catalyst 8000V, C8200, C8300, C8500/8500L | [IOS XE 17 SR configuration guide](https://www.cisco.com/c/en/us/td/docs/ios-xml/ios/seg_routing/configuration/xe-17/segrt-xe-17-book/m_srv6.html) |
| 26.1.1 | IR1101 industrial router | [IR 26.1.x release notes](https://www.cisco.com/c/en/us/td/docs/routers/IIoT/release-notes/26-1-x/IOT-IR-26-1-x-RN.html) |
| 26.1.1 (CVD) | Cisco 8000 Series Secure Routers (G2) as validated in the CVD, with an ASR 1001-HX route reflector | [CVD](https://www.cisco.com/c/en/us/td/docs/solutions/CVD/Campus/SRv6_Fabric-Mission-Critical_Networks.html) |

## Feature Highlights

| Feature | IOS-XE support | Since |
|---------|----------------|:-----:|
| uSID format | **F3216 only** (`format usid-f3216`), up to 10 uSID locators | 17.12.1a |
| Headend encapsulation | `H.Encaps.Red` (reduced) | 17.12.1a |
| End behaviors | `uN` and `uA` with PSP/USD, `uDT4`, `uDT6`; static End.X from 17.15.1a; `End.DTMC4` (multicast VRF decapsulation) | 17.12.1a |
| uDT46 | Listed as supported, but BGP does not allocate or advertise it, so L3VPN signals uDT4 and uDT6 | — |
| L3VPN SID allocation | **`alloc-mode per-vrf` only**; per-prefix allocation is not supported. ODN for L3VPN from 17.13.1a | 17.12.1a |
| IGP | IS-IS only, with multi-topology IPv6 and wide metrics | 17.12.1a |
| SR-TE | Per-Destination and Per-Flow policies, ePBR + NBAR classification. Dynamic segment lists only; no explicit segment lists, no Binding SIDs, no PCE-initiated policies. PCE-delegated computation from 17.16.1a | 17.12.1a |
| TI-LFA | Yes, with node-protecting / SRLG-disjoint / linecard-disjoint tiebreakers. The guide notes that IGP TI-LFA "cannot guarantee 50ms FRR failover" on this platform | 17.15.1a |
| Microloop avoidance | IS-IS SRv6 microloop avoidance | 17.15.1a |
| Flex-Algo | Up to 8 algorithms, one locator per algorithm, single IS-IS level | 17.18.1a |
| Performance measurement | Two-way active probes, delay advertisement into IS-IS, liveness detection | 17.12.1a |
| OAM | SRv6 OAM; `ping srv6` / `traceroute srv6` commands from 17.16.1a | 17.12.1a |
| Multicast | BGP MVPN with SRv6 ingress replication (`srv6-mcast ingress-replication partitioned`), IPv4 multicast only | 17.18.1a |

Not documented on IOS-XE: EVPN or other L2 services over SRv6, OSPFv3 SRv6, and global-table BGP over SRv6. See the [SRv6 Support Matrix](support-matrix.md) for a side-by-side comparison with IOS-XR and other platforms.

## Basic Configuration

```cisco
! SRv6 process: encapsulation source + F3216 locator
segment-routing srv6
 encapsulation
  source-address FC00::1
  traffic-class propagate
 locators
  locator MAIN
   prefix FCBB:DEAD:1::/48
   format usid-f3216

! IS-IS underlay — multi-topology IPv6 + locator advertisement
router isis 1
 net 49.0000.fc00.0001.00
 is-type level-2-only
 metric-style wide
 advertise link attributes
 distribute link-state
 !
 address-family ipv6
  multi-topology
  router-id Loopback0
  segment-routing srv6
   locator MAIN
   level-2
  fast-reroute ti-lfa level-2

! L3VPN over SRv6 (per-VRF Service SID)
router bgp 65001
 segment-routing srv6
  locator MAIN
 !
 address-family vpnv4
  segment-routing srv6
   locator MAIN
   alloc-mode per-vrf
  neighbor FC00::3 activate
  neighbor FC00::3 send-community extended
```

!!! warning "Ethernet interfaces must be point-to-point"
    IOS-XE treats Ethernet as broadcast by default, which creates IS-IS pseudonodes that **silently break** adjacency-SID allocation and SR-TE path computation. `isis network point-to-point` on every SRv6 core interface is non-negotiable.

!!! note "Per-VRF allocation only"
    Unlike IOS-XR, IOS-XE supports only `alloc-mode per-vrf` for L3VPN Service SIDs — one `uDT4`/`uDT6` per VRF, with the egress doing a full VRF lookup after decapsulation. Per-prefix mode does not exist.

## Verification Commands

```cisco
show segment-routing srv6 locator
show segment-routing srv6 sid
show isis srv6 locators
show segment-routing traffic-eng policy name * detail
show performance-measurement summary
show isis ipv6 fast-reroute summary
show ip bgp vpnv4 all
```

## Further Reading

- :material-arrow-right: [Mission-Critical Networks](../use-cases/mission-critical.md) - The Cisco validated design for SRv6 on IOS-XE 26.1
- :material-arrow-right: [SRv6 Support Matrix](support-matrix.md) - IOS-XE next to IOS-XR, Junos, EOS, SR OS and open-source platforms
- :material-arrow-right: [Cisco IOS-XR](cisco-ios-xr.md) - Cisco's service-provider SRv6 implementation
- :material-arrow-right: [uSID / SRv6 Compression](../topics/usid-compression.md) - The F3216 format explained

## References

1. [Segment Routing Configuration Guide, Cisco IOS XE 17: Segment Routing over IPv6](https://www.cisco.com/c/en/us/td/docs/ios-xml/ios/seg_routing/configuration/xe-17/segrt-xe-17-book/m_srv6.html) - Feature history from 17.12.1a, supported platforms, behaviors and restrictions
2. [Cisco CVD: Quantum-Safe SRv6 Fabric for Mission-Critical Networks](https://www.cisco.com/c/en/us/td/docs/solutions/CVD/Campus/SRv6_Fabric-Mission-Critical_Networks.html) - Validated design and configuration baseline for SRv6 on IOS-XE 26.1
3. [Cisco 8000 Series Secure Routers](https://www.cisco.com/site/us/en/products/networking/wan/routers/8000-series-secure-routers/index.html) - Platform family validated for SRv6 uSID on IOS-XE
