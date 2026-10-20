---
title: SRv6 for Multi-Datacenter AI
seo_title: "SRv6 for Scale-Across AI: Multi-Datacenter Training and DCI"
description: "How SRv6 traffic engineering carries AI traffic between data centers: Meta's SRv6 regional backbone, Alibaba's eCore for AI with per-job TE, China Telecom's cross-cluster training, and what is not SRv6."
tags:
  - ai
  - dci
  - wan
  - traffic-engineering
  - scale-across
---

# SRv6 for Multi-Datacenter AI (Scale-Across)

AI training has outgrown the single building. Power and space limits push the largest jobs across several data centers, campuses or regions, and that brings the WAN into the training loop. This third dimension of AI networking, after scale-up inside a rack and scale-out inside a cluster, is usually called **scale-across**. This page covers where SRv6 is used to carry AI traffic between sites, what each deployment does, and which well-known scale-across products are *not* SRv6.

!!! abstract "Summary (October 2026)"
    - **Meta** runs SRv6 uSID traffic engineering on its **regional backbone**, which interconnects data center campuses and AI clusters. The first site with SRv6 TE went into production in October 2026, on FBOSS and Cisco Silicon One with 800G ZR+ spans of up to 650 km.
    - **Alibaba Cloud** runs a dedicated **"eCore for AI (Scale Across)"** built from SONiC + SRv6 routers, with **per-training-job SRv6 traffic engineering**, described as in production.
    - **China Telecom** has published an architecture, with live-network trials, that uses **L3EVPN over SRv6 Policy** plus tenant slices for cross-cluster training at 100–500 km.
    - The IETF AI-backend draft notes that the same NIC-driven SRv6 model *can* extend across data centers. That is a capability statement, not a reported deployment.
    - Several prominent scale-across efforts publish **no SRv6 role**: Cisco 8223/Silicon One P200, NVIDIA Spectrum-XGS and Microsoft's AI WAN.

## Why scale-across needs traffic engineering

Inside a cluster, the fabric is symmetric and over-provisioned, so spraying traffic evenly works. Between sites, the conditions change:

| Inside a cluster (scale-out) | Between sites (scale-across) |
|------------------------------|------------------------------|
| Symmetric Clos, full bisection | Asymmetric topology, a few fiber routes |
| Capacity is plentiful | Capacity is scarce and expensive |
| Microsecond RTTs | Milliseconds of RTT, which collectives feel |
| One traffic class dominates | AI traffic shares links with storage, replication and user traffic |

Alibaba and Cisco summarize the consequence at OCP 2026 in two words: **traffic engineering is a must** for AI DCI. AI traffic needs to be kept on the paths with the right latency and capacity, kept away from queues it would congest, and moved off degrading optical paths before they fail. SRv6 fits because data center networks are IP-only (there is no MPLS in SONiC, nor on most DC switching silicon), and SRv6 provides explicit paths, SLA classes and VPNs on plain IPv6, end to end from one data center to another.

## Meta: SRv6 on the regional backbone

Meta is building **regional backbone (RBB)** rings that let data center campuses in a region share compute and storage within a latency envelope. They sit below the global Express Backbone and carry AI and non-AI traffic between sites.

