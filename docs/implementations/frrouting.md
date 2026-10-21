---
title: FRRouting
seo_title: "SRv6 on FRRouting (FRR): uSID, L3VPN and Config"
description: "Run SRv6 on FRRouting (FRR): support status from 8.1 to 10.7, uSID locators, IS-IS and L3VPN over SRv6, global-table services, BGP-LS and what is still missing."
tags:
  - implementations
  - frr
  - open-source
---

# SRv6 on FRRouting (FRR)

FRRouting is an open-source routing suite that provides SRv6 support through its zebra, IS-IS, BGP and static daemons. FRR programs the [Linux kernel](linux-kernel.md) `seg6`/`seg6local` data plane over netlink, so it can only use the SRv6 behaviors the kernel implements.

## SRv6 Support Status

| Feature | Status | FRR Version |
|---------|:------:|:-----------:|
| BGP SRv6 L3VPN, VPNv6 (End.DT6) | :material-check-circle: | 8.1+ |
| BGP SRv6 L3VPN, VPNv4 (End.DT4) | :material-check-circle: | 8.3+ |
| Per-VRF End.DT46 SID; SRv6 uSID (`behavior usid`) for BGP services | :material-check-circle: | 8.5+ |
| IS-IS SRv6 ([RFC 9352](../rfcs/rfc9352.md)): locators, End/uN and End.X/uA SIDs; static SRv6 segment routes (IPv6) | :material-check-circle: | 9.1+ |
| SRv6 static SIDs (uN, uDT4/6/46) | :material-check-circle: | 10.3+ |
| Static uA, H.Encaps.Red (staticd and BGP), PSP flavor (End only), IPv4 static segment routes | :material-check-circle: | 10.4+ |
| Multiple SRv6 locators / locator per VRF | :material-check-circle: | 10.5+ |
| MPLS and SRv6 coexistence on the same L3VRF | :material-check-circle: | 10.5+ |
| Global (default-VRF) IPv4/IPv6 unicast over SRv6 core (RFC 9252) | :material-check-circle: | 10.6+ |
| BGP-LS (RFC 9552) with SRv6 extensions (RFC 9514) | :material-check-circle: | 10.7+ |
| Shared uDT46 SID for the global table | :material-check-circle: | 10.7+ |
| EVPN over SRv6 | :material-close-circle: | L3 EVPN (RT5) merged for 10.8, not yet released |
| SRv6 TI-LFA, SRv6 Flex-Algo | :material-close-circle: | isisd TI-LFA and Flex-Algo are SR-MPLS only |
| OSPFv3 SRv6, PCEP / SR policies for SRv6 | :material-close-circle: | ospf6d has no SRv6; pathd is MPLS-based |

FRR's SRv6 history starts in **8.1** (zebra SRv6 locator manager and BGP L3VPN for VPNv6). VPNv4 followed in 8.3 and uSID in 8.5 (`behavior usid` locators, PR #12219); IS-IS learned SRv6 in **9.1**. 10.3 (March 2025) added static SRv6 SIDs, 10.4 (July 2025) static uA, H.Encaps.Red and the PSP flavor, and 10.5 (November 2025) multiple-locator support, per-VRF locator selection, and MPLS/SRv6 coexistence for migration scenarios. Release 10.6 also added IPv6 VTEPs for EVPN, but that is EVPN over VXLAN, not SRv6. The [SRv6 Support Matrix](support-matrix.md) compares FRR with the kernel and vendor routers behavior by behavior.

**FRR 10.6** (March 2026) extends SRv6 beyond VPNs: BGP can now carry **global IPv4 and IPv6 unicast over an SRv6 core** in the default VRF, the "Global IPv4/IPv6 over SRv6 Core" services of [RFC 9252](../rfcs/rfc9252.md). Per the implementing pull request, the default-VRF service uses DT4/DT6 SIDs and requires the `sr0` interface to install the DT routes because of a kernel limitation.

