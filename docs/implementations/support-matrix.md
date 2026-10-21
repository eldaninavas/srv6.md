---
title: Support Matrix
seo_title: "SRv6 Support Matrix: Vendor and Open-Source Support"
description: "Which SRv6 behaviors, uSID, IS-IS, BGP services, TI-LFA, Flex-Algo and OAM features each platform supports, with minimum releases and a source for every cell."
tags:
  - implementations
  - SRv6 support matrix
  - SRv6 vendor support
  - SRv6 interoperability
---

# SRv6 Support Matrix

Which SRv6 features does each router OS and open-source data plane actually implement, and since which release? This page answers that for 11 platforms and 36 capabilities, from RFC 8986 endpoint behaviors to uSID, control-plane extensions, protection, multicast, OAM and mobile user plane. **Every cell links to the vendor document, release note or source code that states it.** When we could not find a source, the cell says *unknown* rather than guessing.

<div class="smx-legend" markdown>
<span><span class="smx-s smx-y">✓</span> Supported</span>
<span><span class="smx-s smx-p">◐</span> Partial or restricted</span>
<span><span class="smx-s smx-n">✗</span> Not supported (a source says so)</span>
<span><span class="smx-s smx-u">?</span> Unknown (no source found)</span>
</div>

Last verified: **<!-- support-matrix-verified -->**. The data behind this table is also available as [YAML](support-matrix.yml).

<!-- support-matrix -->

## How to Read This Matrix

- **Version numbers** are the first release that a source documents for the feature (Cisco "Release x.y.z introduced", Juniper Feature Explorer "introduced in", kernel merge release, project release notes). A blank version on a ✓ means the feature is documented, but we found no first-release statement. Hardware matters: a feature introduced in a release is often limited to some platforms or line cards — the footnote says which.
- **Classic and uSID.** A ✓ on an endpoint behavior means the platform implements it in at least one form: full-length SIDs (RFC 8986) or its NEXT-C-SID / uSID flavor (uN, uA, uDT46…). The footnote notes when only one form exists. See [uSID Compression](../topics/usid-compression.md).
- **◐ Partial** means the feature exists with a significant restriction that is stated in the footnote (one form only, static configuration only, ASIC-dependent, preview).
- **Control-plane rows** need the protocol to carry SRv6 information, not just to run over IPv6. A data-plane-only component (the Linux kernel, VPP) is ✗ there by design: pair it with a routing suite such as [FRRouting](frrouting.md).
- **Not listed ≠ not supported.** Vendors ship features faster than documentation catches up. If you know better, tell us — see below.

## Per-Platform Summary

### Cisco IOS-XR SRv6 support

IOS-XR has had SRv6 since **6.6.1** (full-length SIDs, IS-IS, TI-LFA, L3VPN, OAM) and uSID (F3216) since **7.3.1**; most later features are built on uSID: EVPN-VPWS 7.3.2, EVPN E-LAN 7.5.2, End.DT46 7.8.1. Cisco 8000 needs Q200-based hardware and ASR 9000 third-generation line cards or later. Gaps: no SRv6 Tree-SID (Tree-SID is SR-MPLS only), no per-CE uDX4/uDX6 with uSID, no PCE-initiated SRv6 policies. [Configuration guide →](cisco-ios-xr.md)

### Cisco IOS-XE SRv6 support

IOS-XE supports SRv6 uSID since **17.12.1a** on the ASR 1000 and Catalyst 8000 edge routers: IS-IS, BGP L3VPN with per-VRF uDT4/uDT6, local SRv6-TE with dynamic paths, PM and OAM. TI-LFA and microloop avoidance came in 17.15.1a, Flex-Algo and IPv4 MVPN ingress replication in 17.18.1a. No EVPN over SRv6 and no binding SIDs are documented. [Configuration guide →](cisco-ios-xe.md)

### Juniper SRv6 support (Junos and Junos Evolved)

Junos OS supports SRv6 on MX since **20.3R1** (classic SIDs, IS-IS, Flex-Algo, TI-LFA), with BGP services from 20.4R1. uSID (NEXT-C-SID only; REPLACE-C-SID is not supported) arrived in 23.2R1 on ACX7000 and 23.4R1 on MX; PTX10002-36QDD and PTX10008 follow in 24.x. Junos has the broadest documented service set among the vendors here, including EVPN-VPWS and E-LAN, PCEP and BGP-LS. [Configuration guide →](juniper.md)

### Arista EOS SRv6 support

EOS is uSID-only: uN since **4.34.2F**, static uA 4.35.2F, IS-IS SRv6 and Flex-Algo on 7280R4/7800R4 since 4.36.1F. Arista's public documentation covers transport behaviors; BGP L3VPN and EVPN RT5 over SRv6 have only been shown in EANTC interoperability tests, so those cells are ◐. H.Encaps.Red, USP and End.DX4/DX6 are listed as unsupported. [Platform page →](arista-eos.md)

