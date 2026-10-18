---
title: FRRouting
description: SRv6 support in FRRouting (FRR)
tags:
  - implementations
  - frr
  - open-source
---

# SRv6 on FRRouting (FRR)

FRRouting is an open-source routing suite that provides SRv6 support through its IS-IS and BGP daemons.

## SRv6 Support Status

| Feature | Status | FRR Version |
|---------|:------:|:-----------:|
| IS-IS SRv6 locator | :material-check-circle: | 8.4+ |
| BGP SRv6 VPN | :material-check-circle: | 8.4+ |
| SRv6 static SIDs | :material-check-circle: | 10.3+ |
| SRv6 uSID (uA, headend behaviors, BGP uSID instructions) | :material-check-circle: | 10.4+ |
| Multiple SRv6 locators / locator per VRF | :material-check-circle: | 10.5+ |
| MPLS and SRv6 coexistence on the same L3VRF | :material-check-circle: | 10.5+ |
| Global (default-VRF) IPv4/IPv6 unicast over SRv6 core (RFC 9252) | :material-check-circle: | 10.6+ |
| EVPN with IPv6 VTEPs | :material-check-circle: | 10.6+ |
| BGP-LS (RFC 9552) with SRv6 extensions (RFC 9514) | :material-check-circle: | 10.7+ |
| Shared uDT46 SID for the global table | :material-check-circle: | 10.7+ |
| SRv6 TE Policy | :material-progress-clock: | In dev |

Recent FRR releases have steadily closed the uSID gap: 10.3 (March 2025) added SRv6 static SIDs, 10.4 (July 2025) added uSID behaviors — `uA`, additional headend behaviors, BGP uSID instructions, and the seg6local uSID flavor — and 10.5 (November 2025) added multiple-locator support, per-VRF locator selection, and MPLS/SRv6 coexistence for migration scenarios.

**FRR 10.6** (March 2026) extends SRv6 beyond VPNs: BGP can now carry **global IPv4 and IPv6 unicast over an SRv6 core** in the default VRF, the "Global IPv4/IPv6 over SRv6 Core" services of [RFC 9252](../rfcs/rfc9252.md). The same release adds **IPv6 VTEP** support across the EVPN code, backward compatible with IPv4 VTEPs. Per the implementing pull request, the default-VRF service uses DT4/DT6 SIDs and requires the `sr0` interface to install the DT routes because of a kernel limitation.

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

- :material-arrow-right: [Linux Kernel](linux-kernel.md) - Data plane for FRR
- :material-arrow-right: [Containerlab](../labs/containerlab.md) - FRR + Linux labs

## References

1. [FRRouting User Guide](https://docs.frrouting.org/en/stable-10.3/) - Official FRR documentation portal with SRv6 configuration guides
2. [FRRouting ISIS Documentation](https://docs.frrouting.org/en/latest/isisd.html) - IS-IS daemon docs covering SRv6 locator and SID advertisement
3. [FRRouting GitHub Repository](https://github.com/FRRouting/frr) - Source code and releases for the FRRouting project
4. [Add Support for SRv6 IPv4 L3VPN - FRR PR #9649](https://github.com/FRRouting/frr/pull/9649) - Pull request adding SRv6 VPNv4 support to FRR
5. [Add Support for SRv6 uSID Behaviors - FRR PR #12219](https://github.com/FRRouting/frr/pull/12219) - Pull request adding SRv6 micro-SID behavior support
6. [FRR 10.3 Release Notes](https://frrouting.org/release/10.3/) - Adds SRv6 static SIDs
7. [FRR 10.4.0 Release Notes](https://frrouting.org/release/10.4.0/) - Adds SRv6 uSID behaviors (uA, headend behaviors, BGP uSID instructions, seg6local uSID flavor)
8. [FRR 10.5.0 Release Notes](https://frrouting.org/release/10.5.0/) - Adds multiple SRv6 locators, per-VRF locator selection, and MPLS/SRv6 coexistence
9. [FRR 10.6.0 Release Notes](https://frrouting.org/release/10.6.0/) - Adds global (default-VRF) IPv4/IPv6 unicast over an SRv6 core and EVPN IPv6 VTEPs
10. [bgpd: add SRv6 unicast at default VRF - FRR PR #19496](https://github.com/FRRouting/frr/pull/19496) - Implementation notes for the global-table SRv6 service (DT4/DT6, `sr0` requirement)
11. [FRR 10.7.0 Release Notes](https://frrouting.org/release/10.7.0/) - Adds BGP-LS SRv6 extensions and export of static SRv6 SIDs into BGP-LS
12. [FRR 10.7.0 GitHub Release](https://github.com/FRRouting/frr/releases/tag/frr-10.7.0) - Full changelog including base BGP-LS (RFC 9552) and global-table uDT46 SIDs
13. [FRR 10.6 BGP User Guide - Global IPv4/6 SRv6 configuration](https://github.com/FRRouting/frr/blob/frr-10.6.0/doc/user/bgp.rst) - `segment-routing srv6` and `sid export` commands
