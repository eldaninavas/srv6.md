---
title: SRv6 White Papers
seo_title: "SRv6 White Papers: Every Public SRv6 White Paper and PDF (2026)"
description: "Library of public SRv6 white papers and technical PDFs: Cisco, Nokia, Juniper, H3C, ZTE, IETF srv6ops, ETSI, OpenAI MRC and academic papers, each with a summary."
tags:
  - white paper
  - references
  - SRv6 white paper
  - SRv6 PDF
---

# SRv6 White Papers

**Every public white paper and in-depth technical paper on Segment Routing over IPv6 (SRv6), in one place.** Each entry links to the original publisher and has a short summary written by the SRv6.md community, so you can pick the right paper before downloading 250 pages. Last checked: 22 October 2026.

!!! tip "Start here: the SRv6.md white paper"
    **[SRv6 White Paper 2026: Architecture, Design and Deployment](srv6-white-paper-2026.md)** is a vendor-neutral paper for architects: why operators adopt SRv6, uSID addressing, control plane choices, MTU, security, migration from MPLS and AI fabrics. Free, MIT licensed, [available as PDF](../assets/papers/srv6-white-paper-2026.pdf).

## Vendor white papers

| Paper | Publisher | Year | Format | What it covers |
|-------|-----------|:----:|:------:|----------------|
| [Building Quantum-Resilient Mission-Critical Networks with SRv6](https://www.cisco.com/c/en/us/td/docs/solutions/CVD/Campus/Building_Quantum-Resilient_Mission-Critical_Networks_with_SRv6.html) | Cisco (Validated Design) | 2026 | HTML | An SRv6 uSID (F3216) core on Cisco 8000 Secure Routers with IOS-XE, replacing MPLS/RSVP-TE, with TE, Flex-Algo slicing, TI-LFA, multicast VPN and post-quantum MACsec, IPsec and SSH. Includes complete site configurations. Our summary: [Mission-Critical Networks](../use-cases/mission-critical.md). |
| [XR Multicast VPN with SRv6 — Dual Stack White Paper](https://www.cisco.com/c/en/us/solutions/collateral/service-provider/xr-multicast-vpn-srv6-dual-stack-wp.html) | Cisco | 2024 | HTML, PDF | How to keep unicast VPNs on an SRv6 core while multicast VPN runs over a separate IPv4 PIM core on IOS XR, with the BGP session split, configuration and limitations. |
| [Segment Routing IPv6 (SRv6) on Nokia routing platforms](https://www.nokia.com/asset/213966/) | Nokia (application note) | 2024 | PDF | The SRv6 data plane, SID structure and uSID, and the SR OS feature set (VPN services, TE, protection, OAM, SR-MPLS interworking), applied to mobile backhaul and multi-domain IPv6 backbones. |
| [Day One: Introduction to SRv6](https://www.juniper.net/documentation/en_US/day-one-books/DayOne-Intro-SRv6.pdf) | Juniper Networks Books | 2022 | PDF, 253 pp | A hands-on Junos book: migration preparation, SRv6 transport and services, TI-LFA, SRv6–MPLS interworking, Flex-Algo, micro-loop avoidance, SRv6-TE, EVPN-VPWS, multi-domain and cRPD. |
| [SRv6 Technology White Paper](https://www.h3c.com/en/Support/Resource_Center/EN/Home/Public/00-Public/Technical_Documents/Technology_Literature/Technology_White_Papers/SRv6_Technology_WP-18617/?CHID=1103560) | New H3C Technologies | 2024 | HTML, PDF | Protocol reference for the SRH, SID structure and flavors, IS-IS SRv6 TLVs, G-SRv6 (32-bit G-SID) compression, BGP-EPE and BGP-LS for SRv6. |
| [Research and Deployment of SRv6 Header Compression Technology](https://www.zte.com.cn/global/about/magazine/zte-technologies/2022/2-en/special-topic/2.html) | ZTE | 2022 | HTML | Why full 128-bit SIDs cost bandwidth and chip resources, how G-SRv6 compresses them, how it compares with uSID, and China Mobile trials in Henan and Fujian. |
| [Segment Routing over IPv6 (SRv6)](https://xflowresearch.com/wp-content/uploads/2023/05/SRV6_Paper_WD.pdf) | xFlow Research | 2023 | PDF, 28 pp | A tutorial paper on SR architecture, the SRH and its TLVs, SID format and behaviors, with the Bell Canada uSID deployment and open-source data planes (Linux, VPP). |

## Operator and industry papers

| Paper | Publisher | Year | Format | What it covers |
|-------|-----------|:----:|:------:|----------------|
| [Compressed SRv6 Deployment and Operations White Paper](https://ietf-wg-srv6ops.github.io/assets/Copy%20of%20Compressed%20SRv6%20Deployment%20and%20Operations%20White%20Paper.pdf) | China Mobile, Bell Canada, Swisscom, Deutsche Telekom, Alibaba, MTN, Telefonica (IETF srv6ops) | 2025 | PDF, 33 pp | Written by operators: both compression flavors of [RFC 9800](../rfcs/rfc9800.md) (uSID and G-SRv6), interop history, SID planning, inter-AS design, visibility, and case studies from China Mobile and an African operator. The most practical operations paper available. |
| [EANTC Transport & Cloud Networks Interop Test Report 2026](https://eantc.de/wp-content/uploads/2026/03/EANTC-Interop2026-TestReport.pdf) | EANTC | 2026 | PDF, 16 pp | Independent multi-vendor interop results: SRv6 L3VPN, EVPN and IRB, BGP PIC with summarized locators, S-BFD, Flex-Algo, uSID SR Policies via PCEP and SRv6–SR-MPLS interworking. |
| [Static Configuration of SRv6 in SONiC (HLD)](https://github.com/sonic-net/SONiC/blob/master/doc/srv6/srv6_static_config_hld.md) | SONiC project | 2024 | HTML | Design for configuring SRv6 locators and uSID SIDs statically in SONiC without BGP, for controller-driven fabrics. See [SONiC & SAI](../topics/sonic-sai.md). |
| [SRv6: A new approach for the evolution of IP networks](https://www.segment-routing.net/images/2019-IHSM-SRv6-08-06-19.pdf) | IHS Markit | 2019 | PDF, 4 pp | A short analyst brief on SRv6 for 5G transport: fewer protocols, network programming and SDN path computation. Useful for the business case. |

## Standards bodies

| Paper | Publisher | Year | Format | What it covers |
|-------|-----------|:----:|:------:|----------------|
| [Compressed SRv6 Deployment and Operations White Paper (slides)](https://datatracker.ietf.org/meeting/123/materials/slides-123-srv6ops-31-compressed-srv6-deployment-and-operations-white-paper-05) | IETF srv6ops WG | 2025 | PDF, 12 pp | The IETF 123 summary of the operators' white paper above. |
| [GR IPE 005: 5G Transport over IPv6 and SRv6](https://www.etsi.org/deliver/etsi_gr/IPE/001_099/005/01.01.01_60/gr_IPE005v010101p.pdf) | ETSI ISG IPE | 2022 | PDF, 42 pp | 5G service requirements, network prerequisites and an SRv6 transport design for mobile backhaul. See [5G Transport](../use-cases/5g-transport.md). |
| [GR IPE 009: SRv6 based SFC for Value-Added Service in an Operator Network](https://www.etsi.org/deliver/etsi_gr/IPE/001_099/009/01.01.01_60/gr_IPE009v010101p.pdf) | ETSI ISG IPE | 2022 | PDF, 30 pp | On-demand service function chains with SRv6 and SRv6-aware firewalls. See [Service Chaining](../use-cases/service-chaining.md). |

The RFCs themselves are summarized in the [RFCs & Standards](../rfcs/index.md) section, starting with [RFC 8754](../rfcs/rfc8754.md) (SRH), [RFC 8986](../rfcs/rfc8986.md) (network programming) and [RFC 9800](../rfcs/rfc9800.md) (compression).

## AI networking

| Paper | Publisher | Year | Format | What it covers |
|-------|-----------|:----:|:------:|----------------|
| [Resilient AI Supercomputer Networking using MRC and SRv6](https://cdn.openai.com/pdf/resilient-ai-supercomputer-networking-using-mrc-and-srv6.pdf) | OpenAI, Microsoft, AMD, NVIDIA, Broadcom | 2026 | PDF, 18 pp | Production GPU training clusters built from the MRC multipath transport, multi-plane two-tier Clos fabrics and static SRv6 uSID source routing, with failed paths bypassed in tens of microseconds. Also on [arXiv](https://arxiv.org/abs/2605.04333). Our explainer: [MRC and SRv6](../ai/mrc.md). |
| [The Multipath Reliable Connection (MRC) Transport](https://arxiv.org/abs/2606.18170) | OpenAI, Microsoft, NVIDIA, AMD, Broadcom et al. | 2026 | HTML, PDF | The companion paper on MRC itself: per-packet multipath over RoCEv2, congestion control and loss recovery. Mostly about the transport; SRv6 appears as the path encoding. |

## Academic papers and surveys

| Paper | Authors | Year | Format | What it covers |
|-------|---------|:----:|:------:|----------------|
| [Segment Routing: a Comprehensive Survey of Research Activities, Standardization Efforts and Implementation Results](https://arxiv.org/abs/1904.03471) | Ventre, Salsano, Polverini, Cianfrani, Abdelsalam, Filsfils, Camarillo, Clad | 2019 | HTML, PDF | The reference survey of SR and SRv6: standards, research, open-source and hardware implementations. |
| [Micro SIDs: a solution for Efficient Representation of Segment IDs in SRv6 Networks](https://arxiv.org/abs/2007.12286) | Tulumello, Mayer, Bonola, Lungaroni, Scarpitta, Salsano, Abdelsalam, Camarillo, Dukes, Clad, Filsfils | 2020 | HTML, PDF | The paper that introduced uSID, with Linux, VPP and P4 implementations and their processing cost. See [uSID Compression](../topics/usid-compression.md). |
| [Implementing IPv6 Segment Routing in the Linux Kernel](https://www.irtf.org/anrw/2017/anrw17-final3.pdf) | Lebrun, Bonaventure (ANRW 2017) | 2017 | PDF | The first open-source SRv6 implementation, merged in Linux 4.10, with measurements of encapsulation and HMAC cost. See [Linux Kernel](../implementations/linux-kernel.md). |
| [SRPerf: a Performance Evaluation Framework for IPv6 Segment Routing](https://arxiv.org/abs/2001.06182) | Abdelsalam, Ventre, Scarpitta, Mayer, Salsano, Camarillo, Clad, Filsfils | 2020 | HTML, PDF | An open benchmarking framework for SRv6 throughput and latency on Linux and VPP, which also found behaviors that were missing or wrong. |
| [SDN Architecture and Southbound APIs for IPv6 Segment Routing Enabled Wide Area Networks](https://arxiv.org/abs/1810.06008) | Ventre, Tajiki, Salsano, Filsfils | 2018 | HTML, PDF | An SDN-controlled SRv6 WAN on Linux nodes with four southbound API options and an evaluation of control-plane performance. |
| [SRv6: Is There Anybody Out There?](https://arxiv.org/abs/2205.04193) | Pădurean, Gasser, Bush, Feldmann (WTMC 2022) | 2022 | HTML, PDF | The first measurement study of SRv6 on the public Internet. It found almost no leaked SRv6 traffic, a useful data point for the [security](../topics/security.md) discussion. |

## Missing a paper?

This list only includes papers that are public and free to read. If you know one that is missing, or a link stops working, open an issue or pull request on [GitHub](https://github.com/eldaninavas/srv6.md).

## Further Reading

- :material-arrow-right: [SRv6 White Paper 2026](srv6-white-paper-2026.md) - The SRv6.md white paper, free PDF
- :material-arrow-right: [SRv6 documentation index](../docs/index.md) - Official SRv6 docs for every vendor and open-source project
- :material-arrow-right: [State of SRv6 2026](../reports/state-of-srv6-2026.md) - Data report on standards, deployments and vendors
- :material-arrow-right: [RFCs & Standards](../rfcs/index.md) - Every SRv6 RFC explained