### Nokia SR OS SRv6 support

SR OS supports SRv6 since **21.5.R2 on FP4-based hardware**, with classic and micro-segment (uSID) SIDs side by side. It covers L3VPN, EVPN-VPLS/VPWS/IFL, BGP SR Policy, TI-LFA and Tree-SID SRv6 multicast (25.3, with restrictions). It uses only the reduced headend behaviors and does not implement End.T, End.DX4/DX6, OSPFv3 SRv6 or RFC 9433. [Platform page →](nokia-sros.md)

### Huawei VRP SRv6 support

Huawei's NetEngine 8000 V800R025 configuration guide documents nearly every row: all main endpoint and headend behaviors, IS-IS and **OSPFv3** SRv6, L3VPN/EVPN/global services, SRv6 TE Policy with PCEP and BGP, TI-LFA, microloop avoidance and Flex-Algo. Its compression is **G-SRv6 (REPLACE-C-SID)**, with NEXT-C-SID available only as a 16-bit interop mode. Huawei's portal no longer publishes guides older than V800R023, so most cells have no first-release number.

### FRRouting SRv6 support

FRR has signaled SRv6 L3VPN in BGP since **8.1**, uSID since 8.5 and IS-IS SRv6 since 9.1; 10.6 added global-table services and 10.7 BGP-LS. Because it programs the Linux kernel, it inherits the kernel's gaps (no USP/USD, no End.DT2U/DT2M). SRv6 TI-LFA, Flex-Algo, OSPFv3, PCEP and EVPN over SRv6 are not in any release yet. [Configuration guide →](frrouting.md)

### Linux kernel SRv6 support

The kernel has had SRv6 encapsulation since **4.10** and endpoint behaviors since 4.14; End.DT4 (5.11), End.DT46 (5.14), H.Encaps.Red (6.0), NEXT-C-SID (6.1) and PSP (6.3) came later. It is a data plane only: control-plane rows are ✗ by design. [Behavior-by-kernel table →](linux-kernel.md)

### SONiC SRv6 support

SONiC programs SRv6 into the switch ASIC through SAI. It has carried SRv6 code since **202111**, uSID since 202211 and static CONFIG_DB SIDs (rated Alpha) since 202505. Every data-plane cell is ◐ because forwarding depends on each vendor's SAI implementation. SAI has no L2 behaviors, and SONiC's FRR container does not run an IGP for SRv6. [Platform page →](sonic.md)

### FD.io VPP SRv6 support

VPP has been an SRv6 software data plane since **17.04**, with uN in 20.05, uA in 25.02 and the srv6-mobile plugin (GTP-U interworking) in 20.01. It has no routing protocols, no End.DT46 and only the PSP flavor.

### Cilium SRv6 support

Open-source Cilium contains a hidden, beta SRv6 datapath since **1.13** (single-SID encapsulation and decapsulation to IPv4/IPv6) but no control plane to drive it. SRv6 L3VPN and uSID are features of **Isovalent Enterprise for Cilium**, which this column does not cover. [Platform page →](cilium.md)

### Other implementations

[zebra-rs](zebra-rs.md) and [Vinbero](vinbero.md) are eBPF-based open-source SRv6 stacks with their own behavior tables; they are not yet columns here. Nokia SR Linux added SRv6 in 26.3 (see the [Nokia page](nokia-sros.md#platforms)).

## Corrections and Additions

This matrix is maintained in the open. If you are a vendor, an operator or a contributor and a cell is wrong, outdated or *unknown* while you can point to a public source:

- **Open an issue:** [Report a support-matrix correction](https://github.com/eldaninavas/srv6.md/issues/new?title=Support%20matrix%3A%20&labels=support-matrix) with the platform, capability, release and a link to the document that states it.
- **Or send a pull request:** edit [`docs/implementations/support-matrix.yml`](https://github.com/eldaninavas/srv6.md/blob/main/docs/implementations/support-matrix.yml) — one line per cell, with a source. The table, footnotes and tooltips are generated from that file.

We accept public vendor documentation, release notes, feature explorers, source code and RFC implementation reports. We do not accept marketing claims without a document behind them, and we will not mark a feature supported because a roadmap says it is coming.

## Related

- :material-arrow-right: [Implementations Overview](index.md) — configuration guides per platform
- :material-arrow-right: [SRv6 Network Programming](../topics/network-programming.md) — what each behavior does
- :material-arrow-right: [IPv6 Ready SRv6 Logo](index.md#conformance-testing-ipv6-ready-srv6-logo) — independent conformance testing
- :material-arrow-right: [RFCs & Standards](../rfcs/index.md) — the specifications behind each row
