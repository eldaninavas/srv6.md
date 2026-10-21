---
title: Juniper
seo_title: "Juniper SRv6 on Junos: uSID, L3VPN, Flex-Algo and TI-LFA Guide"
description: "Configure SRv6 on Juniper Junos and Junos Evolved: platforms and releases, uSID locators, IS-IS, L3VPN and Internet over SRv6, Flex-Algo, TI-LFA and verification."
tags:
  - implementations
  - juniper
---

# SRv6 on Juniper Junos

Juniper implements SRv6 in **Junos OS** (MX Series) and **Junos OS Evolved** (PTX and ACX7000 Series), with both full-length (classic) SIDs and micro-SIDs (uSID, the RFC 9800 NEXT-CSID flavor). This guide walks through a complete uSID deployment — locator, IS-IS, L3VPN and Internet services, Flex-Algo and TI-LFA — following the structure of Juniper's validated design for SRv6 core and edge, and shows the commands to verify each step.

!!! info "Juniper Validated Design"
    The [JVD for Service Provider SRv6 Core and Edge](https://www.juniper.net/documentation/us/en/software/jvd/jvd-sp-core-edge-srv6-01-01/service_provider_srv6_core_and_edge_-_phase_1_juniper_validated_design_jvd.html) was qualified on Junos 24.4R2 and Junos Evolved 24.4R2 with MX480 (MPC7E, MPC10E), MX10004 (LC9600), MX2010 (MPC11E), MX304 and PTX10002-36QDD. It uses uSID only (F3216 format, blocks from `5f00::/16`), Flex-Algo 0/128/129, TI-LFA with microloop avoidance, uDT46 L3VPN and uDX2 EVPN-VPWS.

## Platforms and Releases

| Capability | Junos OS (MX) | Junos OS Evolved |
|------------|---------------|------------------|
| SRv6 in IS-IS, classic SIDs | 20.3R1 (MX240/480/960/2000; MPC7E/8E/9E or newer; per TechLibrary — Feature Explorer lists MX960 at 21.1R1) | PTX10002-36QDD 24.2R2, PTX10008 24.4R1-S2 |
| L3 services over SRv6 (BGP) | 20.4R1 (MX and vMX); MX304 22.2R3; MX10004 22.3R1 | PTX10002-36QDD 24.2R2; PTX10008 24.4R1-S2 |
| uSID in IS-IS transport | 23.4R1 (MX204 through MX10016) | PTX10008 24.4R1-S2 |
| uSID with L3VPN and IS-IS on ACX | — | ACX7024/7100/7509 23.2R1; ACX7024X/7332/7348 23.4R1 |
| uSID with TI-LFA, microloop avoidance, Flex-Algo | 23.4R1 | ACX7024X/7348 24.2R1 |
| SRv6 Flex-Algo | Classic SIDs 20.3R1 (inter-level leaking 21.2R1); uSID 23.4R1 | ACX7024/7100/7509 23.1R1 |
| SRv6 microloop avoidance (IS-IS) | 21.1R1 | PTX10002-36QDD 24.4R1 |

Release numbers are the "introduced" values from [Juniper Feature Explorer](https://apps.juniper.net/feature-explorer/) or, where noted, Juniper TechLibrary; check Feature Explorer for your exact platform and line card. Later additions include static and PCEP SRv6-TE policies (MX 21.3R1), EVPN E-LAN over SRv6 (MX 23.4R1), the End.B6.Encaps binding SID (ACX7000 25.2R1, MX 26.2R1) and TWAMP performance measurement over SRv6 paths (PTX 24.4R1). The [SRv6 Support Matrix](support-matrix.md) compares Junos with other platforms feature by feature. **cRPD** supports SRv6 in IS-IS and L3 services in BGP with limitations (no flavor or Flex-Algo options on End SIDs, no ARM64). There is no official SRv6 support statement for vJunos-router.

## Building Blocks

| Junos object | Hierarchy | What it is |
|--------------|-----------|------------|
| **Block** | `routing-options source-packet-routing srv6 block` | The uSID block (default 32 bits, the only length on ACX), with global (GIB) and local (LIB) ID ranges |
| **Locator** | `routing-options source-packet-routing srv6 locator` | The node's /48 (with `micro-sid`) or classic locator; can be bound to a Flex-Algo |
| **uN / End SID** | `protocols isis source-packet-routing srv6 locator <name> micro-node-sid` | Advertised by IS-IS; without it the local locator is not even installed |
| **uA / End.X SID** | `protocols isis interface <ifl> level 2 srv6-adjacency-segment` | Per-adjacency SID, `protected` or `unprotected` |
| **Service SID** | `routing-instances <vrf> protocols bgp source-packet-routing srv6 locator <name>` | uDT4/uDT6/uDT46 (or End.DT4/6/46) per VRF |

The default uSID length is 16 bits. In each block the GIB defaults to `0x0000–0xDFFF` (static) and the LIB to `0xE000–0xFFFF` (dynamic). With no flavor configured, `micro-sid` SIDs use **PSP and USD**.

## Step 1: Platform Prerequisites (MX)

```junos
set chassis network-services enhanced-ip
set routing-options resolution preserve-nexthop-hierarchy
set routing-options forwarding-table srv6-chain-merge
```

`enhanced-ip` is needed on MX only. The other two enable the chained, hierarchical next-hop structures that SRv6 services resolve through; the JVD sets them on every router.

## Step 2: uSID Block and Locator

The example uses the IANA SRv6 SID block `5f00::/16` ([RFC 9602](../rfcs/rfc9602.md)), block `5f00::/32` and node 1 = `5f00:0:1::/48` (F3216: 32-bit block, 16-bit node uSID, 16-bit function).

```junos
set routing-options source-packet-routing srv6 block BLK0 5f00::/32
set routing-options source-packet-routing srv6 block BLK0 local-micro-sid maximum-static-sids 2000
set routing-options source-packet-routing srv6 locator LOC0 5f00:0:1::/48
set routing-options source-packet-routing srv6 locator LOC0 micro-sid block-name BLK0
```

`maximum-static-sids` reserves part of the LIB for statically configured service SIDs. By default the static LIB range is empty, so any static `micro-dt46-sid` value would fail to commit. Changing GIB/LIB sizes later is disruptive (it requires restarting routing, and dynamic SIDs can change), so size it up front. Use the same block on every router; uSID compression only works between nodes that share a block.

??? note "Classic (full-length) SIDs instead of uSID"
    ```junos
    set routing-options source-packet-routing srv6 locator myloc 2001:db8:0:a0::/64
    set protocols isis source-packet-routing srv6 locator myloc end-sid 2001:db8:0:a0:d01:: flavor usd
    set protocols isis interface xe-0/0/0:0.0 level 2 srv6-adjacency-segment protected locator myloc end-x-sid 2001:db8:0:a0:1a01:: flavor psp
    ```
    End and End.X SIDs must fall inside the locator prefix or the commit fails. Encapsulation defaults to a **reduced SRH**; `set routing-options source-packet-routing srv6 no-reduced-srh` restores the full SRH (on ACX7000 this restarts the PFE).

## Step 3: IS-IS

```junos
set protocols isis interface et-0/0/0.0 point-to-point
set protocols isis interface et-0/0/0.0 level 2 srv6-adjacency-segment unprotected locator LOC0 micro-adjacency-sid
set protocols isis interface lo0.0 passive
set protocols isis source-packet-routing srv6 locator LOC0 micro-node-sid
set protocols isis level 1 disable
set protocols isis level 2 wide-metrics-only
```

- `micro-node-sid` advertises the locator and the uN SID (RFC 9352 SRv6 Locator TLV). The locator must be configured under IS-IS even if you only want SRv6 for L3VPN.
- `micro-adjacency-sid` with no value allocates a dynamic uA from the LIB. The JVD uses **unprotected** uA SIDs and relies on TI-LFA to protect uN SIDs and prefixes.
- IS-IS multi-topology (`set protocols isis topologies ipv6-unicast`) is **not** required. The JVD only uses it during migration, so IPv4 SR-MPLS and IPv6 SRv6 topologies can differ.

## Step 4: L3VPN over SRv6

On each PE, assign a service SID per VRF and enable SRv6 service signaling on the BGP families.

```junos
# VRF with a dynamic uDT46 SID (End.DT46 with NEXT-CSID)
set routing-instances CUST-A instance-type vrf
set routing-instances CUST-A interface ge-0/0/2.0
set routing-instances CUST-A route-distinguisher 192.0.2.1:100
set routing-instances CUST-A vrf-target target:65000:100
set routing-instances CUST-A protocols bgp source-packet-routing srv6 locator LOC0 micro-dt46-sid
#   or a static value from the LIB static range:  ... micro-dt46-sid 0xfc30
#   or per address family:                         ... micro-dt4-sid / micro-dt6-sid
#   classic SIDs:                                  ... locator myloc end-dt4-sid / end-dt6-sid / end-dt46-sid <sid>

# IBGP to the route reflectors (IPv6 transport)
set protocols bgp group RR type internal
set protocols bgp group RR local-address 2001:db8:ff::11
set protocols bgp group RR family inet-vpn unicast extended-nexthop
set protocols bgp group RR family inet-vpn unicast advertise-srv6-service
set protocols bgp group RR family inet-vpn unicast accept-srv6-service
set protocols bgp group RR family inet6-vpn unicast advertise-srv6-service
set protocols bgp group RR family inet6-vpn unicast accept-srv6-service
set protocols bgp group RR family route-target nexthop-resolution no-resolution
set protocols bgp group RR neighbor 2001:db8:ff::1
set protocols bgp rfc8950-compliant
set protocols bgp multipath list-nexthop
```

How it resolves: with SRv6 services enabled, Junos ignores the BGP NEXT_HOP for resolution and resolves the route on the **locator** inside the SRv6 SID, which IS-IS has installed in `inet6.3` as an `SRV6-ISIS` route. No `resolution rib` tweaks are needed. Two details matter in practice:

- `extended-nexthop` and `rfc8950-compliant` make VPN-IPv4 routes carry IPv6 next hops in the standard (RFC 8950) encoding, which matters for interoperability with other vendors.
- Route-target (RT-constraint) routes otherwise stay hidden, because the PE loopbacks exist only in `inet6.0`. `nexthop-resolution no-resolution` fixes this.

The per-VRF SID is advertised in the BGP Prefix-SID attribute (SRv6 L3 Service TLV) with the function bits transposed into the label field, as described in [RFC 9252](../rfcs/rfc9252.md). Inter-AS Option C works over SRv6; Option B over SRv6 is not supported. For SIDs learned only via BGP (no IGP route to the remote locator), Junos 24.2R1+ on MX can use `routing-options dynamic-tunnels <name> srv6`.

### Internet (Global Table) over SRv6

```junos
set protocols bgp source-packet-routing srv6 locator LOC0 micro-dt46-sid
set protocols bgp group RR family inet unicast extended-nexthop
set protocols bgp group RR family inet unicast advertise-srv6-service
set protocols bgp group RR family inet unicast accept-srv6-service
set protocols bgp group RR family inet6 unicast advertise-srv6-service
set protocols bgp group RR family inet6 unicast accept-srv6-service
```

!!! warning "Filter your SID block at the border"
    The JVD filters `5f00::/16` (and more-specifics) on eBGP sessions. If another AS can inject routes covering your SID space, it can attract SRv6-encapsulated VPN traffic. See [Security](../topics/security.md).

## Step 5: Flex-Algo

A Flex-Algo needs a definition, IS-IS participation and **its own locator**. Services pick the algorithm through the locator their SID comes from.

```junos
# Algorithm 128 = low-latency
set routing-options flex-algorithm 128 definition metric-type delay-metric
set routing-options flex-algorithm 128 definition spf
set protocols isis source-packet-routing flex-algorithm 128

# Locator for algorithm 128, in its own /32 block
set routing-options source-packet-routing srv6 block BLK128 5f00:a1::/32
set routing-options source-packet-routing srv6 locator LOC128 5f00:a1:1::/48
set routing-options source-packet-routing srv6 locator LOC128 algorithm 128
set routing-options source-packet-routing srv6 locator LOC128 micro-sid block-name BLK128
set protocols isis source-packet-routing srv6 locator LOC128 micro-node-sid
set protocols isis interface et-0/0/0.0 level 2 srv6-adjacency-segment unprotected locator LOC128 micro-adjacency-sid

# Option A: the whole VRF uses the low-latency locator
set routing-instances CUST-LL protocols bgp source-packet-routing srv6 locator LOC128 micro-dt46-sid

# Option B: allocate a second SID in a VRF and select it per prefix by policy
set routing-instances CUST-A protocols bgp source-packet-routing srv6 locator LOC128 micro-dt46-sid non-default
set policy-options community VOICE members 65000:911
set policy-options policy-statement LL-PREFIXES term VOICE from community VOICE
set policy-options policy-statement LL-PREFIXES term VOICE then srv6 locator LOC128 micro-dt46-sid
set policy-options policy-statement LL-PREFIXES term VOICE then accept
set protocols bgp group RR export LL-PREFIXES
```

In option B the VRF advertises its default SID for most prefixes, and the export policy on the IBGP group swaps in the algorithm-128 SID for the matching ones, so remote PEs reach those prefixes over the low-latency topology.

Delay-based algorithms need link delay: enable `delay-measurement` on the IS-IS interfaces (TWAMP Light), and advertise it as an application-specific link attribute for Flex-Algo. IS-IS installs SIDs of non-zero algorithms in `inet6color.0`. On Junos, Flex-Algo participation applies to SR-MPLS and SRv6 together — you cannot define an algorithm for SRv6 only. See [Flex-Algorithm](../topics/flex-algorithm.md).

## Step 6: TI-LFA and Microloop Avoidance

```junos
set protocols isis backup-spf-options use-post-convergence-lfa
set protocols isis backup-spf-options use-source-packet-routing
set protocols isis interface et-0/0/0.0 level 2 post-convergence-lfa
set protocols isis interface et-0/0/0.0 level 2 post-convergence-lfa node-protection cost 16777214
set protocols isis spf-options microloop-avoidance post-convergence-path delay 5000
```

Link protection is the default once `post-convergence-lfa` is on an interface. The JVD adds node protection with a very high cost, so the node-protecting path is preferred but a link-protecting backup is still used when no node-protecting path exists. uSID-based TI-LFA, microloop avoidance and Flex-Algo protection arrived in Junos 23.4R1. **Before Junos 26.2R1, SRLG is not considered for SRv6 TI-LFA**; 26.2R1 adds IS-IS IPv6 SRLG (TLV 139) for SRLG-aware TI-LFA on MX, PTX and ACX7000. The JVD measured worst-case link-failure convergence around 5 ms. See [TI-LFA](../topics/ti-lfa.md) for the algorithm.

## Verification

| Command | What to look for |
|---------|------------------|
| `show isis overview` | `SRv6: Enabled`, the locator and algorithm, `micro-node-SID … Flavor: PSP, USD`, post-convergence backup and microloop avoidance state |
| `show isis adjacency extensive` | `SRv6 unprotected END-X-SID …` with its flavor, per adjacency |
| `show isis database <router> extensive \| find SRv6` | SRv6 Locator TLV (MTID, algorithm), uN SID with block/node lengths, SRv6 MSDs, End.X SIDs |
| `show srv6 block BLK0` | GIB/LIB ranges, static and dynamic SID counts |
| `show route table inet6.3 protocol isis` | Remote locators and SIDs as `SRV6-ISIS` routes with `SRV6-Tunnel` next hops |
| `show route table inet6.0 protocol srv6` | Local service SIDs, e.g. a uDT46 SID pointing `to table CUST-A.inet.0` |
| `show route receive-protocol bgp <rr> table CUST-A detail` | `SRv6 SID: … Behavior: 63 BL:32 NL:16 FL:16 AL:0 TL:16 TO:48` (63 = End.DT4 with NEXT-CSID) |
| `show route table CUST-A.inet.0 <prefix> extensive` | `SRV6-Tunnel: Reduced-SRH Encap-mode`, the segment list and `Protocol next hop: <remote locator>` |
| `show isis backup coverage` | Percentage of nodes and prefixes protected, per topology |
| `show isis backup spf results` | Backup path per destination (add `no-coverage` to list unprotected ones) |
| `ping srv6 isis <sid>` / `traceroute srv6 isis <sid>` | SRv6 OAM reachability of a uN or End SID |

`show spring-traffic-engineering` is for SR-TE policies, not for SRv6 locators and service SIDs.

## Limits and Gotchas

- **SID depth** (from the Junos SRv6 docs): MX encapsulates up to 6 SIDs and inserts up to 5; ACX7000 encapsulates 12 and inserts 10; PTX10002-36QDD and PTX10008 (Express 5) support 7. uSID packs up to six 16-bit uSIDs per 128-bit container, which leaves plenty of headroom for TE and TI-LFA.
- **Encap vs insert**: ingress PEs always encapsulate, so egress SIDs must support USD; transit SRH insertion for TI-LFA needs a PSP-capable last SID.
- **Static plus IS-IS SIDs**: configuring the same static uA or End.X SID under both the SRv6 manager and IS-IS fails commit (a duplicate uN is allowed; IS-IS wins).
- **IS-IS SRv6 limits**: the IS-IS SRv6 concept page lists anycast locators, SRLG, End.X interface groups and Flex-Algo locator conflict resolution as unsupported. Feature Explorer has since added anycast locators and summarization (MX10004/MX10008 22.3R1, ACX7000 22.4R1) and SRLG (26.2R1), so check your platform and release.
- **No `next-hop-self` knob**: Junos IBGP needs an export policy with `then next-hop self` when you redistribute CE routes into plain IPv4/IPv6 BGP.

## Hands-On

- :material-arrow-right: [netlab Labs](../labs/netlab.md) - Junos SRv6 lab topologies, including the ipSpace.net SRv6 examples
- :material-arrow-right: [GNS3 Labs](../labs/gns3.md) - Emulate Junos routers for SRv6 testing

## Further Reading

- :material-arrow-right: [SRv6 Support Matrix](support-matrix.md) - Junos feature by feature next to IOS-XR, EOS, SR OS, VRP and open-source platforms
- :material-arrow-right: [Implementations Overview](index.md) - Compare Junos with IOS-XR, EOS, SR OS and Linux
- :material-arrow-right: [uSID Compression](../topics/usid-compression.md) - How uN, uA and uDT SIDs pack into one address
- :material-arrow-right: [BGP Overlay Services](../topics/bgp-overlay-services.md) - L3VPN and EVPN over SRv6 (RFC 9252)
- :material-arrow-right: [TI-LFA](../topics/ti-lfa.md) - P/Q-space repair paths and vendor configs
- :material-arrow-right: [Flex-Algorithm](../topics/flex-algorithm.md) - Constraint-based topologies
- :material-web: [Juniper SRv6 Validated Design](https://www.juniper.net/documentation/us/en/software/jvd/jvd-sp-core-edge-srv6-01-01/service_provider_srv6_core_and_edge_-_phase_1_juniper_validated_design_jvd.html)

## References

1. [Segment Routing User Guide - Juniper TechLibrary](https://www.juniper.net/documentation/us/en/software/junos/segment-routing/index.html) - Comprehensive Junos OS guide for configuring SR-MPLS and SRv6
2. [JVD: Service Provider SRv6 Core and Edge (PDF)](https://www.juniper.net/documentation/us/en/software/jvd/jvd-sp-core-edge-srv6-01-01/jvd-sp-core-edge-srv6-01-01.pdf) - Validated uSID design with full test-bed configurations, Flex-Algo, TI-LFA and convergence results
3. [Understanding SRv6 Network Programming in IS-IS Networks](https://www.juniper.net/documentation/us/en/software/junos/is-is/topics/concept/isis-srv6-network-programming.html) - SRv6 in IS-IS: SID types, encapsulation modes, TI-LFA behavior and limits
4. [Example: Configuring SRv6 Network Programming in IS-IS](https://www.juniper.net/documentation/us/en/software/junos/segment-routing/topics/example/isis-configuring-srv6-network-programming.html) - Classic End and End.X SID configuration
5. [SRv6 Network Programming and Layer 3 Services in BGP Networks](https://www.juniper.net/documentation/us/en/software/junos/segment-routing/topics/topic-map/bgp-srv6-network-programming.html) - TechLibrary guide for SRv6 L3VPN and Internet services with BGP
6. [srv6 block statement](https://www.juniper.net/documentation/us/en/software/junos/cli-reference/topics/ref/statement/routing-options-source-packet-routing-srv6-block.html) and [locator micro-sid statement](https://www.juniper.net/documentation/us/en/software/junos/cli-reference/topics/ref/statement/routing-options-source-packet-routing-srv6-locator-micro-sid.html) - uSID block, GIB/LIB and flavor defaults
7. [Static SRv6 SIDs](https://www.juniper.net/documentation/us/en/software/junos/is-is/topics/concept/srv6-static-sid-conf.html) - Static uN/uA SIDs, interaction with IS-IS and Flex-Algo route tables
8. [Understanding TI-LFA for IS-IS](https://www.juniper.net/documentation/us/en/software/junos/is-is/topics/concept/understanding-ti-lfa-for-is-is.html) - Backup options, limits and IPv6 caveats
9. [IS-IS Microloop Avoidance for SRv6](https://www.juniper.net/documentation/us/en/software/junos/is-is/topics/concept/isis-microloop-avoidance-srv6.html) - Post-convergence-path microloop avoidance
10. [Juniper Feature Explorer](https://apps.juniper.net/feature-explorer/) - Per-platform release information for each SRv6 feature
11. [cRPD supported features](https://www.juniper.net/documentation/us/en/software/crpd/crpd-deployment/topics/concept/crpd-supported-features.html) - SRv6 support and limitations on containerized Junos routing
12. [SRv6 Micro-SID (uSID) Basics (Juniper community)](https://community.juniper.net/blogs/krzysztof-szarkowicz/2025/09/30/srv6-micro-sid-basics) - Step-by-step uSID configuration and outputs on Junos 24.4R1
13. [Day One: Introduction to SRv6 (PDF)](https://www.juniper.net/documentation/en_US/day-one-books/DayOne-Intro-SRv6.pdf) - Juniper Day One book introducing SRv6 concepts and configuration
14. [Configuring SRv6 on Junos (ipSpace.net)](https://blog.ipspace.net/2026/09/srv6-junos/) - Hands-on walkthrough of SRv6 locator and IGP configuration on Junos, tested in a netlab topology
15. [Configuring SRv6 Layer-3 Services on Junos (ipSpace.net)](https://blog.ipspace.net/2026/10/junos-srv6-layer3-services/) - Follow-up covering SRv6 L3VPN service configuration on Junos
16. [Junos OS 20.3 In Focus Guide (PDF)](https://www.juniper.net/documentation/en_US/junos/information-products/pathway-pages/infocus/20.3/infocus-junos-20.3.pdf) - First SRv6 release: IS-IS End/End.X, flavors, Flex-Algo and TI-LFA for the SRv6 data plane
17. [Feature Explorer: SRLG-aware TI-LFA](https://apps.juniper.net/feature-explorer/feature/9377) and [anycast locators](https://apps.juniper.net/feature-explorer/feature/4131) - Later additions to IS-IS SRv6
