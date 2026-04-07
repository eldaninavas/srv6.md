---
title: Real-World Deployments
description: Major SRv6 production deployments around the world
tags:
  - use-cases
  - deployments
  - production
---

# :material-earth: Real-World SRv6 Deployments

SRv6 is in production at some of the world's largest networks. Here's a comprehensive overview of who's running it, at what scale, and why.

## Global Deployment Map

| Operator | Country | Scale | Year | Key Achievement |
|----------|---------|-------|:----:|-----------------|
| **China Mobile** | China | 1.08B mobile users | 2020+ | World's largest SRv6 deployment (G-SRv6) |
| **SoftBank** | Japan | Nationwide 5G | 2022 | World's first SRv6 Flex-Algo and MUP |
| **Rakuten Mobile** | Japan | 7M+ subscribers | 2024 | Largest SRv6 uSID transport migration |
| **Iliad** | Italy/France | 8.5M subscribers | 2019 | Zero-MPLS greenfield 5G network |
| **Bell Canada** | Canada | National backbone | 2023 | SRv6 uSID + P4 programmable edge |
| **Swisscom** | Switzerland | National network | 2024 | 5 MPLS networks → 1 SRv6 network |
| **Telefonica VIVO** | Brazil | National aggregation | 2024 | Multi-vendor uSID (Cisco+Huawei+Nokia) |
| **Reliance Jio** | India | National 5G | 2024 | End-to-end SRv6 with AI-driven automation |
| **LINE Corp** | Japan | DC infrastructure | 2019 | SRv6 overlay for private cloud |
| **Microsoft** | Global | AI backend fabrics | 2025 | SRv6 uSID via SONiC for GPU clusters |
| **Alibaba** | China | Cloud DCI | 2023 | Full-stack SRv6 on SONiC whitebox |
| **Goldman Sachs** | Global | Trading infra | 2025 | Low-latency multicast with SRv6 |
| **MTN Uganda** | Uganda | National core | 2023 | 5G-ready SRv6, 20→286 Mbps |

---

## Telecom Operators

### :flag_jp: Rakuten Mobile (Japan)

The world's first fully virtualized cloud-native mobile network chose SRv6 as its transport foundation.

- **Scale:** 7M+ subscribers, entire IP transport on SRv6 uSID
- **Vendor:** Cisco NCS/ASR platforms
- **Features:** uSID, network slicing, on-demand bandwidth
- **Service:** "KOSOKU Access" — ultra-high-speed enterprise service with guaranteed SLAs
- **Milestone:** Completed largest SRv6 uSID IP transport network migration (July 2024)

### :flag_jp: SoftBank (Japan)

A true SRv6 pioneer — first to deploy multiple world-first SRv6 technologies on a commercial 5G network.

- **Scale:** Nationwide 5G, 90%+ population coverage
- **Vendor:** Cisco, Broadcom (Jericho2), Arrcus ArcOS
- **World firsts:**
    - SRv6 Flex-Algorithm on commercial 5G (2022)
    - SRv6 MUP (RFC 9433) on commercial 5G (Dec 2025)
    - SRv6 MUP expanded to 4G (June 2025)
- **Key innovation:** MUP replaces GTP-U tunnels with SRv6 segments, simplifying the entire 5G user plane

### :flag_cn: China Mobile / China Telecom / China Unicom

The three Chinese carriers operate the world's largest SRv6 deployments under the national "IPv6+" initiative.

- **China Mobile:** G-SRv6-powered networks carry traffic for ~1.08B mobile users, 300M broadband users, and 30M enterprise users (~20% of global internet users). Deployed the world's first 512 Tbps cluster router with full G-SRv6 support.
- **China Unicom:** SRv6 Cloud backbone across the Pearl River Delta (7 cities). IPv6+ deployed nationwide.
- **China Telecom:** SRv6 in Jiangsu province for cloud migration.
- **Vendor:** Primarily Huawei (G-SRv6), ZTE (T-SRv6)
- **Standards:** 171 RFCs published, 402 new IETF drafts contributed

### :flag_it: Iliad (Italy)

A greenfield mobile operator that chose SRv6 from day one — zero MPLS in the entire network.

- **Scale:** 1,350 Cisco NCS 5500 routers + 9,200 Iliad Nodeboxes, 8.5M subscribers
- **Traffic:** 700 Gbps commercial peak
- **Vendor:** Cisco ASR 9000 (core), NCS 5500 (aggregation), plus Iliad's own "Nodebox" hardware
- **Key decision:** Built a completely MPLS-free network, proving SRv6 works at scale for a full operator

### :flag_ca: Bell Canada

Canada's largest telecom migrated from SR-MPLS to SRv6 uSID with dramatic cost reductions.

- **Scale:** National backbone/core
- **Vendor:** Cisco NCS 5700, NoviFlow P4 switches at the edge
- **Achievement:** Validated 26 SRv6 uSIDs at line rate on NCS 5700
- **Results:** Up to 90% carrier service cost reduction, 75% footprint reduction, 66% power reduction with P4 programmable edge

### :flag_ch: Swisscom (Switzerland)

Consolidated five separate MPLS networks into a single end-to-end SRv6 network.