- **Topology**: rings with 1, 5 or 10 ms RTT and 64 parallel planes, full mesh between sites within a plane. Each RBB domain is routed and traffic-engineered as one.
- **Hardware**: shallow-buffer, data-center-class platforms on 800G ZR+ spans of up to 650 km, running FBOSS over OCP SAI on Cisco Silicon One. ECN-based congestion control (Meta's GLIDE), not deep buffers, keeps queues short.
- **SRv6 data plane**: uSID with the block `fcbb:bb00` and up to six uSIDs in the outer destination address. The head-end uses **H.Encaps.Red**, transit hops **uA** (adjacency) uSIDs, and the egress **End.DT46**. When a path needs more than six uSIDs, an **End.B6.Encaps.Red** binding SID stitches two lists.
- **Control plane**: one controller per plane programs every switch every 30 seconds through a TE agent. The SID table is installed once at bootstrap, with one entry per adjacency rather than one per path. Fast reroute sits below the controller.
- **Timeline**: first IP-only RBB site in July 2026, first long-haul site in August 2026, **first site with SRv6 TE in October 2026**, with expansion planned.

!!! quote "Why SRv6 instead of MPLS"
    Meta already runs MPLS SR-TE at scale and still chose SRv6 for the RBB. The deciding factor was **QoS**: it needs six strict-priority classes, and its MPLS encoding (3-bit Traffic Class) supports four, while the 8-bit IPv6 Traffic Class carries all six.

Meta's separate **backend aggregation (BAG)** layer, which stitches training fabrics into one cluster across buildings and regions, uses eBGP, not SRv6.

## Alibaba Cloud: eCore for AI, with per-job TE

Alibaba's backbone, **eCore**, is the largest published SRv6 DCI/WAN. Cisco describes it as an SRv6 deployment across about 1,000 cities in China, running since 2023. At OCP 2025, Alibaba described eCore as **SRv6-only** (no MPLS), built from single-chip "pizza box" routers running its SONiC-based NOS, spanning 29 regions and 91 availability zones.

At the OCP Global Summit 2026, Alibaba presented a dedicated **eCore for AI (Scale Across)**: a separate, single-tenant network with no overlay, built from SONiC + SRv6 routers with 64 × 800G ports and 400G/800G links, and engineered **per training job**:

1. The job scheduler hands the job's identity and endpoints to the TE system.
2. A controller computes an SR Policy for the job and advertises a **Binding SID (BSID)** for it via BGP.
3. Traffic is steered onto the BSID. The primary path is a `<uA, uN>` list protected by echo BFD, and an anycast SID provides the backup path.
4. Optical degradation signals withdraw a path from use *before* it fails.

Alibaba compared three places to steer AI traffic onto SRv6: classify at the aggregation router (no SRv6 on the host), have the host encode the full SID list, or have the host choose a BSID that the router expands. At IETF 125 (March 2026), Alibaba described host agents that set the **IPv6 Flow Label** per application, which the SRv6 head-end maps to a SID list such as a dedicated "RDMA path". The goal is to keep cross-region RDMA from competing with other traffic for backbone queues. Alibaba also stated that its AI computing is now fully based on IPv6/SRv6.

## China Telecom: cross-cluster training over SRv6 Policy

China Telecom Research Institute's 2025 computing-power metro white paper, co-written with Huawei, specifies **L3EVPN over SRv6 Policy** between compute gateways to carry **cross-cluster collaborative training**. It adds **tenant-level slicing** for remote storage-compute training, and SRv6 Policy with a low-latency slice for inference. It reports live-network trials in Shanghai, Zhejiang and Guangdong with less than 3% degradation in compute efficiency and in inference latency metrics (vendor-reported figures). It targets 400G/800G links for training across 100–500 km with less than 5% efficiency loss.

## Other signals from China

- **China Mobile** says it has built the world's largest **G-SRv6** network and is developing new layer-3 protocols based on G-SRv6 evolution for cross-data-center AI, where it warns that 2% packet loss drops RDMA throughput to zero. It has not tied a specific training run to G-SRv6.
- **China Unicom** uses SRv6 network programming on its IP backbone. It has proposed an **SRv6-based task scheduling** scheme, piloted on a Shanghai–Ningxia "East Data, West Computing" transfer, and says SRv6 is applied on its 400G AI-compute network.
- China's long-distance training records (500 km, 1,500 km, 2,000 km runs by China Telecom, China Unicom and national testbeds) were published **without** naming SRv6 as the transport. Treat them as proof that scale-across training works, not as SRv6 deployments.

## What is not SRv6 (as published)

| Effort | What it is | SRv6? |
|--------|-----------|-------|
| Cisco 8223 / Silicon One P200 (Oct 2025) | 51.2 Tb/s deep-buffer router for scale-across | Not mentioned at launch. P200 is used for SRv6 by customers: Alibaba's per-job TE runs on P200-based systems. |
| NVIDIA Spectrum-XGS (Aug 2025) | Distance-aware congestion control and telemetry for Spectrum-X | No routing or SRv6 component |
| Microsoft AI WAN (Fairwater) | Dedicated fiber between Fairwater sites | No public SRv6 claim; Microsoft's published SRv6 use is inside the cluster ([MRC](mrc.md)) |
| Meta BAG | Super-spine joining training fabrics across sites | eBGP |
| Google multi-DC training | Virgo / Jupiter across sites | Google's only published SRv6 use is bare-metal source routing inside Virgo |

## Design patterns

Two patterns emerge from these deployments:

1. **Controller-driven SR Policy at the DC edge** (Meta, Alibaba, China Telecom). Hosts and cluster fabrics stay as they are. Border routers classify AI traffic by DSCP, Flow Label or VRF and steer it onto controller-computed uA/uN lists or BSIDs. This is classic [SR Policy](../topics/sr-policy.md) and [traffic engineering](../use-cases/traffic-engineering.md) applied to AI.
2. **End-to-end source routing from the NIC** (the IETF AI-backend draft's cross-datacenter extension). The same uSID path a NIC writes inside the cluster is extended with DCI and WAN hops. No production deployment of this has been published yet.

!!! warning "What SRv6 does not solve on long haul"
    SRv6 picks the path; it does not make a 650 km link lossless. Meta relies on ECN-based congestion control, China Telecom on large buffers and flow-level congestion control, and the research community on transport changes. Explicit paths make those mechanisms *predictable*, because each job's traffic stays on known links.

## Frequently Asked Questions

### What is scale-across in AI networking?

Scale-across means connecting AI clusters in different buildings, campuses or regions so that one training job, or a pool of jobs, can use them together. It complements scale-up (inside a server or rack) and scale-out (across a cluster's backend fabric) and brings data center interconnect and WAN design into AI infrastructure.

### Does Meta use SRv6?

Yes. Meta has deployed SRv6 with FBOSS on its regional backbone, which interconnects data center campuses and AI clusters across geographies. It uses uSID with adjacency (uA) segments programmed by a central TE controller, on Cisco Silicon One platforms with 800G ZR+ links of up to 650 km. The first site with SRv6 traffic engineering went into production in October 2026.

### Is SRv6 used for multi-datacenter AI training?

Yes. Alibaba Cloud runs a dedicated SRv6 network for scale-across AI with per-job traffic engineering, and China Telecom has trialed cross-cluster training over L3EVPN on SRv6 Policy. Other large multi-site training efforts, such as Microsoft's AI WAN, have not published an SRv6 role.

### Why use SRv6 instead of MPLS for AI data center interconnect?

Data center switches and SONiC are IP-only, so SRv6 lets traffic engineering run end to end on IPv6 without MPLS gateways at the DC edge. Meta also cites QoS: the IPv6 Traffic Class field carries the six priority classes it needs, while its MPLS encoding supports four.

## Further Reading

- :material-arrow-right: [SRv6 for AI](index.md) - The hub for every AI topic on SRv6.md
- :material-arrow-right: [SR Policy](../topics/sr-policy.md) - Binding SIDs, candidate paths and steering
- :material-arrow-right: [Inter-Domain SRv6](../topics/inter-domain.md) - SRv6 across administrative domains
- :material-arrow-right: [Real-World Deployments](../use-cases/deployments.md) - Public SRv6 deployments by operator
- :material-arrow-right: [Cloud-Native Backbone](../use-cases/cloud-native-backbone.md) - SRv6 for cloud WANs

## References

1. [OCP Summit 2026: Powering AI with open innovations in scale-up, scale-out and scale-across networks](https://engineering.fb.com/2026/10/12/open-source/ocp-summit-2026-powering-ai-with-open-innovations-in-scale-up-scale-out-and-scale-across-networks/) - Meta Engineering blog: SRv6 with FBOSS on the regional backbone; BAG
2. [SRv6 Powered Backbone Networks (slides)](https://www.segment-routing.net/images/OCP-summit26/Srv6-powered-backbone-networks.pdf) - Meta at OCP 2026: RBB topology, uSID data plane, controller, QoS rationale, timeline
3. [SRv6 Traffic Engineering in AI DCI/WAN for AI Traffic (slides)](https://www.segment-routing.net/images/OCP-summit26/Traffic-Engineering-in-AI-DCI-WAN-for-AI-Traffic.pdf) - Alibaba Cloud and Cisco at OCP 2026: eCore for AI, per-job TE
4. [IPv6 & SRv6 Powering Alibaba Cloud AI Computing (IETF 125)](https://datatracker.ietf.org/meeting/125/materials/slides-125-srv6ops-21-ipv6srv6-powering-alibaba-cloud-ai-computing-alibaba-02) - Flow Label to SRv6 path steering for cross-region AI traffic
5. [Alibaba eCore at OCP Summit 2025 (slides)](https://www.segment-routing.net/images/OCP-summit25-eCore_Alibaba.pdf) - SRv6-only DCI/WAN on SONiC
6. [China Telecom computing-power metro network white paper (2025)](https://www.gfnds.com/uploads/20250818/59e55fd7289db89d0a8e02ccd676ae87.pdf) - L3EVPN over SRv6 Policy for cross-cluster training (in Chinese)
7. [draft-filsfils-srv6ops-srv6-ai-backend](https://datatracker.ietf.org/doc/draft-filsfils-srv6ops-srv6-ai-backend/) - Includes a cross-datacenter extension section
8. [Cisco Silicon One P200 powers the first 51.2T scale-across routing systems](https://blogs.cisco.com/sp/cisco-silicon-one-p200-powers-the-first-51-2t-scale-across-routing-systems) - Cisco 8223 launch
9. [NVIDIA introduces Spectrum-XGS Ethernet](https://nvidianews.nvidia.com/news/nvidia-introduces-spectrum-xgs-ethernet-to-connect-distributed-data-centers-into-giga-scale-ai-super-factories) - NVIDIA's scale-across announcement
10. [China Mobile at the 2026 China Computing Power Conference](https://news.qq.com/rain/a/20260915A035YK00) - G-SRv6 scale claim (in Chinese)
