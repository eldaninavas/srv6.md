---
title: Arista EOS
seo_title: "SRv6 on Arista EOS: uSID Configuration and Platforms"
description: SRv6 uSID support on Arista EOS — uN, static uA, IS-IS, counters, SSU, and supported platforms
tags:
  - implementations
  - arista
  - usid
  - data-center
---

# SRv6 on Arista EOS

Arista EOS implements SRv6 with a **uSID-first** design: the forwarding model is built around micro-SIDs in the `F3216` format (32-bit block, 16-bit uSIDs), starting with the uN node SID and adding static uA adjacency SIDs, IS-IS integration, counters, and hitless upgrade support over the 4.35 and 4.36 release trains. The authors of OpenAI's **MRC** AI-cluster transport collaborated with Arista to implement SRv6 in EOS on Broadcom Tomahawk 5 switches, and MRC runs in large-scale production — see [AI/ML Networks](../use-cases/ai-networking.md).

!!! info "Source scope"
    This page summarizes Arista's public EOS user manual (EOS 4.36.2F) and the titles/summaries of Arista's public SRv6 TOI (Technical Overview of Information) listings. Full TOI documents require an Arista login; check them and the release notes for your exact version before deploying.

## Feature Timeline

| Feature | EOS release | Source |
|---------|-------------|--------|
| uN (End with uSID) | Before 4.35.2F (base support referenced by the uA TOI) | TOI listing |
| Static SRv6 adjacency segments (**uA**) | 4.35.2F | TOI: "Support for SRv6 static adjacency segments (uA)" |
| **IS-IS** SRv6 with micro-SID compression, Flex-Algo, and **TI-LFA** | 4.36.1F | TOI: "Support for SRv6 in IS-IS" |
| **Smart System Upgrade (SSU)** with SRv6 uN | 4.36.1F | TOI: "SSU support for SRv6" |
| Per-endpoint **counters** (packets/bytes per endpoint operation, e.g. uN) | 4.36.2F | TOI: "Support for SRv6 Counters" |

## Capabilities (EOS 4.36.2F user manual)

The `show srv6 capabilities` example in the user manual reports:

| Category | Supported | Not supported |
|----------|-----------|---------------|
| Endpoint behaviors | End (uN when used with uSIDs), End.DT4, End.DT6 | End.X, End.DX4, End.DX6 |
| Flavors | PSP, USD, Next-CSID | USP |
| Headend behaviors | H.Encaps | H.Encaps.Red, H.Insert, H.Insert.Red |
| uSID formats | F3216 | — |

!!! note
    Static uA support (an End.X-type adjacency micro-SID) is documented separately in the uA TOI for EOS 4.35.2F and later, so treat the capability table as a snapshot of the manual's example rather than a complete feature list.

## Supported Platforms

| Family | Models listed in the user manual |
|--------|----------------------------------|
| 7060X6 | DCS-7060X6 |
| 7280R3 / R4 | DCS-7280R3, DCS-7280R4-32\*, DCS-7280R4K-32\*, DCS-7282R4\* |
| 7500R3 | DCS-7500R3 |
| 7800R3 / R4 | DCS-7800R3, DCS-7800R4-\*, DCS-7800R4K-36PE-LC, DCS-7800R4M-36PE-LC, DCS-DL-7700R4K-\* |

On the R3/R4 (Jericho-family) platforms, SRv6 needs a TCAM profile with the `feature srv usid f3216` feature; the 7060X6 is not listed for that requirement.

## Configuration Model

The manual organizes SRv6 under `router srv6`:

| Command | Purpose |
|---------|---------|
| `router srv6` → `vrf default` | SRv6 configuration context |
| `micro-segment domain` → `block`, `usid length`, `gib range` | Defines the uSID block, uSID length, and Global ID Block range |
| `locator` → `prefix micro-segment domain <d> end usid <v>` | Allocates the node's uN from the domain |
| `igp algorithm flex-algo <name>` | Associates a locator with a Flex-Algo |
| `show srv6 capabilities` / `domain` / `locator` / `routes` | Verification |
| `ping srv6 sid … via segment-list …`, `traceroute srv6 sid …` | SRv6 OAM |

See the user manual for complete configuration examples; exact syntax varies between EOS releases.

!!! warning "OAM gotcha"
    The manual notes that the target uN prefix (for example the /48) must be configured on a loopback for `ping srv6` / `traceroute srv6` to that uN to work.

## Where It Fits

- **AI back-end fabrics** — static, source-routed uSID paths on Tomahawk 5 (7060X6 class) are what MRC uses; see [AI/ML Networks](../use-cases/ai-networking.md) and [CLOS & Load Balancing](../topics/clos-glb.md).
- **DC/WAN edge and spine** — Jericho-based 7280R3/R4 and 7500R3/7800R3/R4 for uSID with IS-IS, Flex-Algo and TI-LFA.

## Further Reading

- :material-arrow-right: [Implementations Overview](index.md)
- :material-arrow-right: [uSID Compression](../topics/usid-compression.md) - F3216 format and shift-and-forward
- :material-arrow-right: [AI/ML Networks](../use-cases/ai-networking.md) - MRC: OpenAI's SRv6 static source routing in production
- :material-arrow-right: [TI-LFA](../topics/ti-lfa.md) - Fast reroute with SRv6 repair segments

## References

1. [Arista EOS User Manual: Segment Routing over IPv6 (SRv6)](https://www.arista.com/en/um-eos/eos-segment-routing-over-ipv6-srv6) - EOS 4.36.2F SRv6 chapter: platforms, `router srv6`/micro-segment configuration, capabilities, OAM
2. [Arista TOI: SRv6 tag listing](https://www.arista.com/en/support/toi/tag/srv6) - Index of SRv6 Technical Overviews (uA, IS-IS, SSU, counters) with release tags
3. [Arista TOI: Support for SRv6 static adjacency segments (uA)](https://www.arista.com/en/support/toi/eos-4-35-2f/23704-support-for-srv6-static-adjacency-segments-ua) - EOS 4.35.2F static uA (login required)
4. [Arista TOI: SSU support for SRv6](https://www.arista.com/en/support/toi/eos-4-36-1f/24348-ssu-support-for-srv6) - EOS 4.36.1F Smart System Upgrade with SRv6 uN (login required)
5. [Arista TOI: Support for SRv6 Counters](https://www.arista.com/en/support/toi/eos-4-36-2f/24770-support-for-srv6-counters) - EOS 4.36.2F per-endpoint packet/byte counters (login required)
6. [Resilient AI Supercomputer Networking using MRC and SRv6](https://cdn.openai.com/pdf/resilient-ai-supercomputer-networking-using-mrc-and-srv6.pdf) - OpenAI et al. paper; states SRv6 was implemented with Arista in EOS on Broadcom Tomahawk 5 switches for MRC
