---
title: Cisco IOS-XE
description: SRv6 uSID on Cisco IOS-XE — 8000 Series Secure Routers and Catalyst edge platforms
tags:
  - implementations
  - cisco
  - ios-xe
---

# SRv6 on Cisco IOS-XE

SRv6 on Cisco has long been an [IOS-XR](cisco-ios-xr.md) story (NCS, ASR 9000, Cisco 8000). That changed with **IOS-XE 26.1**: Cisco's enterprise/edge operating system now ships validated SRv6 uSID support, documented in the 2026 CVD [*Quantum-Safe SRv6 Fabric for Mission-Critical Networks*](https://www.cisco.com/c/en/us/td/docs/solutions/CVD/Campus/SRv6_Fabric-Mission-Critical_Networks.html). This brings SRv6 to the WAN-edge and branch platforms that historically terminated SD-WAN or DMVPN.

## Supported Platforms (validated in the CVD)

- Cisco 8000 Series Secure Routers (G2): 8161-G2 (compact edge), 8375-E-G2 / 8475-G2 (branch/campus edge), 8550-G2 / 8570-G2 (aggregation hubs)
- Catalyst 8000 edge family (SR-TE/ePBR feature lineage)

## Feature Highlights

| Feature | IOS-XE support |
|---------|----------------|
| uSID format | **F3216 only** (`format usid-f3216`) — 32-bit block, 16-bit node, 16-bit function |
| Headend encapsulation | `H.Encaps.Red` (reduced) |
| End behaviors | `uN`, `uA`, `uDT4`, `uDT6`, `uDT46`, `End.DTMC4` (multicast VRF decap) |
| L3VPN SID allocation | **`alloc-mode per-vrf` only** — per-prefix allocation is not supported |
| IGP | IS-IS with multi-topology IPv6, wide metrics |
| SR-TE | Per-Destination and Per-Flow policies, ODN/Automated Steering, ePBR + NBAR classification |
| Flex-Algo | Yes, with per-algorithm locators |
| TI-LFA | Yes, with node-protecting / SRLG-disjoint / linecard-disjoint tiebreakers |
| Performance measurement | Two-way active probes, delay advertisement into IS-IS, liveness detection |
| Multicast | BGP MVPN with SRv6 ingress replication (`srv6-mcast ingress-replication partitioned`) |

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

- :material-arrow-right: [Mission-Critical Networks](../use-cases/mission-critical.md) - The validated design that debuted SRv6 on IOS-XE
- :material-arrow-right: [Cisco IOS-XR](cisco-ios-xr.md) - Cisco's service-provider SRv6 implementation
- :material-arrow-right: [uSID / SRv6 Compression](../topics/usid-compression.md) - The F3216 format explained

## References

1. [Cisco CVD: Quantum-Safe SRv6 Fabric for Mission-Critical Networks](https://www.cisco.com/c/en/us/td/docs/solutions/CVD/Campus/SRv6_Fabric-Mission-Critical_Networks.html) - Validated design and configuration baseline for SRv6 on IOS-XE 26.1
2. [Cisco 8000 Series Secure Routers](https://www.cisco.com/site/us/en/products/networking/wan/routers/8000-series-secure-routers/index.html) - Platform family validated for SRv6 uSID on IOS-XE