- **Architecture:** "TITAN" — unified SRv6 fabric replacing 5 legacy MPLS networks
- **Vendor:** Cisco
- **Results:** 40% OPEX reduction, 50% power consumption reduction
- **Features:** SRv6 uSID + IPM (In-situ Performance Measurement)

### :flag_br: Telefonica VIVO (Brazil)

The first major multi-vendor SRv6 uSID deployment in Latin America.

- **Vendor:** Cisco + Huawei + Nokia (multi-vendor interop)
- **Decision:** Skipped SR-MPLS entirely, went directly to SRv6 uSID
- **Services:** EVPN, L3VPN, L2VPN, traffic engineering
- **Rationale:** Avoid double migration costs and technical obsolescence

### :flag_in: Reliance Jio (India)

- **Scale:** India's largest network operator
- **Vendor:** Cisco 8000 Series (Silicon One)
- **Features:** End-to-end SRv6 with AI-driven automation

### :flag_ug: MTN Uganda (Africa)

- **Scale:** National MPBN core network
- **Vendor:** Huawei (G-SRv6)
- **Results:** Network speeds improved from 20 Mbps to 286 Mbps
- **Use case:** 5G readiness + network slicing

---

## Cloud & AI Providers

### Microsoft Azure
SRv6 uSID via SONiC for AI backend data center fabrics. Solving ECMP hash collision problems for GPU training clusters. See [AI/ML Training Networks](ai-networking.md).

### Alibaba Cloud
Full-stack SRv6 uSID deployment on SONiC whitebox routers. "eCore" DCI network for service-aware traffic forwarding. SAI + SONiC + FRR stack in production since 2023.

### LINE Corporation (Japan)
SRv6 overlay for multi-tenant private cloud data centers. In-house solution using Linux hypervisors + OpenStack Neutron with custom SRv6 extensions.

### Goldman Sachs
SRv6 for low-latency multicast in financial trading infrastructure.

---

## Vendor Ecosystem

| Vendor | SRv6 Variant | Key Platforms |
|--------|:-------------|---------------|
| **Cisco** | uSID | NCS 5500/5700, ASR 9000, Cisco 8000 (Silicon One) |
| **Huawei** | G-SRv6 | NetEngine series |
| **Nokia** | uSID (RFC 9800) | SR OS routers |
| **ZTE** | T-SRv6 | SPN platforms |
| **Arista** | uSID | 7000 series |
| **Juniper** | uSID | MX/PTX series |
| **SONiC** | uSID | Any whitebox (Broadcom, Silicon One) |

!!! info "40+ vendors"
    As of 2025, over 40 device and test equipment vendors support SRv6 compression (RFC 9800) commercially.

## Further Reading

- :material-arrow-right: [5G Transport](5g-transport.md) - SRv6 for mobile networks
- :material-arrow-right: [AI/ML Training](ai-networking.md) - SRv6 for GPU fabrics
- :material-arrow-right: [Satellite Connectivity](satellite-connectivity.md) - SRv6 over Starlink
- :material-web: [segment-routing.net](https://www.segment-routing.net) - Community news and conference talks

## References

1. [Rakuten Mobile and Cisco Revolutionize Business Landscape with SRv6 uSID Deployment](https://corp.mobile.rakuten.co.jp/english/news/press/2024/0729_01/) - Rakuten Mobile press release on completing one of the world's largest SRv6 uSID IP transport migrations
2. [SoftBank: World's First SRv6 MUP Services on 5G Commercial Network](https://www.softbank.jp/en/corp/news/press/sbkk/2025/20251218_01/) - SoftBank press release on the first commercial SRv6 MUP deployment
3. [SRv6: Deployed Use-Cases - APNIC Blog](https://blog.apnic.net/2020/05/08/srv6-deployed-use-cases/) - Overview of early SRv6 production deployments across eight large-scale commercial networks
4. [Implementation of SRv6 uSID in Telefonica VIVO's Infrastructure - LACNIC Blog](https://blog.lacnic.net/en/unveiling-the-future-of-the-network-implementation-of-srv6-usid-in-telefonica-vivos-infrastructure/) - Detailed account of VIVO's multi-vendor SRv6 uSID deployment in Brazil
5. [Swisscom: Introducing SRv6 to an Existing Network - segment-routing.net](https://www.segment-routing.net/conferences/2023-02-10-SRv6-deployment-swisscom/) - Swisscom presentation on migrating five MPLS networks to a single SRv6 uSID fabric
6. [Iliad Launches 5G Ready IP Network Architecture with SRv6 in Italy - Cisco Newsroom](https://newsroom.cisco.com/c/r/newsroom/en/us/a/y2019/m04/iliad-launches-5g-ready-ip-network-architecture-with-segment-routing-ipv6-in-italy.html) - Cisco announcement of Iliad's greenfield zero-MPLS SRv6 network in Italy
7. [Bell Canada SRv6-uSID Deployment - segment-routing.net (PDF)](https://www.segment-routing.net/images/2023-03-30-srv6-workshop-bell-canada.pdf) - Daniel Voyer's presentation on Bell Canada's SRv6 uSID production deployment with P4 programmable edge
