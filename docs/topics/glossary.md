---
title: SRv6 Glossary
seo_title: "SRv6 Glossary: Segment Routing over IPv6 Terminology"
description: "SRv6 glossary: plain-English definitions of 118 SRv6 terms, from SID, SRH and uSID to End.DT46, PSP, USD, Binding SID and TI-LFA, each tied to its RFC."
defined_term_set: true
glossary_links: false
hide:
  - toc
tags:
  - topics
  - beginner
  - glossary
  - srv6 glossary
  - srv6 terminology
---

# SRv6 Glossary

This glossary defines the terms used in **SRv6** (Segment Routing over IPv6) and throughout srv6.md. Each entry gives a short definition you can quote as-is, the RFC section that defines the term, and a link to the page that explains it in depth. Definitions follow the RFC text; when a term is a vendor name or comes from an Internet-Draft rather than an RFC, the entry says so.

!!! info "AI networking terms"
    Looking for GPU-fabric vocabulary such as RoCEv2, NCCL, all-reduce or packet spraying? See the [AI Networking Glossary](../ai/ai-glossary.md).

<nav class="gl-az" aria-label="Glossary A to Z"><a href="#letter-0">0–9</a><a href="#letter-a">A</a><a href="#letter-b">B</a><a href="#letter-c">C</a><span aria-hidden="true">D</span><a href="#letter-e">E</a><a href="#letter-f">F</a><a href="#letter-g">G</a><a href="#letter-h">H</a><a href="#letter-i">I</a><span aria-hidden="true">J</span><span aria-hidden="true">K</span><a href="#letter-l">L</a><a href="#letter-m">M</a><a href="#letter-n">N</a><a href="#letter-o">O</a><a href="#letter-p">P</a><a href="#letter-q">Q</a><a href="#letter-r">R</a><a href="#letter-s">S</a><a href="#letter-t">T</a><a href="#letter-u">U</a><span aria-hidden="true">V</span><span aria-hidden="true">W</span><span aria-hidden="true">X</span><span aria-hidden="true">Y</span><span aria-hidden="true">Z</span></nav>

## Browse by topic {#by-topic}