**FRR 10.7** (July 2026) brings FRR into controller-driven SRv6 TE: it adds **BGP-LS** ([RFC 9552](https://datatracker.ietf.org/doc/rfc9552/)) with the **SRv6 extensions** of [RFC 9514](../rfcs/rfc9514.md) — SRv6 Capabilities and Locator TLVs, SRv6 SID NLRI for End, End.X and LAN End.X SIDs, and the Endpoint Behavior and SID Structure TLVs. Static SRv6 SIDs configured in zebra can be exported into BGP-LS so a TE controller sees them. The 10.7 changelog also adds a single **uDT46** SID for the global table as an alternative to separate uDT4/uDT6 SIDs.

### Global table over SRv6 (10.6+)

```frr
router bgp 65001
 segment-routing srv6
  locator MAIN
 exit
 neighbor 2001:db8::2 remote-as 65001
 !
 address-family ipv6 unicast
  sid export auto
  neighbor 2001:db8::2 activate
  neighbor 2001:db8::2 encapsulation-srv6
 exit-address-family
```

`sid export` (default VRF only) allocates the global-table service SID; compare `sid vpn export` for L3VPN. `encapsulation-srv6` makes BGP attach the Prefix-SID attribute toward that neighbor (`encapsulation-srv6-relax` sends routes with and without it). Command names are from the FRR 10.6 BGP user guide — check the docs for your release before deploying.

## Configuration Example

```frr
! Enable SRv6 in IS-IS
router isis CORE
 segment-routing srv6
  locator MAIN
 exit

! Define SRv6 locator
segment-routing
 srv6
  locators
   locator MAIN
    prefix fc00:0:1::/48 block-len 32 node-len 16 func-bits 16
   exit
  exit
 exit
```

## Further Reading

- :material-arrow-right: [SRv6 Support Matrix](support-matrix.md) - FRR next to the Linux kernel and vendor implementations
- :material-arrow-right: [Linux Kernel](linux-kernel.md) - Data plane for FRR
- :material-arrow-right: [Containerlab](../labs/containerlab.md) - FRR + Linux labs

## References

1. [FRRouting User Guide](https://docs.frrouting.org/en/stable-10.3/) - Official FRR documentation portal with SRv6 configuration guides
2. [FRRouting ISIS Documentation](https://docs.frrouting.org/en/latest/isisd.html) - IS-IS daemon docs covering SRv6 locator and SID advertisement
3. [FRRouting GitHub Repository](https://github.com/FRRouting/frr) - Source code and releases for the FRRouting project
4. [Add Support for SRv6 IPv4 L3VPN - FRR PR #9649](https://github.com/FRRouting/frr/pull/9649) - Pull request adding SRv6 VPNv4 support to FRR
5. [Add Support for SRv6 uSID Behaviors - FRR PR #12219](https://github.com/FRRouting/frr/pull/12219) - Pull request adding SRv6 micro-SID behavior support
6. [FRR 10.3 Release Notes](https://frrouting.org/release/10.3/) - Adds SRv6 static SIDs
7. [FRR 10.4.0 Release Notes](https://frrouting.org/release/10.4.0/) - Adds static uA, H.Encaps.Red and the PSP flavor
8. [FRR 10.5.0 Release Notes](https://frrouting.org/release/10.5.0/) - Adds multiple SRv6 locators, per-VRF locator selection, and MPLS/SRv6 coexistence
9. [FRR 10.6.0 Release Notes](https://frrouting.org/release/10.6.0/) - Adds global (default-VRF) IPv4/IPv6 unicast over an SRv6 core
10. [bgpd: add SRv6 unicast at default VRF - FRR PR #19496](https://github.com/FRRouting/frr/pull/19496) - Implementation notes for the global-table SRv6 service (DT4/DT6, `sr0` requirement)
11. [FRR 10.7.0 Release Notes](https://frrouting.org/release/10.7.0/) - Adds BGP-LS SRv6 extensions and export of static SRv6 SIDs into BGP-LS
12. [FRR 10.7.0 GitHub Release](https://github.com/FRRouting/frr/releases/tag/frr-10.7.0) - Full changelog including base BGP-LS (RFC 9552) and global-table uDT46 SIDs
13. [FRR 10.6 BGP User Guide - Global IPv4/6 SRv6 configuration](https://github.com/FRRouting/frr/blob/frr-10.6.0/doc/user/bgp.rst) - `segment-routing srv6` and `sid export` commands
14. [FRR 9.1 Release Notes](https://frrouting.org/release/9.1/) - IS-IS SRv6 uSID support (RFC 9352)
15. [FRR 8.5 Release Notes](https://frrouting.org/release/8.5/) - SRv6 uSID implementation and per-VRF SIDs
16. [FRR 8.1 BGP documentation: L3VPN SRv6](https://github.com/FRRouting/frr/blob/frr-8.1/doc/user/bgp.rst?plain=1#L2689-L2701) - First release with BGP SRv6 L3VPN
