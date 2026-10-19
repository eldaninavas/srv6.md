---
title: Real-World Deployments
seo_title: "SRv6 Deployments: Who Runs SRv6 in Production"
description: "Directory of public SRv6 production deployments: telecom operators, hyperscalers, AI clusters and public sector, each linked to the original announcement."
tags:
  - use-cases
  - deployments
  - production
---

# :material-earth: Real-World SRv6 Deployments

SRv6 is in production at some of the world's largest networks. The following is a curated directory of **publicly announced** deployments, linking directly to the original announcements by the operators and vendors themselves.

!!! info "Sources policy"
    Every entry links to the original public announcement (press release, blog post, or conference talk) by the operator or vendor. We do not reproduce proprietary details — click through to the source for full information.

## Telecom Operators

### Asia Pacific

| Operator | Announcement | Source |
|----------|-------------|:------:|
| **China Mobile** (China) | Claims the world's largest SRv6 backbone, built on G-SRv6 with cluster routers (600+ Tbps inter-provincial); G-SRv6 also used by MTN in South Africa — joint project with Huawei and MTN (WIC 2024) | [:material-open-in-new:](https://regional.chinadaily.com.cn/wic/2024-12/04/c_1050626.htm) |
| **China Mobile Henan** (China) | G-SRv6 single-stack (IPv6-only core carrying IPv4 inside IPv6) on the Kaifeng metro network: ~1.06M fiber broadband users and 6,798 enterprise lines; first prize, ICT China 2026 cases (Sept 2026, with Huawei) | [:material-open-in-new:](https://tech.ifeng.com/c/8wg2olVxOZK) |
| **Rakuten Mobile** (Japan) | SRv6 uSID IP transport network migration completed | [:material-open-in-new:](https://corp.mobile.rakuten.co.jp/english/news/press/2024/0729_01/) |
| **Reliance Jio** (India) | Converged IP network adopting end-to-end SRv6 | [:material-open-in-new:](https://www.cisco.com/site/us/en/about/case-studies-customer-stories/reliance-jio.html) |
| **SoftBank** (Japan) | SRv6 commercial network completed; world's first SRv6 Flex-Algo on 5G | [:material-open-in-new:](https://www.softbank.jp/en/corp/news/press/sbkk/2022/20220426_01/) |
| **SoftBank** (Japan) | World's first SRv6 MUP on commercial 5G network | [:material-open-in-new:](https://www.softbank.jp/en/corp/news/press/sbkk/2025/20251218_01/) |

### Europe

| Operator | Announcement | Source |
|----------|-------------|:------:|
| **Iliad** (Italy) | Greenfield SRv6 5G-ready network launched | [:material-open-in-new:](https://newsroom.cisco.com/c/r/newsroom/en/us/a/y2019/m04/iliad-launches-5g-ready-ip-network-architecture-with-segment-routing-ipv6-in-italy.html) |
| **Swisscom** (Switzerland) | SRv6 uSID migration with in-situ performance measurement | [:material-open-in-new:](https://www.segment-routing.net/news/2024-10-09-swisscom-srv6-usid-ipm/) |

### Americas

| Operator | Announcement | Source |
|----------|-------------|:------:|
| **Bell Canada** | SRv6 uSID deployment with P4 programmable edge | [:material-open-in-new:](https://www.segment-routing.net/images/2023-03-30-srv6-workshop-bell-canada.pdf) |
| **Boost Mobile** (United States) | Cloud-native SRv6 backbone in AWS — migrated from SR-MPLS/GRE to single SRv6 domain | [:material-open-in-new:](cloud-native-backbone.md) |
| **Verizon** (United States) | "Simplifying the Network, the Journey to Unified Traffic Engineering with SRv6" — target of SRv6 in all domains with a single encapsulation and single TE policy, extending to host-based encapsulation (Upperside WC Paris 2026) | [:material-open-in-new:](https://www.segment-routing.net/conferences/Paris26-Verizon-Luay-Jalil/) |
| **Telefonica VIVO** (Brazil) | Multi-vendor SRv6 uSID deployment | [:material-open-in-new:](https://blog.lacnic.net/en/unveiling-the-future-of-the-network-implementation-of-srv6-usid-in-telefonica-vivos-infrastructure/) |
| **Telecom District** (Mexico) | The future of routing built on SRv6 | [:material-open-in-new:](https://en.telecomdistrict.com/blog/el-futuro-del-enrutamiento-construido-sobre-srv6) |
| **Telecom District** (Mexico) | Driven by SRv6: Inside Telecom District's Network — segment-routing.net feature | [:material-open-in-new:](https://www.segment-routing.net/conferences/2026-09-28-srv6-at-telecom-district-mexico/) |
| **CTX Reflector** | Cloud-native SRv6 enablement on AWS | [:material-open-in-new:](https://tryctx.com/reflector/) |

## Public Sector

| Organization | Announcement | Source |
|--------------|-------------|:------:|
| **Rijkswaterstaat** (Netherlands) | National infrastructure agency backbone migrated from MPLS to SRv6 uSID end-to-end | [:material-open-in-new:](https://www.segment-routing.net/conferences/20250213-cleur-rws-srv6-deployment/) |

## Cloud & Technology Companies

| Company | Announcement | Source |
|---------|-------------|:------:|
| **Meta** | SRv6-powered backbone networks — SRv6 TE in production on regional backbone rings (OCP Global Summit 2026) | [:material-open-in-new:](https://www.segment-routing.net/conferences/2026-10-15-ocp-summit26-meta-srv6-backbone/) |
| **Google** | Virgo AI fabric — SRv6 source routing for bare-metal customers (OCP Global Summit 2026) | [:material-open-in-new:](https://www.segment-routing.net/conferences/2026-10-15-ocp-summit26-google-virgo/) |
| **Microsoft** | SRv6 powers Fairwater, the largest AI datacenter in the world (OCP Global Summit 2025) | [:material-open-in-new:](https://www.segment-routing.net/news/2025-10-13-Microsoft-SRv6-powers-the-largest-AI-DC-in-the-world/) |
| **OpenAI** | MRC: static SRv6 source routing on 100K+ GPU AI supercomputers (with Microsoft, AMD, Broadcom, NVIDIA) | [:material-open-in-new:](https://openai.com/index/mrc-supercomputer-networking/) |
| **Nebius** | AI cloud: SRv6 uSID L3VPN from DC frontend to WAN/peering, replacing VXLAN-EVPN/MPLS-SR stitching; SRv6 TE for firewall chaining; Cisco–Juniper uSID interop and VPP data plane (Upperside WC Paris 2026) | [:material-open-in-new:](https://www.segment-routing.net/conferences/Paris26-Nebius-Alexey-Gorovoy/) |
| **Nebius** | Building scalable AI cloud interconnects with SRv6 — end-to-end VPN and TE between virtual cloud and physical edge for GPU-cloud customers (@Scale: Networking 2026) | [:material-open-in-new:](https://www.segment-routing.net/conferences/2026-08-25-atscale-nebius-srv6-interconnects/) |
| **Alibaba Cloud** | Full-stack SRv6 on SONiC whitebox routers | [:material-open-in-new:](https://sonicfoundation.dev/driving-innovation-alibaba-and-cisco-co-dev-srv6-sonic-router/) |
| **LINE Corporation** (Japan) | SRv6 overlay for data center networking | [:material-open-in-new:](https://www.segment-routing.net/conferences/2019-09-20-SRv6-LINE-DC/) |

## Industry Overview

For a broader view of SRv6 deployment status across the industry:

| Resource | Description | Source |
|----------|-------------|:------:|
| IETF SRv6 Deployment Status | Community-maintained IETF draft tracking global deployments | [:material-open-in-new:](https://datatracker.ietf.org/doc/html/draft-matsushima-spring-srv6-deployment-status) |
| APNIC: SRv6 Deployed Use-Cases | Overview of early commercial SRv6 deployments (2020) | [:material-open-in-new:](https://blog.apnic.net/2020/05/08/srv6-deployed-use-cases/) |
| segment-routing.net | Community site with conference talks and deployment news | [:material-open-in-new:](https://www.segment-routing.net) |

## Further Reading

- :material-arrow-right: [5G Transport](5g-transport.md) - SRv6 for mobile networks
- :material-arrow-right: [AI/ML Training](ai-networking.md) - SRv6 for GPU fabrics
- :material-arrow-right: [Satellite Connectivity](satellite-connectivity.md) - SRv6 over LEO satellite