**Core concepts:** [Active segment](#active-segment) · [Adj-SID](#adj-sid) · [Anycast-SID](#anycast-sid) · [Argument](#argument) · [Endpoint behavior](#endpoint-behavior) · [Function](#function) · [Last Entry](#last-entry) · [Locator](#locator) · [Network Programming](#network-programming) · [Node-SID](#node-sid) · [Prefix-SID](#prefix-sid) · [Routing Header type 4](#routing-type-4) · [Segment](#segment) · [Segment endpoint node](#segment-endpoint-node) · [SID](#sid) · [Segment List](#segment-list) · [SRH](#srh) · [Segments Left](#segments-left) · [SID block](#sid-block) · [SR domain](#sr-domain) · [SR-MPLS](#sr-mpls) · [SR source node](#headend) · [SRv6](#srv6) · [Transit node](#transit-node)

**Endpoint behaviors:** [End](#end) · [End.B6.Encaps](#end-b6-encaps) · [End.B6.Encaps.Red](#end-b6-encaps-red) · [End.BM](#end-bm) · [End.DT2M](#end-dt2m) · [End.DT2U](#end-dt2u) · [End.DT4](#end-dt4) · [End.DT46](#end-dt46) · [End.DT6](#end-dt6) · [End.DTMC4/6/46](#end-dtmc4) · [End.DX2](#end-dx2) · [End.DX2V](#end-dx2v) · [End.DX4](#end-dx4) · [End.DX6](#end-dx6) · [End.MAP](#end-map) · [End.M.GTP4.E](#end-m-gtp4-e) · [End.M.GTP6.D](#end-m-gtp6-d) · [End.M.GTP6.D.Di](#end-m-gtp6-d-di) · [End.M.GTP6.E](#end-m-gtp6-e) · [End.Replicate](#end-replicate) · [End.T](#end-t) · [End.X](#end-x) · [Replication segment](#replication-segment) · [SR P2MP Policy](#sr-p2mp-policy)

**Headend behaviors:** [H.Encaps](#h-encaps) · [H.Encaps.L2](#h-encaps-l2) · [H.Encaps.L2.Red](#h-encaps-l2-red) · [H.Encaps.Red](#h-encaps-red) · [H.M.GTP4.D](#h-m-gtp4-d) · [H.Insert](#h-insert)

**Flavors:** [Flavor](#flavor) · [PSP](#psp) · [USD](#usd) · [USP](#usp)

**SID compression (uSID, CSID):** [CSID](#csid) · [CSID container](#csid-container) · [End.LBS and End.XLBS](#end-lbs) · [End-of-Container](#end-of-container) · [F1616](#f1616) · [F3216](#f3216) · [GIB and LIB](#gib-lib) · [G-SRv6](#g-srv6) · [Locator-Node](#locator-node) · [NEXT-CSID](#next-csid) · [REPLACE-CSID](#replace-csid) · [uA](#ua) · [uDT](#udt) · [uN](#un) · [uSID](#usid)

**SR Policy and traffic engineering:** [Automated Steering](#automated-steering) · [BGP-LS](#bgp-ls) · [BGP SR Policy](#bgp-sr-policy) · [Binding SID](#binding-sid) · [Candidate path](#candidate-path) · [Color](#color) · [ODN](#odn) · [PCE](#pce) · [PCEP](#pcep) · [Per-flow steering](#per-flow-steering) · [SR Policy](#sr-policy)

**IGP, Flex-Algo and protection:** [Flex-Algo](#flex-algo) · [FAD](#fad) · [LFA](#lfa) · [MSD](#msd) · [Microloop](#microloop) · [PLR](#plr) · [Post-convergence path](#post-convergence-path) · [PQ-node](#pq-node) · [P-space](#p-space) · [Q-space](#q-space) · [Repair list](#repair-list) · [SRLG](#srlg) · [SRv6 Locator TLV](#srv6-locator-tlv) · [TI-LFA](#ti-lfa)

**Services (BGP, VPN, EVPN, mobile):** [BGP Prefix-SID attribute](#bgp-prefix-sid-attribute) · [EVPN over SRv6](#evpn-over-srv6) · [L3VPN over SRv6](#l3vpn-over-srv6) · [Service SID](#service-sid) · [SRv6 MUP](#mup) · [SRv6 Service TLV](#srv6-service-tlv) · [Transposition](#transposition)

**OAM and telemetry:** [IOAM](#ioam) · [IPFIX for SRv6](#ipfix) · [O-flag](#o-flag) · [Path Tracing](#path-tracing) · [SRv6 ping and traceroute](#srv6-ping) · [STAMP](#stamp)

**Security:** [5f00::/16](#5f00) · [HMAC TLV](#hmac-tlv) · [iACL](#iacl)

**Platforms and software:** [FRRouting](#frr) · [SAI](#sai) · [seg6 and seg6local](#seg6) · [SONiC](#sonic)

## 0–9 {#letter-0 .gl-letter}

### 5f00::/16 {#5f00}

**5f00::/16** is the IPv6 block IANA allocated in 2024 for SRv6 SIDs. It is marked not globally reachable, which makes SRv6 traffic easy to recognize and filter at SR domain edges.

Defined in: [RFC 9602 §6](https://www.rfc-editor.org/rfc/rfc9602#section-6) · Learn more: [SID Structure](sid-structure.md#iana-allocated-srv6-sid-block-5f0016)
{ .gl-ref }

## A {#letter-a .gl-letter}

### Active segment {#active-segment}

The **active segment** is the segment the receiving node must process now. In SRv6 it is the IPv6 destination address; in SR-MPLS it is the top label.

Defined in: [RFC 8402 §2](https://www.rfc-editor.org/rfc/rfc8402#section-2) · Learn more: [SRH & Packet Walk](srh-packet-walk.md)
{ .gl-ref }

### Adjacency SID (Adj-SID) {#adj-sid}

An **Adj-SID** identifies an IGP adjacency and makes the advertising node send the packet over that specific link, whatever the shortest path. In SRv6 an Adj-SID is an End.X (or uA) SID.

Defined in: [RFC 8402 §3.4](https://www.rfc-editor.org/rfc/rfc8402#section-3.4), [RFC 9352 §8](https://www.rfc-editor.org/rfc/rfc9352#section-8) · Learn more: [TI-LFA](ti-lfa.md)
{ .gl-ref }

### Anycast-SID {#anycast-sid}

An **Anycast-SID** is a Prefix-SID for a prefix advertised by several nodes, so each packet goes to the nearest of them. It is used for redundancy and load sharing, for example across a pair of border routers.

Defined in: [RFC 8402 §3.3](https://www.rfc-editor.org/rfc/rfc8402#section-3.3), [RFC 9352 §6](https://www.rfc-editor.org/rfc/rfc9352#section-6) · Learn more: [Inter-Domain SRv6](inter-domain.md)
{ .gl-ref }

### Argument {#argument}

The **argument** is an optional field in the low-order bits of an SRv6 SID that gives the behavior per-packet or per-flow input, such as the remaining uSIDs of a NEXT-CSID container or the EVPN split-horizon value of End.DT2M.

Defined in: [RFC 8986 §3.1](https://www.rfc-editor.org/rfc/rfc8986#section-3.1) · Learn more: [SID Structure](sid-structure.md)
{ .gl-ref }

### Automated Steering (AS) {#automated-steering}

**Automated Steering** installs a BGP route on the SR Policy whose color and endpoint match the route's Color Extended Community and next hop, so service traffic follows the policy without per-route configuration.

Defined in: [RFC 9256 §8.4](https://www.rfc-editor.org/rfc/rfc9256#section-8.4) · Learn more: [SR Policy](sr-policy.md#color-steering)
{ .gl-ref }

## B {#letter-b .gl-letter}

### BGP-LS {#bgp-ls}

**BGP-LS** (BGP Link-State) exports IGP topology to controllers and PCEs. RFC 9514 extends it to carry SRv6 locators, SIDs and their behaviors.

Defined in: [RFC 9552](https://www.rfc-editor.org/rfc/rfc9552), [RFC 9514](https://www.rfc-editor.org/rfc/rfc9514) · Learn more: [RFC 9514 summary](../rfcs/rfc9514.md)
{ .gl-ref }

### BGP Prefix-SID attribute {#bgp-prefix-sid-attribute}

The **BGP Prefix-SID attribute** (path attribute 40) carries segment routing information with a BGP route. RFC 9252 uses it to carry SRv6 Service TLVs for VPN and EVPN routes.

Defined in: [RFC 8669](https://www.rfc-editor.org/rfc/rfc8669), [RFC 9252 §2](https://www.rfc-editor.org/rfc/rfc9252#section-2) · Learn more: [BGP Overlay](bgp-overlay-services.md#bgp-srv6-service-tlv-rfc-9252)
{ .gl-ref }

### BGP SR Policy {#bgp-sr-policy}

**BGP SR Policy** is the BGP extension (SAFI 73) a controller uses to push SR Policy candidate paths, with their segment lists, color and endpoint, to headends.

Defined in: [RFC 9830](https://www.rfc-editor.org/rfc/rfc9830) · Learn more: [RFC 9830 summary](../rfcs/rfc9830.md)
{ .gl-ref }

### Binding SID (BSID)<span id="bsid"></span> {#binding-sid}

A **Binding SID** is a SID bound to an SR Policy: a packet whose active segment is the BSID is steered into that policy. It hides the policy's path from upstream nodes and keeps their SID lists short; in SRv6 it is an End.B6.Encaps or End.B6.Encaps.Red SID.

Defined in: [RFC 8402 §5](https://www.rfc-editor.org/rfc/rfc8402#section-5), [RFC 9256 §6](https://www.rfc-editor.org/rfc/rfc9256#section-6) · Learn more: [SR Policy](sr-policy.md#binding-sid-bsid)
{ .gl-ref }

## C {#letter-c .gl-letter}

### Candidate path {#candidate-path}

A **candidate path** is one way to realize an SR Policy: explicit (given segment lists), dynamic (computed from an objective and constraints) or composite. The valid candidate path with the highest preference is the active one.

Defined in: [RFC 9256 §2.2](https://www.rfc-editor.org/rfc/rfc9256#section-2.2), [RFC 9256 §2.9](https://www.rfc-editor.org/rfc/rfc9256#section-2.9) · Learn more: [SR Policy](sr-policy.md#sr-policy-architecture-rfc-9256)
{ .gl-ref }

### Color<span id="color-extended-community"></span> {#color}

**Color** is a non-zero 32-bit value that ties an SR Policy to an intent such as low latency. BGP routes carry it in the Color Extended Community so the headend can steer them onto the matching policy.

Defined in: [RFC 9256 §2.1](https://www.rfc-editor.org/rfc/rfc9256#section-2.1), [RFC 9012 §4.3](https://www.rfc-editor.org/rfc/rfc9012#section-4.3) · Learn more: [SR Policy](sr-policy.md#color-steering)
{ .gl-ref }

### Compressed SID (CSID)<span id="compressed-sid"></span> {#csid}

A **CSID** is a compressed encoding of an SRv6 SID that keeps only its Locator-Node and Function bits; the Locator-Block shared by a group of SIDs is written once. RFC 9800 defines it.

Defined in: [RFC 9800 §2](https://www.rfc-editor.org/rfc/rfc9800#section-2) · Learn more: [uSID Compression](usid-compression.md)
{ .gl-ref }

### CSID container (uSID carrier)<span id="usid-container"></span><span id="carrier"></span> {#csid-container}

A **CSID container** is a 128-bit IPv6 address that holds one or more CSIDs and the argument of the last one. The uSID drafts call it the uSID container, and earlier versions the uSID carrier.

Defined in: [RFC 9800 §2](https://www.rfc-editor.org/rfc/rfc9800#section-2) · Learn more: [SID Decoder](../tools/sid-decoder.md)
{ .gl-ref }

## E {#letter-e .gl-letter}

### End {#end}

**End** is the basic SRv6 endpoint behavior and the SRv6 form of a node segment: the node decrements Segments Left, copies the next SID into the destination address and forwards the packet.

Defined in: [RFC 8986 §4.1](https://www.rfc-editor.org/rfc/rfc8986#section-4.1) · Learn more: [Network Programming](network-programming.md#endpoint-behaviors-rfc-8986-section-4)
{ .gl-ref }

### End.B6.Encaps {#end-b6-encaps}

**End.B6.Encaps** is the SRv6 Binding SID behavior: the node finishes the current segment, then pushes a new outer IPv6 header and SRH carrying the SID list of a local SR Policy.

Defined in: [RFC 8986 §4.13](https://www.rfc-editor.org/rfc/rfc8986#section-4.13) · Learn more: [SR Policy](sr-policy.md#binding-sid-bsid)
{ .gl-ref }

### End.B6.Encaps.Red {#end-b6-encaps-red}

**End.B6.Encaps.Red** is End.B6.Encaps with a reduced SRH: the first SID of the new SR Policy goes only into the outer destination address and is left out of the pushed SRH.

Defined in: [RFC 8986 §4.14](https://www.rfc-editor.org/rfc/rfc8986#section-4.14) · Learn more: [SR Policy](sr-policy.md#binding-sid-bsid)
{ .gl-ref }

### End.BM {#end-bm}

**End.BM** binds an SRv6 SID to an SR-MPLS policy: the node pushes the policy's MPLS label stack onto the packet. It joins SRv6 and SR-MPLS domains.

Defined in: [RFC 8986 §4.15](https://www.rfc-editor.org/rfc/rfc8986#section-4.15) · Learn more: [Migration](interworking-migration.md#binding-sid-deep-dive)
{ .gl-ref }

### End.DT2M {#end-dt2m}

**End.DT2M** removes the outer IPv6 header, learns the inner source MAC and floods the frame to the L2 table's interfaces, minus any excluded by its argument for split horizon. It carries EVPN broadcast, unknown-unicast and multicast (BUM) traffic.

Defined in: [RFC 8986 §4.12](https://www.rfc-editor.org/rfc/rfc8986#section-4.12) · Learn more: [EVPN Multihoming](evpn-multihoming.md#evpn-multihoming-over-srv6)
{ .gl-ref }

### End.DT2U {#end-dt2u}

**End.DT2U** removes the outer IPv6 header, learns the inner source MAC and looks up the destination MAC in a specific L2 table (bridge domain). It carries known-unicast EVPN bridged traffic.

Defined in: [RFC 8986 §4.11](https://www.rfc-editor.org/rfc/rfc8986#section-4.11) · Learn more: [VPN Services](../use-cases/vpn-services.md#evpn-elan-e-lan-with-srv6)
{ .gl-ref }

### End.DT4 {#end-dt4}

**End.DT4** removes the outer IPv6 header and looks up the inner IPv4 packet in a specific IPv4 table, typically a VRF. It is the per-VRF SID of an IPv4 L3VPN over SRv6.

Defined in: [RFC 8986 §4.7](https://www.rfc-editor.org/rfc/rfc8986#section-4.7) · Learn more: [BGP Overlay](bgp-overlay-services.md#l3vpn-over-srv6)
{ .gl-ref }

### End.DT46 {#end-dt46}

**End.DT46** removes the outer IPv6 header and looks up the inner packet, IPv4 or IPv6, in a specific VRF. One End.DT46 SID serves a dual-stack VRF.

Defined in: [RFC 8986 §4.8](https://www.rfc-editor.org/rfc/rfc8986#section-4.8) · Learn more: [BGP Overlay](bgp-overlay-services.md#l3vpn-over-srv6)
{ .gl-ref }

### End.DT6 {#end-dt6}

**End.DT6** removes the outer IPv6 header and looks up the inner IPv6 packet in a specific IPv6 table, typically a VRF. It is the per-VRF SID of an IPv6 L3VPN.

Defined in: [RFC 8986 §4.6](https://www.rfc-editor.org/rfc/rfc8986#section-4.6) · Learn more: [BGP Overlay](bgp-overlay-services.md#l3vpn-over-srv6)
{ .gl-ref }

### End.DTMC4, End.DTMC6, End.DTMC46<span id="end-dtmc6"></span><span id="end-dtmc46"></span> {#end-dtmc4}

**End.DTMC4** works like End.DT4 except that the inner packet is looked up in the VRF's IPv4 multicast table; End.DTMC6 and End.DTMC46 do the same for IPv6 and for both families. They are carried as the SRv6 Multicast Service SID in MVPN routes over SRv6.

Defined in: [RFC 10018 §3.1](https://www.rfc-editor.org/rfc/rfc10018#section-3.1) · Learn more: [Multicast](multicast.md)
{ .gl-ref }

### End.DX2 {#end-dx2}

**End.DX2** removes the outer IPv6 header and sends the inner Ethernet frame out of a specific Layer-2 interface. It is the SID of EVPN VPWS (point-to-point E-Line) service.

Defined in: [RFC 8986 §4.9](https://www.rfc-editor.org/rfc/rfc8986#section-4.9) · Learn more: [VPN Services](../use-cases/vpn-services.md#evpn-vpws-e-line-with-srv6)
{ .gl-ref }

### End.DX2V {#end-dx2v}

**End.DX2V** removes the outer IPv6 header and looks up the inner frame's VLAN in a specific L2 table to pick the outgoing interface. It serves EVPN flexible cross-connect.

Defined in: [RFC 8986 §4.10](https://www.rfc-editor.org/rfc/rfc8986#section-4.10) · Learn more: [Network Programming](network-programming.md)
{ .gl-ref }

### End.DX4 {#end-dx4}

**End.DX4** removes the outer IPv6 header and forwards the inner IPv4 packet to a specific Layer-3 adjacency. It is the per-CE SID of an IPv4 L3VPN.

Defined in: [RFC 8986 §4.5](https://www.rfc-editor.org/rfc/rfc8986#section-4.5) · Learn more: [Network Programming](network-programming.md)
{ .gl-ref }

### End.DX6 {#end-dx6}

**End.DX6** removes the outer IPv6 header and forwards the inner IPv6 packet to a specific Layer-3 adjacency. It is the per-CE SID of an IPv6 L3VPN.

Defined in: [RFC 8986 §4.4](https://www.rfc-editor.org/rfc/rfc8986#section-4.4) · Learn more: [Network Programming](network-programming.md)
{ .gl-ref }

### End.LBS and End.XLBS<span id="end-xlbs"></span> {#end-lbs}

**End.LBS** (Locator-Block Swap) and **End.XLBS** let a compressed SID list cross into a domain that uses a different Locator-Block: the node rewrites the block in the destination address to the next domain's block (End.XLBS also cross-connects to a neighbor).

Defined in: [RFC 9800 §7](https://www.rfc-editor.org/rfc/rfc9800#section-7) · Learn more: [Inter-Domain SRv6](inter-domain.md)
{ .gl-ref }

### End.MAP {#end-map}

**End.MAP** replaces the destination address with a new mapped SID and forwards the packet without touching the SRH. Intermediate user plane functions (UPFs) use it in the SRv6 mobile user plane.

Defined in: [RFC 9433 §6.2](https://www.rfc-editor.org/rfc/rfc9433#section-6.2) · Learn more: [5G Transport](../use-cases/5g-transport.md#srv6-mup-mobile-user-plane)
{ .gl-ref }

### End.M.GTP4.E {#end-m-gtp4-e}

**End.M.GTP4.E** builds an IPv4 GTP-U packet toward a legacy gNB from an SRv6 packet. It is the downlink half of IPv4 GTP-U interworking.

Defined in: [RFC 9433 §6.6](https://www.rfc-editor.org/rfc/rfc9433#section-6.6) · Learn more: [5G Transport](../use-cases/5g-transport.md#srv6-mup-mobile-user-plane)
{ .gl-ref }

### End.M.GTP6.D {#end-m-gtp6-d}

**End.M.GTP6.D** terminates an IPv6 GTP-U tunnel from a legacy gNB and sends the payload into an SRv6 policy. It is the uplink half of GTP-U to SRv6 interworking.

Defined in: [RFC 9433 §6.3](https://www.rfc-editor.org/rfc/rfc9433#section-6.3) · Learn more: [5G Transport](../use-cases/5g-transport.md#srv6-mup-mobile-user-plane)
{ .gl-ref }

### End.M.GTP6.D.Di {#end-m-gtp6-d-di}

**End.M.GTP6.D.Di** is the drop-in variant of End.M.GTP6.D: it keeps the GTP-U packet's original destination address as the last SID, so a second SR gateway can rebuild the GTP-U tunnel and both mobile endpoints keep using GTP-U.

Defined in: [RFC 9433 §6.4](https://www.rfc-editor.org/rfc/rfc9433#section-6.4), [RFC 9433 §5.4](https://www.rfc-editor.org/rfc/rfc9433#section-5.4) · Learn more: [5G Transport](../use-cases/5g-transport.md#srv6-mup-mobile-user-plane)
{ .gl-ref }

### End.M.GTP6.E {#end-m-gtp6-e}

**End.M.GTP6.E** builds an IPv6 GTP-U packet toward a legacy gNB from an SRv6 packet, taking the session identifiers from the SID's argument (Args.Mob.Session). It is the downlink half of IPv6 GTP-U interworking.

Defined in: [RFC 9433 §6.5](https://www.rfc-editor.org/rfc/rfc9433#section-6.5) · Learn more: [5G Transport](../use-cases/5g-transport.md#srv6-mup-mobile-user-plane)
{ .gl-ref }

### End-of-Container (End-of-Carrier)<span id="end-of-carrier"></span><span id="eoc"></span> {#end-of-container}

**End-of-Container** is the reserved all-zero uSID value that fills unused positions of a uSID container. When nothing but End-of-Container follows the active uSID, the node moves on to the next SID in the SRH, or treats itself as the final destination if none is left.

Defined in: [uSID draft §3](https://datatracker.ietf.org/doc/draft-filsfils-spring-net-pgm-extension-srv6-usid/), [RFC 9800 §4.1.1](https://www.rfc-editor.org/rfc/rfc9800#section-4.1.1) · Learn more: [SID Decoder](../tools/sid-decoder.md)
{ .gl-ref }

### Endpoint behavior<span id="behavior"></span> {#endpoint-behavior}

An **SRv6 endpoint behavior** is the packet-processing program bound to a local SID and run when a packet's destination address matches it. RFC 8986 defines the base set (End, End.X, End.DT4 and others) and IANA keeps the codepoint registry.

Defined in: [RFC 8986 §4](https://www.rfc-editor.org/rfc/rfc8986#section-4), [RFC 8986 §10.2](https://www.rfc-editor.org/rfc/rfc8986#section-10.2) · Learn more: [Network Programming](network-programming.md)
{ .gl-ref }

### End.Replicate {#end-replicate}

**End.Replicate** is the SRv6 behavior of a Replication segment: the node sends a copy of the packet to each downstream node, with that node's Replication-SID as the destination, and on a leaf or bud node also decapsulates it locally.

Defined in: [RFC 9524 §2.2.1](https://www.rfc-editor.org/rfc/rfc9524#section-2.2.1) · Learn more: [Multicast](multicast.md#approach-2-srv6-replication-segments-endreplicate)
{ .gl-ref }

### End.T {#end-t}

**End.T** does what End does and then looks up the new destination address in a specific IPv6 table instead of the default one.

Defined in: [RFC 8986 §4.3](https://www.rfc-editor.org/rfc/rfc8986#section-4.3) · Learn more: [Network Programming](network-programming.md#endpoint-behaviors-rfc-8986-section-4)
{ .gl-ref }

### End.X {#end-x}

**End.X** (Layer-3 cross-connect) does what End does and then sends the packet over a specific Layer-3 adjacency instead of looking up the new destination. It is the SRv6 Adjacency SID.

Defined in: [RFC 8986 §4.2](https://www.rfc-editor.org/rfc/rfc8986#section-4.2) · Learn more: [Network Programming](network-programming.md#endpoint-behaviors-rfc-8986-section-4)
{ .gl-ref }

### EVPN over SRv6 {#evpn-over-srv6}

**EVPN over SRv6** carries SRv6 L2 service SIDs (End.DX2, End.DX2V, End.DT2U, End.DT2M) in EVPN routes to deliver E-Line, E-LAN and multihomed services over an IPv6 core.

Defined in: [RFC 9252 §6](https://www.rfc-editor.org/rfc/rfc9252#section-6) · Learn more: [BGP Overlay](bgp-overlay-services.md#evpn-over-srv6), [EVPN Multihoming](evpn-multihoming.md)
{ .gl-ref }

## F {#letter-f .gl-letter}

### F1616 {#f1616}

**F1616** is a uSID format with a 16-bit Locator-Block and 16-bit uSIDs, giving seven uSIDs per container at the cost of a whole /16 for the block.

Defined in: [RFC 9800 §4.1](https://www.rfc-editor.org/rfc/rfc9800#section-4.1) · Learn more: [SID Decoder](../tools/sid-decoder.md)
{ .gl-ref }

### F3216 {#f3216}

**F3216** is the uSID format with a 32-bit Locator-Block and 16-bit uSIDs, giving six uSIDs per container. RFC 9800 requires every NEXT-CSID implementation to support this combination.

Defined in: [RFC 9800 §4.1](https://www.rfc-editor.org/rfc/rfc9800#section-4.1) · Learn more: [SID Decoder](../tools/sid-decoder.md), [uSID Compression](usid-compression.md)
{ .gl-ref }

### Flavor {#flavor}

A **flavor** is a variant of an endpoint behavior that adds or changes steps, such as PSP, USP and USD (RFC 8986) or NEXT-CSID and REPLACE-CSID (RFC 9800). Each behavior and flavor combination has its own IANA codepoint.

Defined in: [RFC 8986 §4.16](https://www.rfc-editor.org/rfc/rfc8986#section-4.16), [RFC 9800 §4](https://www.rfc-editor.org/rfc/rfc9800#section-4) · Learn more: [Network Programming](network-programming.md#flavors-psp-usp-usd-rfc-8986-section-416)
{ .gl-ref }

### Flex-Algo (Flexible Algorithm)<span id="flexible-algorithm"></span><span id="flex-algorithm"></span> {#flex-algo}

**Flex-Algo** lets an operator define extra IGP path computations, numbered 128 to 255, each with its own metric and constraints, so one network computes several constrained shortest-path topologies at once. In SRv6 each Flex-Algo gets its own locator.

Defined in: [RFC 9350 §4](https://www.rfc-editor.org/rfc/rfc9350#section-4), [RFC 9352 §7.1](https://www.rfc-editor.org/rfc/rfc9352#section-7.1) · Learn more: [Flex-Algorithm](flex-algorithm.md)
{ .gl-ref }

### Flexible Algorithm Definition (FAD) {#fad}

The **FAD** is the IGP advertisement that defines a Flex-Algo: its metric type (IGP, minimum delay or TE), calculation type and constraints such as admin groups to include or exclude and SRLGs to avoid.

Defined in: [RFC 9350 §5](https://www.rfc-editor.org/rfc/rfc9350#section-5) · Learn more: [Flex-Algorithm](flex-algorithm.md#how-it-works)
{ .gl-ref }

### FRRouting (FRR)<span id="frrouting"></span> {#frr}

**FRRouting** is an open-source routing suite (BGP, IS-IS, OSPF and more) for Linux. It configures SRv6 locators and SIDs, IS-IS SRv6 and BGP L3VPN over SRv6, programming the kernel's seg6 and seg6local routes.

Defined in: [FRRouting](https://frrouting.org/) · Learn more: [FRRouting](../implementations/frrouting.md)
{ .gl-ref }

### Function {#function}

The **function** is the part of an SRv6 SID after the locator: an opaque local value that selects which behavior the node runs, for example End.X toward one neighbor or End.DT4 for one VRF.

Defined in: [RFC 8986 §3.1](https://www.rfc-editor.org/rfc/rfc8986#section-3.1) · Learn more: [SID Structure](sid-structure.md)
{ .gl-ref }

## G {#letter-g .gl-letter}

### GIB and LIB<span id="gib"></span><span id="lib"></span> {#gib-lib}

The **GIB** (Global Identifiers Block) is the range of CSID values allocated domain-wide, such as node uSIDs; the **LIB** (Local Identifiers Block) is the range each node allocates for local SIDs such as uA and uDT.

Defined in: [RFC 9800 §5](https://www.rfc-editor.org/rfc/rfc9800#section-5) · Learn more: [uSID Compression](usid-compression.md)
{ .gl-ref }

### G-SRv6 {#g-srv6}

**G-SRv6** (Generalized SRv6) is a SID compression scheme that packs 32-bit compressed SIDs (G-SIDs) into SRH entries. The IETF standardized it as the REPLACE-CSID flavor of RFC 9800.

Defined in: [RFC 9800 §4.2](https://www.rfc-editor.org/rfc/rfc9800#section-4.2) · Learn more: [uSID Compression](usid-compression.md#usid-vs-g-srv6)
{ .gl-ref }

## H {#letter-h .gl-letter}

### H.Encaps {#h-encaps}

**H.Encaps** is the SR headend behavior that wraps the received packet in a new outer IPv6 header with an SRH holding the SR Policy's SID list, with the first SID as the destination address.

Defined in: [RFC 8986 §5.1](https://www.rfc-editor.org/rfc/rfc8986#section-5.1) · Learn more: [Network Programming](network-programming.md#headend-behaviors-rfc-8986-section-5)
{ .gl-ref }

### H.Encaps.L2 {#h-encaps-l2}

**H.Encaps.L2** applies H.Encaps to a received Ethernet frame: the whole frame becomes the payload of the new IPv6 packet, identified by Next Header 143 (Ethernet).

Defined in: [RFC 8986 §5.3](https://www.rfc-editor.org/rfc/rfc8986#section-5.3), [RFC 8986 §10.1](https://www.rfc-editor.org/rfc/rfc8986#section-10.1) · Learn more: [VPN Services](../use-cases/vpn-services.md#srv6-based-l2vpn)
{ .gl-ref }

### H.Encaps.L2.Red {#h-encaps-l2-red}

**H.Encaps.L2.Red** is H.Encaps.L2 with a reduced SRH, leaving the first SID out of the SRH (or omitting the SRH for a single-SID policy).

Defined in: [RFC 8986 §5.4](https://www.rfc-editor.org/rfc/rfc8986#section-5.4) · Learn more: [Network Programming](network-programming.md#headend-behaviors-rfc-8986-section-5)
{ .gl-ref }

### H.Encaps.Red {#h-encaps-red}

**H.Encaps.Red** is H.Encaps with a reduced SRH: the first SID goes only in the destination address and is left out of the SRH. If the policy has a single SID and needs no flags, tag or TLVs, the SRH is omitted entirely.

Defined in: [RFC 8986 §5.2](https://www.rfc-editor.org/rfc/rfc8986#section-5.2) · Learn more: [SRH & Packet Walk](srh-packet-walk.md#reduced-encapsulation)
{ .gl-ref }

### HMAC TLV<span id="hmac"></span> {#hmac-tlv}

The **HMAC TLV** (SRH TLV type 5) carries a keyed hash over the source address, Last Entry, Flags, HMAC Key ID and full Segment List, so an SR domain edge can verify that an SRH was built by a trusted source. It authenticates the SRH but gives no confidentiality and no replay protection.

Defined in: [RFC 8754 §2.1.2](https://www.rfc-editor.org/rfc/rfc8754#section-2.1.2) · Learn more: [Security](security.md#hmac-deep-dive)
{ .gl-ref }

### H.M.GTP4.D {#h-m-gtp4-d}

**H.M.GTP4.D** is a headend behavior on an SR gateway that terminates an IPv4 GTP-U tunnel and steers the payload into an SRv6 policy. It is the uplink half of IPv4 GTP-U interworking.

Defined in: [RFC 9433 §6.7](https://www.rfc-editor.org/rfc/rfc9433#section-6.7) · Learn more: [5G Transport](../use-cases/5g-transport.md#srv6-mup-mobile-user-plane)
{ .gl-ref }

## I {#letter-i .gl-letter}

### Infrastructure ACL (iACL)<span id="infrastructure-acl"></span> {#iacl}

An **infrastructure ACL** on every external interface of the SR domain drops incoming packets whose destination is in the domain's SID block. RFC 8754 requires this filtering, or an equivalent, to keep the SR domain closed to outside sources.

Defined in: [RFC 8754 §5.1](https://www.rfc-editor.org/rfc/rfc8754#section-5.1) · Learn more: [Security](security.md#filtering-best-practices)
{ .gl-ref }

### IOAM (In-situ OAM)<span id="in-situ-oam"></span> {#ioam}

**IOAM** records operational data such as node IDs, timestamps and queue depth inside live data packets as they cross a domain. In IPv6 it is carried in Hop-by-Hop or Destination Options headers.

Defined in: [RFC 9197](https://www.rfc-editor.org/rfc/rfc9197), [RFC 9486](https://www.rfc-editor.org/rfc/rfc9486) · Learn more: [OAM](oam-troubleshooting.md#ioam-deep-dive-rfc-9326)
{ .gl-ref }

### IPFIX for SRv6 {#ipfix}

**IPFIX for SRv6** adds information elements, such as the active segment, Segments Left, the SRH segment list and the endpoint behavior, so flow exporters can report how traffic uses SRv6 paths.

Defined in: [RFC 9487](https://www.rfc-editor.org/rfc/rfc9487) · Learn more: [Telemetry](telemetry.md#ipfix-for-srv6)
{ .gl-ref }

## L {#letter-l .gl-letter}

### L3VPN over SRv6 {#l3vpn-over-srv6}

**L3VPN over SRv6** is BGP IP VPN service in which VPN routes carry an SRv6 service SID (End.DT4, End.DT6, End.DT46, End.DX4 or End.DX6) instead of a VPN label, so PE-to-PE traffic is plain IPv6 with no MPLS in the core.

Defined in: [RFC 9252 §5](https://www.rfc-editor.org/rfc/rfc9252#section-5) · Learn more: [VPN Services](../use-cases/vpn-services.md#srv6-based-l3vpn)
{ .gl-ref }

### Last Entry {#last-entry}

**Last Entry** is the SRH field holding the zero-based index of the last element of the Segment List. Because the list is stored in reverse, that element is the first segment of the path, or the second with a reduced SRH.

Defined in: [RFC 8754 §2](https://www.rfc-editor.org/rfc/rfc8754#section-2), [RFC 8754 §4.1.1](https://www.rfc-editor.org/rfc/rfc8754#section-4.1.1) · Learn more: [SRH & Packet Walk](srh-packet-walk.md#srh-format-rfc-8754)
{ .gl-ref }

### Locator<span id="srv6-locator"></span> {#locator}

The **locator** is the leading part of an SRv6 SID: a routable IPv6 prefix that leads to the node instantiating the SID. It is written B:N, the SID block B followed by the node identifier N.

Defined in: [RFC 8986 §3.1](https://www.rfc-editor.org/rfc/rfc8986#section-3.1) · Learn more: [SID Structure](sid-structure.md#anatomy-of-an-srv6-sid)
{ .gl-ref }

### Locator-Node {#locator-node}

The **Locator-Node** is the part of a locator after the SID block that identifies one node (the N in B:N). In compressed SRv6, the Locator-Node plus the function form the compressed SID.

Defined in: [RFC 9800 §2](https://www.rfc-editor.org/rfc/rfc9800#section-2) · Learn more: [uSID Compression](usid-compression.md)
{ .gl-ref }

### Loop-Free Alternate (LFA)<span id="remote-lfa"></span><span id="rlfa"></span> {#lfa}

An **LFA** is a neighbor that can forward to the destination without looping back through the failed resource. Plain and remote LFA leave gaps that depend on topology; TI-LFA closes them with segment lists.

Defined in: [RFC 5286](https://www.rfc-editor.org/rfc/rfc5286), [RFC 7490](https://www.rfc-editor.org/rfc/rfc7490) · Learn more: [TI-LFA](ti-lfa.md#ti-lfa-vs-other-frr-mechanisms)
{ .gl-ref }

## M {#letter-m .gl-letter}

### Maximum SID Depth (MSD) {#msd}

**MSD** advertisements tell headends and PCEs how many SIDs a node can process, pop or push, such as Maximum Segments Left and Maximum H.Encaps, so they never build a SID list the hardware cannot handle.

Defined in: [RFC 9352 §4](https://www.rfc-editor.org/rfc/rfc9352#section-4) · Learn more: [Performance](performance-scaling.md#hardware-forwarding)
{ .gl-ref }

### Microloop<span id="micro-loop"></span> {#microloop}

A **microloop** is a short-lived forwarding loop during IGP convergence, caused by routers updating their FIBs at different times. Segment routing can avoid it by holding traffic on a loop-free segment list until every router has converged.

Defined in: [RFC 5715](https://www.rfc-editor.org/rfc/rfc5715) · Learn more: [Micro-Loop Avoidance](micro-loop-avoidance.md)
{ .gl-ref }

## N {#letter-n .gl-letter}

### Network Programming {#network-programming}

**SRv6 Network Programming** is the model in which a packet's SID list works as a program: each SID names an instruction on a specific node, and the source chains them into an end-to-end service.

Defined in: [RFC 8986 §1](https://www.rfc-editor.org/rfc/rfc8986#section-1) · Learn more: [Network Programming](network-programming.md)
{ .gl-ref }

### NEXT-CSID (NEXT-C-SID)<span id="next-c-sid"></span> {#next-csid}

**NEXT-CSID** is the RFC 9800 flavor in which one 128-bit container holds the Locator-Block followed by several CSIDs; each node consumes its CSID by shifting the rest left and forwards on the new destination address. It is the standardized form of uSID.

Defined in: [RFC 9800 §4.1](https://www.rfc-editor.org/rfc/rfc9800#section-4.1) · Learn more: [uSID Compression](usid-compression.md#usid-vs-g-srv6)
{ .gl-ref }

### Node-SID {#node-sid}

A **Node-SID** is a Prefix-SID whose prefix identifies one specific router, typically its loopback. In SRv6 the uN or End SID of a node plays this role.

Defined in: [RFC 8402 §3.2](https://www.rfc-editor.org/rfc/rfc8402#section-3.2) · Learn more: [SID Structure](sid-structure.md)
{ .gl-ref }

## O {#letter-o .gl-letter}

### O-flag<span id="oam-flag"></span> {#o-flag}

The **O-flag** is the OAM bit in the SRH Flags field. A segment endpoint that supports it makes a timestamped copy of the marked packet for its local telemetry process, and forwards the original unchanged.

Defined in: [RFC 9259 §2.1](https://www.rfc-editor.org/rfc/rfc9259#section-2.1) · Learn more: [OAM](oam-troubleshooting.md)
{ .gl-ref }

### On-Demand Next-hop (ODN)<span id="on-demand-nexthop"></span> {#odn}

**ODN** (On-Demand Next-hop) is a headend feature that creates an SR Policy from a template when a BGP route arrives with a matching color, so policies exist only for endpoints in use. It is a vendor feature built on RFC 9256 steering, not a protocol of its own.

Defined in: [RFC 9256 §8.4](https://www.rfc-editor.org/rfc/rfc9256#section-8.4) · Learn more: [SR Policy](sr-policy.md#on-demand-nexthop-odn)
{ .gl-ref }

## P {#letter-p .gl-letter}

### Path Computation Element (PCE) {#pce}

A **PCE** is an entity, often a controller, that computes paths for network nodes using a topology database usually learned through BGP-LS. For SR it returns segment lists for SR Policies.

Defined in: [RFC 4655](https://www.rfc-editor.org/rfc/rfc4655), [RFC 9256 §5.2](https://www.rfc-editor.org/rfc/rfc9256#section-5.2) · Learn more: [SR Policy](sr-policy.md#dynamic-path-computation)
{ .gl-ref }

### Path Tracing {#path-tracing}

**Path Tracing** is an SRv6 OAM method in which every hop writes a few bytes (outgoing interface ID, load and a truncated timestamp) into a Hop-by-Hop option, so one probe reveals the exact ECMP path and per-hop delay. It is an IETF draft, not yet an RFC.

Defined in: [draft-filsfils-ippm-path-tracing](https://datatracker.ietf.org/doc/draft-filsfils-ippm-path-tracing/) · Learn more: [OAM](oam-troubleshooting.md#srv6-path-tracing-deep-dive)
{ .gl-ref }

### PCEP {#pcep}

**PCEP** (PCE Communication Protocol) runs between a PCE and its clients to request, delegate and initiate paths. RFC 8664 adds SR-MPLS segment lists and RFC 9603 adds SRv6.

Defined in: [RFC 5440](https://www.rfc-editor.org/rfc/rfc5440), [RFC 8664](https://www.rfc-editor.org/rfc/rfc8664), [RFC 9603](https://www.rfc-editor.org/rfc/rfc9603) · Learn more: [RFC 9603 summary](../rfcs/rfc9603.md)
{ .gl-ref }

### Per-flow steering<span id="per-flow-policy"></span><span id="pfp"></span> {#per-flow-steering}

**Per-flow steering** sends flows to the same endpoint over different SR Policies according to a per-packet forwarding class (set from DSCP or other fields), rather than by destination prefix. Vendors sell it as Per-Flow Policy (PFP).

Defined in: [RFC 9256 §8.6](https://www.rfc-editor.org/rfc/rfc9256#section-8.6) · Learn more: [QoS](qos.md#sr-policy-qos)
{ .gl-ref }

### Point of Local Repair (PLR) {#plr}

The **PLR** is the router that detects the failure of a directly attached link or node and redirects traffic onto its pre-computed backup path.

Defined in: [RFC 9855 §2.1](https://www.rfc-editor.org/rfc/rfc9855#section-2.1) · Learn more: [TI-LFA](ti-lfa.md#key-terms)
{ .gl-ref }

### Post-convergence path {#post-convergence-path}

The **post-convergence path** is the path traffic will follow once the IGP has converged after a failure. TI-LFA sends repaired traffic along it, avoiding a second path change when convergence completes.

Defined in: [RFC 9855 §3](https://www.rfc-editor.org/rfc/rfc9855#section-3) · Learn more: [TI-LFA](ti-lfa.md)
{ .gl-ref }

### PQ-node {#pq-node}

A **PQ-node** is a node in both the (extended) P-space and the Q-space for a failure. The PLR needs only one segment to reach it, and normal forwarding from there delivers the packet without crossing the failure.

Defined in: [RFC 9855 §5.2](https://www.rfc-editor.org/rfc/rfc9855#section-5.2), [RFC 7490](https://www.rfc-editor.org/rfc/rfc7490) · Learn more: [TI-LFA](ti-lfa.md#worked-example-finding-p-q-and-the-repair-list)
{ .gl-ref }

### Prefix-SID {#prefix-sid}

A **Prefix-SID** is the SID of an IGP prefix segment: it sends the packet along the IGP shortest path, for the advertised algorithm, to the node that owns the prefix. In SRv6 a Prefix-SID is an IPv6 address, normally an End SID within the node's locator.

Defined in: [RFC 8402 §3.1](https://www.rfc-editor.org/rfc/rfc8402#section-3.1), [RFC 8402 §3.1.3](https://www.rfc-editor.org/rfc/rfc8402#section-3.1.3) · Learn more: [SID Structure](sid-structure.md)
{ .gl-ref }

### P-space<span id="extended-p-space"></span> {#p-space}

The **P-space** of a router for a protected resource is the set of nodes it can reach on pre-failure shortest paths that never cross that resource. The extended P-space adds the nodes its neighbors can reach that way.

Defined in: [RFC 9855 §2.1](https://www.rfc-editor.org/rfc/rfc9855#section-2.1), [RFC 7490](https://www.rfc-editor.org/rfc/rfc7490) · Learn more: [TI-LFA](ti-lfa.md#worked-example-finding-p-q-and-the-repair-list)
{ .gl-ref }

### PSP (Penultimate Segment Pop)<span id="penultimate-segment-pop"></span> {#psp}

**PSP** (Penultimate Segment Pop) is a flavor of End, End.X and End.T in which the penultimate segment endpoint removes the SRH after writing the last SID into the destination address, so the final node receives a packet without an SRH.

Defined in: [RFC 8986 §4.16.1](https://www.rfc-editor.org/rfc/rfc8986#section-4.16.1) · Learn more: [SRH & Packet Walk](srh-packet-walk.md#psp-usp-and-usd-flavors)
{ .gl-ref }

## Q {#letter-q .gl-letter}

### Q-space {#q-space}

The **Q-space** of a destination for a protected resource is the set of nodes from which that destination is reached on shortest paths that never cross the resource.

Defined in: [RFC 9855 §2.1](https://www.rfc-editor.org/rfc/rfc9855#section-2.1), [RFC 7490](https://www.rfc-editor.org/rfc/rfc7490) · Learn more: [TI-LFA](ti-lfa.md#worked-example-finding-p-q-and-the-repair-list)
{ .gl-ref }

## R {#letter-r .gl-letter}

### Repair list {#repair-list}

The **repair list** is the segment list the PLR adds to protected traffic to force it along the post-convergence path, for example a node SID to a P node followed by an adjacency SID to a Q node.

Defined in: [RFC 9855 §5](https://www.rfc-editor.org/rfc/rfc9855#section-5) · Learn more: [TI-LFA](ti-lfa.md)
{ .gl-ref }

### REPLACE-CSID (REPLACE-C-SID)<span id="replace-c-sid"></span> {#replace-csid}

**REPLACE-CSID** is the RFC 9800 flavor in which later CSIDs are packed into SRH entries and each node replaces the CSID in the destination address with the next one, tracked by an index in the argument. It is the standardized form of G-SRv6 compression.

Defined in: [RFC 9800 §4.2](https://www.rfc-editor.org/rfc/rfc9800#section-4.2) · Learn more: [uSID Compression](usid-compression.md#usid-vs-g-srv6)
{ .gl-ref }

### Replication segment<span id="replication-sid"></span> {#replication-segment}

A **Replication segment** makes a node replicate a packet to a set of downstream nodes, each reached directly or through a segment list. Replication segments are stitched together to form SR point-to-multipoint trees.

Defined in: [RFC 9524 §2](https://www.rfc-editor.org/rfc/rfc9524#section-2) · Learn more: [Multicast](multicast.md)
{ .gl-ref }

### Routing Header type 4 (RH4)<span id="rh4"></span> {#routing-type-4}

**Routing Header type 4** is the IPv6 Routing Type value assigned to the Segment Routing Header. Only the node whose SID is in the destination address processes it; transit routers forward on the destination address alone.

Defined in: [RFC 8754 §2](https://www.rfc-editor.org/rfc/rfc8754#section-2), [RFC 8200 §4.4](https://www.rfc-editor.org/rfc/rfc8200#section-4.4) · Learn more: [SRH & Packet Walk](srh-packet-walk.md#srh-format-rfc-8754)
{ .gl-ref }

## S {#letter-s .gl-letter}

### SAI (Switch Abstraction Interface)<span id="switch-abstraction-interface"></span> {#sai}

**SAI** (Switch Abstraction Interface) is the vendor-neutral C API that SONiC and other network operating systems use to program switch ASICs. Its SRv6 objects, such as SID lists and My SID entries, let one software stack drive different chips.

Defined in: [OCP SAI](https://github.com/opencomputeproject/SAI) · Learn more: [SONiC & SAI](sonic-sai.md#what-is-sai)
{ .gl-ref }

### seg6 and seg6local<span id="seg6local"></span> {#seg6}

**seg6** and **seg6local** are the Linux kernel's SRv6 route types: seg6 encapsulates traffic matching a route into an SRv6 SID list (headend), and seg6local binds a local SID to an endpoint behavior such as End, End.X or End.DT4.

Defined in: [ip-route(8)](https://man7.org/linux/man-pages/man8/ip-route.8.html) · Learn more: [Linux Kernel](../implementations/linux-kernel.md)
{ .gl-ref }

### Segment {#segment}

A **segment** is an instruction a node executes on a packet, such as "forward along the shortest path to node X", "send out this link" or "deliver into this VPN". Segment Routing steers a packet by attaching an ordered list of segments to it.

Defined in: [RFC 8402 §2](https://www.rfc-editor.org/rfc/rfc8402#section-2) · Learn more: [What is SRv6?](what-is-srv6.md#how-srv6-works-the-building-blocks)
{ .gl-ref }

### Segment endpoint node {#segment-endpoint-node}

An **SR segment endpoint node** is a node that receives a packet whose destination address is one of its local SIDs and executes the behavior bound to that SID.

Defined in: [RFC 8754 §3.3](https://www.rfc-editor.org/rfc/rfc8754#section-3.3) · Learn more: [SRH & Packet Walk](srh-packet-walk.md)
{ .gl-ref }

### Segment Identifier (SID) {#sid}

A **SID** (Segment Identifier) identifies a segment. In SRv6 a SID is a 128-bit IPv6 address that routes the packet to the node that owns it and selects the behavior that node runs.

Defined in: [RFC 8402 §2](https://www.rfc-editor.org/rfc/rfc8402#section-2), [RFC 8986 §3](https://www.rfc-editor.org/rfc/rfc8986#section-3) · Learn more: [SID Structure](sid-structure.md), [SID Decoder](../tools/sid-decoder.md)
{ .gl-ref }

### Segment List<span id="sid-list"></span> {#segment-list}

The **Segment List** is the SRH array of 128-bit SIDs, stored in reverse order: Segment List[0] is the last segment of the path and the highest index is the first.

Defined in: [RFC 8754 §2](https://www.rfc-editor.org/rfc/rfc8754#section-2) · Learn more: [SRH & Packet Walk](srh-packet-walk.md)
{ .gl-ref }

### Segment Routing Header (SRH)<span id="segment-routing-header"></span> {#srh}

The **SRH** is the IPv6 Routing Header (type 4) that carries an ordered list of SRv6 SIDs, the Segments Left pointer, flags, a tag and optional TLVs. It can be left out when the whole path fits in the destination address, as with a single SID or one uSID container.

Defined in: [RFC 8754 §2](https://www.rfc-editor.org/rfc/rfc8754#section-2) · Learn more: [SRH & Packet Walk](srh-packet-walk.md)
{ .gl-ref }

### Segments Left (SL) {#segments-left}

**Segments Left** is the SRH field that counts how many segments remain to be visited. Each segment endpoint decrements it and copies Segment List[Segments Left] into the destination address.

Defined in: [RFC 8754 §2](https://www.rfc-editor.org/rfc/rfc8754#section-2), [RFC 8986 §4.1](https://www.rfc-editor.org/rfc/rfc8986#section-4.1) · Learn more: [SRH & Packet Walk](srh-packet-walk.md#complete-packet-walk)
{ .gl-ref }

### Service SID {#service-sid}

A **service SID** is an SRv6 SID that an egress PE advertises in BGP to identify a VPN, VRF or EVPN instance, such as End.DT4 or End.DX2. It does the job the VPN label does in MPLS.

Defined in: [RFC 9252 §2](https://www.rfc-editor.org/rfc/rfc9252#section-2) · Learn more: [BGP Overlay](bgp-overlay-services.md)
{ .gl-ref }

### Shared Risk Link Group (SRLG) {#srlg}

An **SRLG** is a set of links that share a resource, such as a fiber duct or line card, and can fail together. TI-LFA and Flex-Algo can avoid a whole SRLG so a backup path does not share the primary's risk.

Defined in: [RFC 9855 §4](https://www.rfc-editor.org/rfc/rfc9855#section-4), [RFC 9350 §6.5](https://www.rfc-editor.org/rfc/rfc9350#section-6.5) · Learn more: [TI-LFA](ti-lfa.md#link-vs-node-vs-srlg-protection)
{ .gl-ref }

### SID block<span id="locator-block"></span> {#sid-block}

The **SRv6 SID block** is the IPv6 prefix an operator reserves for the SRv6 SIDs of a domain (the B in B:N); every locator is carved from it. RFC 9800 calls it the Locator-Block.

Defined in: [RFC 8986 §3.1](https://www.rfc-editor.org/rfc/rfc8986#section-3.1), [RFC 9800 §2](https://www.rfc-editor.org/rfc/rfc9800#section-2) · Learn more: [SID Structure](sid-structure.md)
{ .gl-ref }

### SONiC {#sonic}

**SONiC** (Software for Open Networking in the Cloud) is an open-source, Linux-based network operating system for white-box switches, hosted by the Linux Foundation. It programs the ASIC through SAI and uses FRRouting as its routing stack, including for SRv6.

Defined in: [SONiC project](https://sonicfoundation.dev/) · Learn more: [SONiC & SAI](sonic-sai.md), [SONiC](../implementations/sonic.md)
{ .gl-ref }

### SR domain {#sr-domain}

An **SR domain** is the set of nodes that take part in the segment routing model, normally under one administrative entity. SRv6 SIDs are meant for use inside this trusted domain and are filtered at its edges.

Defined in: [RFC 8402 §2](https://www.rfc-editor.org/rfc/rfc8402#section-2), [RFC 8754 §5.1](https://www.rfc-editor.org/rfc/rfc8754#section-5.1) · Learn more: [Security](security.md)
{ .gl-ref }

### SRH insertion (H.Insert)<span id="srh-insertion"></span> {#h-insert}

**SRH insertion** (H.Insert) adds an SRH to the existing IPv6 packet instead of adding a new outer IPv6 header. It is not part of RFC 8986 and is specified only in an individual Internet-Draft.

Defined in: [draft-filsfils-spring-srv6-net-pgm-insertion](https://datatracker.ietf.org/doc/draft-filsfils-spring-srv6-net-pgm-insertion/) · Learn more: [Network Programming](network-programming.md)
{ .gl-ref }

### SR-MPLS {#sr-mpls}

**SR-MPLS** is Segment Routing on the MPLS data plane: each segment is an MPLS label and the segment list is a label stack.

Defined in: [RFC 8402 §2](https://www.rfc-editor.org/rfc/rfc8402#section-2), [RFC 8660](https://www.rfc-editor.org/rfc/rfc8660) · Learn more: [SRv6 vs SR-MPLS](srv6-vs-sr-mpls.md)
{ .gl-ref }

### SR P2MP Policy (Tree-SID)<span id="tree-sid"></span> {#sr-p2mp-policy}

An **SR P2MP Policy** carries traffic from a root to a set of leaves over a tree built from Replication segments, usually computed by a controller. Tree-SID is the common vendor name for this approach.

Defined in: [RFC 9960 §2](https://www.rfc-editor.org/rfc/rfc9960#section-2) · Learn more: [Multicast](multicast.md#approach-3-tree-sid)
{ .gl-ref }

### SR Policy<span id="srv6-policy"></span> {#sr-policy}

An **SR Policy** is an ordered list of segments that a headend uses to steer traffic, identified by the tuple headend, color and endpoint, and realized by one or more candidate paths.

Defined in: [RFC 8402 §2](https://www.rfc-editor.org/rfc/rfc8402#section-2), [RFC 9256 §2.1](https://www.rfc-editor.org/rfc/rfc9256#section-2.1) · Learn more: [SR Policy](sr-policy.md)
{ .gl-ref }

### SR source node (headend)<span id="sr-source-node"></span> {#headend}

The **headend**, or SR source node, is the node that builds the SRv6 packet or outer encapsulation and writes the SID list, typically to steer traffic into an SR Policy.

Defined in: [RFC 8754 §3.1](https://www.rfc-editor.org/rfc/rfc8754#section-3.1), [RFC 8986 §5](https://www.rfc-editor.org/rfc/rfc8986#section-5) · Learn more: [Network Programming](network-programming.md)
{ .gl-ref }

### SRv6 {#srv6}

**SRv6** (Segment Routing over IPv6) is Segment Routing on the IPv6 data plane: each segment is an IPv6 address (a SID), and a path of several segments is listed in a Segment Routing Header.

Defined in: [RFC 8402 §2](https://www.rfc-editor.org/rfc/rfc8402#section-2), [RFC 8754](https://www.rfc-editor.org/rfc/rfc8754), [RFC 8986](https://www.rfc-editor.org/rfc/rfc8986) · Learn more: [What is SRv6?](what-is-srv6.md)
{ .gl-ref }

### SRv6 Locator TLV {#srv6-locator-tlv}

The IS-IS **SRv6 Locator TLV** (type 27) advertises a node's locator with its algorithm and metric, plus the End SIDs instantiated in it. OSPFv3 carries the same information in the SRv6 Locator LSA.

Defined in: [RFC 9352 §7.1](https://www.rfc-editor.org/rfc/rfc9352#section-7.1), [RFC 9513 §7](https://www.rfc-editor.org/rfc/rfc9513#section-7) · Learn more: [RFC 9352 summary](../rfcs/rfc9352.md)
{ .gl-ref }

### SRv6 MUP (Mobile User Plane)<span id="srv6-mup"></span><span id="mobile-user-plane"></span> {#mup}

**SRv6 MUP** replaces GTP-U tunnels in mobile networks with SRv6 segments. RFC 9433 defines the SRv6 mobility behaviors, and the BGP MUP SAFI (an IETF draft, not yet an RFC) distributes the session routes.

Defined in: [RFC 9433](https://www.rfc-editor.org/rfc/rfc9433), [draft-ietf-bess-mup-safi](https://datatracker.ietf.org/doc/draft-ietf-bess-mup-safi/) · Learn more: [5G Transport](../use-cases/5g-transport.md#srv6-mup-mobile-user-plane)
{ .gl-ref }

### SRv6 ping and traceroute<span id="srv6-traceroute"></span> {#srv6-ping}

**SRv6 ping and traceroute** are ordinary ICMPv6 and UDP probes sent to a SID, with or without an SRH, to check that the SID is reachable and programmed and to locate faults hop by hop. No new protocol is needed.

Defined in: [RFC 9259 §2.2](https://www.rfc-editor.org/rfc/rfc9259#section-2.2) · Learn more: [OAM](oam-troubleshooting.md#srv6-ping)
{ .gl-ref }

### SRv6 Service TLV {#srv6-service-tlv}

The **SRv6 L3 Service TLV** (type 5) and **SRv6 L2 Service TLV** (type 6) of the BGP Prefix-SID attribute carry a route's service SID, its endpoint behavior and its SID structure.

Defined in: [RFC 9252 §2](https://www.rfc-editor.org/rfc/rfc9252#section-2) · Learn more: [BGP Overlay](bgp-overlay-services.md#bgp-srv6-service-tlv-rfc-9252)
{ .gl-ref }

### STAMP<span id="sr-pm"></span><span id="srpm"></span> {#stamp}

**STAMP** (Simple Two-way Active Measurement Protocol) sends UDP test packets to measure one-way and round-trip delay, delay variation and packet loss. SR performance measurement uses it to measure links and SR Policies.

Defined in: [RFC 8762](https://www.rfc-editor.org/rfc/rfc8762), [draft-ietf-spring-stamp-srpm](https://datatracker.ietf.org/doc/draft-ietf-spring-stamp-srpm/) · Learn more: [SRPM](srpm.md)
{ .gl-ref }

## T {#letter-t .gl-letter}

### TI-LFA<span id="topology-independent-lfa"></span> {#ti-lfa}

**TI-LFA** (Topology-Independent Loop-Free Alternate) is segment routing fast reroute: each router pre-computes a repair segment list that follows the post-convergence path around a failed link, node or SRLG, and switches to it as soon as it detects the failure. It provides protection in any topology.

Defined in: [RFC 9855](https://www.rfc-editor.org/rfc/rfc9855) · Learn more: [TI-LFA](ti-lfa.md)
{ .gl-ref }

### Transit node {#transit-node}

A **transit node** forwards an SRv6 packet like any other IPv6 packet, using only the destination address. It needs no SRv6 support and does not inspect the SRH.

Defined in: [RFC 8754 §3.2](https://www.rfc-editor.org/rfc/rfc8754#section-3.2) · Learn more: [SRH & Packet Walk](srh-packet-walk.md)
{ .gl-ref }

### Transposition {#transposition}

**Transposition** is the RFC 9252 scheme that moves part of a service SID, typically the function, into the label field of the BGP NLRI so routes with different SIDs can share one attribute and pack into fewer updates. The SID Structure Sub-Sub-TLV records which bits moved.

Defined in: [RFC 9252 §4](https://www.rfc-editor.org/rfc/rfc9252#section-4) · Learn more: [BGP Overlay](bgp-overlay-services.md#bgp-srv6-service-tlv-rfc-9252)
{ .gl-ref }

## U {#letter-u .gl-letter}

### uA {#ua}

**uA** is the uSID name for End.X with the NEXT-CSID, PSP and USD flavors: the adjacency uSID. It consumes its uSID and sends the packet over a specific link.

Defined in: [uSID draft §4.1.2](https://datatracker.ietf.org/doc/draft-filsfils-spring-net-pgm-extension-srv6-usid/), [RFC 9800 §4.1.2](https://www.rfc-editor.org/rfc/rfc9800#section-4.1.2) · Learn more: [uSID Compression](usid-compression.md)
{ .gl-ref }

### uDT (uDT4, uDT6, uDT46)<span id="udt4"></span><span id="udt6"></span><span id="udt46"></span> {#udt}

**uDT** is the uSID form of the End.DT decapsulation behaviors: a service uSID that removes the outer header and looks the inner packet up in a VRF (uDT4, uDT6, uDT46) or bridge table (uDT2U, uDT2M).

Defined in: [uSID draft §4.2.1](https://datatracker.ietf.org/doc/draft-filsfils-spring-net-pgm-extension-srv6-usid/), [RFC 9800 §4](https://www.rfc-editor.org/rfc/rfc9800#section-4) · Learn more: [uSID Compression](usid-compression.md)
{ .gl-ref }

### uN {#un}

**uN** is the uSID name for End with the NEXT-CSID, PSP and USD flavors: the node uSID. On a match the node shifts the next uSID into place and forwards, or, when no uSID is left, acts as a regular End SID.

Defined in: [uSID draft §4.1.1](https://datatracker.ietf.org/doc/draft-filsfils-spring-net-pgm-extension-srv6-usid/), [RFC 9800 §4.1.1](https://www.rfc-editor.org/rfc/rfc9800#section-4.1.1) · Learn more: [uSID Compression](usid-compression.md)
{ .gl-ref }

### USD (Ultimate Segment Decapsulation)<span id="ultimate-segment-decapsulation"></span> {#usd}

**USD** (Ultimate Segment Decapsulation) is a flavor of End, End.X and End.T in which the last segment endpoint removes the outer IPv6 header with all its extension headers and forwards the inner IPv4 or IPv6 packet.

Defined in: [RFC 8986 §4.16.3](https://www.rfc-editor.org/rfc/rfc8986#section-4.16.3) · Learn more: [SRH & Packet Walk](srh-packet-walk.md#psp-usp-and-usd-flavors)
{ .gl-ref }

### uSID (micro-SID)<span id="micro-sid"></span> {#usid}

A **uSID** (micro-SID) is a short compressed SRv6 SID, usually 16 bits; with a 32-bit block, six fit in one IPv6 address, so a multi-hop path often needs no SRH at all. uSID is the industry name for SIDs with the RFC 9800 NEXT-CSID flavor.

Defined in: [RFC 9800 §4.1](https://www.rfc-editor.org/rfc/rfc9800#section-4.1), [uSID draft](https://datatracker.ietf.org/doc/draft-filsfils-spring-net-pgm-extension-srv6-usid/) · Learn more: [uSID Compression](usid-compression.md), [SID Decoder](../tools/sid-decoder.md)
{ .gl-ref }

### USP (Ultimate Segment Pop)<span id="ultimate-segment-pop"></span> {#usp}

**USP** (Ultimate Segment Pop) is a flavor of End, End.X and End.T in which the last segment endpoint, where Segments Left is 0, removes the SRH before processing the rest of the packet.

Defined in: [RFC 8986 §4.16.2](https://www.rfc-editor.org/rfc/rfc8986#section-4.16.2) · Learn more: [SRH & Packet Walk](srh-packet-walk.md#psp-usp-and-usd-flavors)
{ .gl-ref }

## Further Reading

- :material-arrow-right: [What is SRv6?](what-is-srv6.md) - The definitive introduction, with a hop-by-hop packet walk
- :material-arrow-right: [SID Structure](sid-structure.md) - Locator, function and argument in detail
- :material-arrow-right: [Network Programming](network-programming.md) - Every endpoint and headend behavior
- :material-arrow-right: [SRv6 SID Decoder](../tools/sid-decoder.md) - Decode any SID or uSID container bit by bit
- :material-arrow-right: [RFCs & Standards](../rfcs/index.md) - Summaries of the SRv6 RFCs cited above
- :material-arrow-right: [AI Networking Glossary](../ai/ai-glossary.md) - GPU fabric and collective-communication terms
