---
title: State of SRv6 2026
seo_title: "State of SRv6 2026: RFCs, Drafts, Deployments, Vendors"
description: "Data report on SRv6 in 2026: 23 RFCs, 65 active IETF drafts, 18 public deployments and uSID support across 11 implementations. Every figure sourced."
og_image: assets/images/state-of-srv6-2026.png
tags:
  - reports
  - standards
  - deployments
  - implementations
  - SRv6 adoption
  - SRv6 statistics
---

# State of SRv6 2026

**A data report on Segment Routing over IPv6: standards, work in progress, public deployments and vendor support.** Data as of 20 October 2026. Every number links to its source, and the scripts that produce the IETF figures and charts are in the [repository](https://github.com/eldaninavas/srv6.md/tree/main/tools/state-of-srv6).

## Key findings

1. **23 RFCs** are explicitly about SRv6, from [RFC 8754](../rfcs/rfc8754.md) (the SRH, March 2020) to [RFC 10038](../rfcs/rfc10038.md) (SRv6 locators over DHCPv6, August 2026). [Details](#standards-23-rfcs)
2. **2023 and 2025 were the busiest years**, with 7 SRv6 RFCs each. Three more have been published in 2026 so far. [Details](#standards-23-rfcs)
3. **65 active Internet-Drafts** in seven IETF working groups mention SRv6: 25 adopted by a working group and 40 individual submissions. [Details](#work-in-progress-65-active-drafts)
4. **SPRING carries 28 of them**, and **srv6ops**, the working group for SRv6 operations, has 13. [Details](#work-in-progress-65-active-drafts)
5. **18 organizations** have documented SRv6 in their own networks in public: 9 telecom operators, 8 cloud and AI companies and 1 government agency. [Details](#deployments-18-organizations)
6. **SRv6 moved into AI training networks.** OpenAI, Microsoft and Oracle use static SRv6 source routing inside GPU fabrics, and Meta and Alibaba Cloud use SRv6 traffic engineering between AI sites. [Details](#milestones-of-2026)
7. **uSID is the mainstream encoding**: 8 of the 11 implementations in the [support matrix](../implementations/support-matrix.md) support NEXT-C-SID (uSID), and 2 more support it partially. [Details](#implementations-11-tracked)

## Standards: 23 RFCs

The count includes every RFC whose title or abstract names SRv6, "Segment Routing over IPv6", "IPv6 Segment Routing" or the Segment Routing Header. It leaves out general Segment Routing RFCs that SRv6 also uses but whose abstract does not mention it, such as [RFC 8402](../rfcs/rfc8402.md) (SR architecture), [RFC 9256](../rfcs/rfc9256.md) (SR Policy), [RFC 9830](../rfcs/rfc9830.md) (SR Policy in BGP) and [RFC 9855](../rfcs/rfc9855.md) (TI-LFA). The [RFCs section](../rfcs/index.md) of this site explains those too.

<!-- chart:rfc-timeline -->
<figure class="srv6-figure sor-figure" style="width:100%">
<svg viewBox="0 0 420 220" role="img" aria-labelledby="sor-rfc-t sor-rfc-d" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:auto;max-width:588px"><title id="sor-rfc-t">SRv6 RFCs published per year, 2018–2026</title><desc id="sor-rfc-d">Column chart. 23 RFCs mention SRv6 in their title or abstract. 2018: 0, 2019: 0, 2020: 1, 2021: 1, 2022: 2, 2023: 7, 2024: 2, 2025: 7, 2026: 3. 2026 counts RFCs published by 20 October 2026.</desc><style>.sor-b1{fill:var(--md-primary-fg-color)}.sor-b2{fill:var(--md-primary-fg-color);fill-opacity:.32;stroke:var(--md-primary-fg-color);stroke-width:1}[data-md-color-scheme=slate] .sor-b1{fill:var(--md-primary-fg-color--light)}[data-md-color-scheme=slate] .sor-b2{fill:var(--md-primary-fg-color--light);stroke:var(--md-primary-fg-color--light)}.sor-t{fill:var(--md-default-fg-color);font-family:var(--md-text-font-family,sans-serif);font-size:14px}.sor-v{fill:var(--md-default-fg-color);font-family:var(--md-text-font-family,sans-serif);font-size:13px;font-weight:600}.sor-m{fill:var(--md-default-fg-color--light);font-family:var(--md-text-font-family,sans-serif);font-size:12px}.sor-ax{stroke:var(--md-default-fg-color--lighter);stroke-width:1}.sor-hit{fill:transparent}.sor-g:hover .sor-b1,.sor-g:hover .sor-b2{fill-opacity:.8}</style><line class="sor-ax" x1="8" y1="190" x2="412" y2="190"/><g class="sor-g"><title>2018: 0 RFCs</title><rect class="sor-hit" x="8.0" y="4" width="44.9" height="206"/><text class="sor-v" x="30.4" y="184.0" text-anchor="middle">0</text><text class="sor-m" x="30.4" y="208" text-anchor="middle">2018</text></g><g class="sor-g"><title>2019: 0 RFCs</title><rect class="sor-hit" x="52.9" y="4" width="44.9" height="206"/><text class="sor-v" x="75.3" y="184.0" text-anchor="middle">0</text><text class="sor-m" x="75.3" y="208" text-anchor="middle">2019</text></g><g class="sor-g"><title>2020: 1 RFCs</title><rect class="sor-hit" x="97.8" y="4" width="44.9" height="206"/><path class="sor-b1" d="M106.8,190.0v-19.7a4,4 0 0 1 4,-4h18.9a4,4 0 0 1 4,4v19.7z"/><text class="sor-v" x="120.2" y="160.3" text-anchor="middle">1</text><text class="sor-m" x="120.2" y="208" text-anchor="middle">2020</text></g><g class="sor-g"><title>2021: 1 RFCs</title><rect class="sor-hit" x="142.7" y="4" width="44.9" height="206"/><path class="sor-b1" d="M151.6,190.0v-19.7a4,4 0 0 1 4,-4h18.9a4,4 0 0 1 4,4v19.7z"/><text class="sor-v" x="165.1" y="160.3" text-anchor="middle">1</text><text class="sor-m" x="165.1" y="208" text-anchor="middle">2021</text></g><g class="sor-g"><title>2022: 2 RFCs</title><rect class="sor-hit" x="187.6" y="4" width="44.9" height="206"/><path class="sor-b1" d="M196.5,190.0v-43.4a4,4 0 0 1 4,-4h18.9a4,4 0 0 1 4,4v43.4z"/><text class="sor-v" x="210.0" y="136.6" text-anchor="middle">2</text><text class="sor-m" x="210.0" y="208" text-anchor="middle">2022</text></g><g class="sor-g"><title>2023: 7 RFCs</title><rect class="sor-hit" x="232.4" y="4" width="44.9" height="206"/><path class="sor-b1" d="M241.4,190.0v-162.0a4,4 0 0 1 4,-4h18.9a4,4 0 0 1 4,4v162.0z"/><text class="sor-v" x="254.9" y="18.0" text-anchor="middle">7</text><text class="sor-m" x="254.9" y="208" text-anchor="middle">2023</text></g><g class="sor-g"><title>2024: 2 RFCs</title><rect class="sor-hit" x="277.3" y="4" width="44.9" height="206"/><path class="sor-b1" d="M286.3,190.0v-43.4a4,4 0 0 1 4,-4h18.9a4,4 0 0 1 4,4v43.4z"/><text class="sor-v" x="299.8" y="136.6" text-anchor="middle">2</text><text class="sor-m" x="299.8" y="208" text-anchor="middle">2024</text></g><g class="sor-g"><title>2025: 7 RFCs</title><rect class="sor-hit" x="322.2" y="4" width="44.9" height="206"/><path class="sor-b1" d="M331.2,190.0v-162.0a4,4 0 0 1 4,-4h18.9a4,4 0 0 1 4,4v162.0z"/><text class="sor-v" x="344.7" y="18.0" text-anchor="middle">7</text><text class="sor-m" x="344.7" y="208" text-anchor="middle">2025</text></g><g class="sor-g"><title>2026: 3 RFCs</title><rect class="sor-hit" x="367.1" y="4" width="44.9" height="206"/><path class="sor-b1" d="M376.1,190.0v-67.1a4,4 0 0 1 4,-4h18.9a4,4 0 0 1 4,4v67.1z"/><text class="sor-v" x="389.6" y="112.9" text-anchor="middle">3</text><text class="sor-m" x="389.6" y="208" text-anchor="middle">2026</text></g></svg>
<figcaption>SRv6 RFCs by year of publication (23 in total; 2026 up to 20 October 2026). Source: IETF Datatracker and RFC Editor.</figcaption>
</figure>

??? note "Data: SRv6 RFCs per year"

    | Year | RFCs |
    |---|:---:|
    | 2018 | 0 |
    | 2019 | 0 |
    | 2020 | 1 |
    | 2021 | 1 |
    | 2022 | 2 |
    | 2023 | 7 |
    | 2024 | 2 |
    | 2025 | 7 |
    | 2026 | 3 |
<!-- /chart:rfc-timeline -->

The work moved from the data plane to everything around it. The first RFCs (2020–2021) defined the header and the behaviors. 2023 brought the routing protocols (IS-IS, OSPFv3, BGP-LS) and telemetry. 2025 brought uSID compression ([RFC 9800](../rfcs/rfc9800.md)), service signaling and controller extensions. In 2026 so far: alternate-marking measurement on the SRH ([RFC 9947](https://datatracker.ietf.org/doc/rfc9947/)), point-to-multipoint policies ([RFC 9960](../rfcs/rfc9960.md)) and locator assignment over DHCPv6 ([RFC 10038](../rfcs/rfc10038.md)).

Eighteen of the 23 are Proposed Standards, three are Informational and two Experimental. They came from eleven working groups, plus one RFC published outside a working group. `6man`, `spring`, `lsr`, `idr` and `bess` produced three each.

All 23, with dates and status from the RFC Editor:

<!-- chart:rfc-list -->
| RFC | Title | Published | Status | WG |
|---|:---:|:---:|:---:|:---:|
| [RFC 8754](../rfcs/rfc8754.md) | IPv6 Segment Routing Header (SRH) | March 2020 | Proposed Standard | `6man` |
| [RFC 8986](../rfcs/rfc8986.md) | Segment Routing over IPv6 (SRv6) Network Programming | February 2021 | Proposed Standard | `spring` |
| [RFC 9252](../rfcs/rfc9252.md) | BGP Overlay Services Based on Segment Routing over IPv6 (SRv6) | July 2022 | Proposed Standard | `bess` |
| [RFC 9259](../rfcs/rfc9259.md) | Operations, Administration, and Maintenance (OAM) in Segment Routing over IPv6 (SRv6) | June 2022 | Proposed Standard | `6man` |
| [RFC 9350](../rfcs/rfc9350.md) | IGP Flexible Algorithm | February 2023 | Proposed Standard | `lsr` |
| [RFC 9352](../rfcs/rfc9352.md) | IS-IS Extensions to Support Segment Routing over the IPv6 Data Plane | February 2023 | Proposed Standard | `lsr` |
| [RFC 9433](../rfcs/rfc9433.md) | Segment Routing over IPv6 for the Mobile User Plane | July 2023 | Informational | `dmm` |
| [RFC 9487](../rfcs/rfc9487.md) | Export of Segment Routing over IPv6 Information in IP Flow Information Export (IPFIX) | November 2023 | Proposed Standard | `opsawg` |
| [RFC 9503](https://datatracker.ietf.org/doc/rfc9503/) | Simple Two-Way Active Measurement Protocol (STAMP) Extensions for Segment Routing Networks | November 2023 | Proposed Standard | `ippm` |
| [RFC 9513](../rfcs/rfc9513.md) | OSPFv3 Extensions for Segment Routing over IPv6 (SRv6) | December 2023 | Proposed Standard | `lsr` |
| [RFC 9514](../rfcs/rfc9514.md) | Border Gateway Protocol - Link State (BGP-LS) Extensions for Segment Routing over IPv6 (SRv6) | December 2023 | Proposed Standard | `idr` |
| [RFC 9602](../rfcs/rfc9602.md) | Segment Routing over IPv6 (SRv6) Segment Identifiers in the IPv6 Addressing Architecture | October 2024 | Informational | `6man` |
| [RFC 9603](../rfcs/rfc9603.md) | Path Computation Element Communication Protocol (PCEP) Extensions for IPv6 Segment Routing | July 2024 | Proposed Standard | `pce` |
| [RFC 9702](https://datatracker.ietf.org/doc/rfc9702/) | YANG Data Model for Maximum Segment Identifier (SID) Depth (MSD) Types and MPLS MSD | January 2025 | Proposed Standard | `mpls` |
| [RFC 9723](../rfcs/rfc9723.md) | BGP Colored Prefix Routing (CPR) for Services Based on Segment Routing over IPv6 (SRv6) | May 2025 | Informational | `idr` |
| [RFC 9746](https://datatracker.ietf.org/doc/rfc9746/) | BGP EVPN Multihoming Extensions for Split-Horizon Filtering | March 2025 | Proposed Standard | `bess` |
| [RFC 9800](../rfcs/rfc9800.md) | Compressed SRv6 Segment List Encoding | June 2025 | Proposed Standard | `spring` |
| [RFC 9819](../rfcs/rfc9819.md) | Argument Signaling for BGP Services in Segment Routing over IPv6 (SRv6) | July 2025 | Proposed Standard | `bess` |
| [RFC 9862](https://datatracker.ietf.org/doc/rfc9862/) | Path Computation Element Communication Protocol (PCEP) Extensions for Segment Routing (SR) Policy Candidate Paths | October 2025 | Proposed Standard | `pce` |
| [RFC 9871](https://datatracker.ietf.org/doc/rfc9871/) | BGP Color-Aware Routing (CAR) | November 2025 | Experimental | `idr` |
| [RFC 9947](https://datatracker.ietf.org/doc/rfc9947/) | Application of the Alternate-Marking Method to the Segment Routing Header | March 2026 | Experimental | `none` |
| [RFC 9960](../rfcs/rfc9960.md) | Segment Routing Point-to-Multipoint Policy | April 2026 | Proposed Standard | `pim` |
| [RFC 10038](../rfcs/rfc10038.md) | Distributing the Segment Routing over IPv6 (SRv6) Locator Using DHCPv6 | August 2026 | Proposed Standard | `spring` |
<!-- /chart:rfc-list -->

## Work in progress: 65 active drafts

On 20 October 2026 the IETF Datatracker listed 65 active Internet-Drafts that mention SRv6 in their title or abstract within the seven working groups most involved: `spring`, `srv6ops`, `idr`, `lsr`, `6man`, `bess` and `pce`. A working-group draft (`draft-ietf-<wg>-…`) has been adopted by the group. An individual draft (`draft-<author>-<wg>-…`) is a proposal aimed at that group that has not been adopted.

<!-- chart:drafts-by-wg -->
<figure class="srv6-figure sor-figure" style="width:100%">
<svg viewBox="0 0 420 242" role="img" aria-labelledby="sor-wg-t sor-wg-d" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:auto;max-width:588px"><title id="sor-wg-t">Active SRv6 Internet-Drafts by IETF working group</title><desc id="sor-wg-d">Bar chart. 65 active drafts mention SRv6: 25 adopted by a working group and 40 individual drafts aimed at one. spring: 12 adopted, 16 individual; srv6ops: 3 adopted, 10 individual; idr: 4 adopted, 5 individual; lsr: 3 adopted, 1 individual; 6man: 1 adopted, 3 individual; bess: 0 adopted, 4 individual; pce: 2 adopted, 1 individual.</desc><style>.sor-b1{fill:var(--md-primary-fg-color)}.sor-b2{fill:var(--md-primary-fg-color);fill-opacity:.32;stroke:var(--md-primary-fg-color);stroke-width:1}[data-md-color-scheme=slate] .sor-b1{fill:var(--md-primary-fg-color--light)}[data-md-color-scheme=slate] .sor-b2{fill:var(--md-primary-fg-color--light);stroke:var(--md-primary-fg-color--light)}.sor-t{fill:var(--md-default-fg-color);font-family:var(--md-text-font-family,sans-serif);font-size:14px}.sor-v{fill:var(--md-default-fg-color);font-family:var(--md-text-font-family,sans-serif);font-size:13px;font-weight:600}.sor-m{fill:var(--md-default-fg-color--light);font-family:var(--md-text-font-family,sans-serif);font-size:12px}.sor-ax{stroke:var(--md-default-fg-color--lighter);stroke-width:1}.sor-hit{fill:transparent}.sor-g:hover .sor-b1,.sor-g:hover .sor-b2{fill-opacity:.8}</style><g transform="translate(123,0)"><rect class="sor-b1" x="0" y="6" width="12" height="12" rx="2"/><text class="sor-m" x="18" y="16">Working-group drafts</text><rect class="sor-b2" x="170" y="6" width="12" height="12" rx="2"/><text class="sor-m" x="188" y="16">Individual drafts</text></g><line class="sor-ax" x1="178" y1="24" x2="178" y2="238"/><g class="sor-g"><title>spring: 28 drafts (Working-group drafts: 12, Individual drafts: 16)</title><rect class="sor-hit" x="0" y="26" width="420" height="30"/><text class="sor-t" x="170" y="46.0" text-anchor="end">spring</text><rect class="sor-b1" x="178.0" y="33.0" width="86.3" height="16"/><path class="sor-b2" d="M266.3,33.0h113.7a4,4 0 0 1 4,4v8.0a4,4 0 0 1 -4,4h-113.7z"/><text class="sor-v" x="390.0" y="46.0">28</text></g><g class="sor-g"><title>srv6ops: 13 drafts (Working-group drafts: 3, Individual drafts: 10)</title><rect class="sor-hit" x="0" y="56" width="420" height="30"/><text class="sor-t" x="170" y="76.0" text-anchor="end">srv6ops</text><rect class="sor-b1" x="178.0" y="63.0" width="20.1" height="16"/><path class="sor-b2" d="M200.1,63.0h69.6a4,4 0 0 1 4,4v8.0a4,4 0 0 1 -4,4h-69.6z"/><text class="sor-v" x="279.6" y="76.0">13</text></g><g class="sor-g"><title>idr: 9 drafts (Working-group drafts: 4, Individual drafts: 5)</title><rect class="sor-hit" x="0" y="86" width="420" height="30"/><text class="sor-t" x="170" y="106.0" text-anchor="end">idr</text><rect class="sor-b1" x="178.0" y="93.0" width="27.4" height="16"/><path class="sor-b2" d="M207.4,93.0h32.8a4,4 0 0 1 4,4v8.0a4,4 0 0 1 -4,4h-32.8z"/><text class="sor-v" x="250.2" y="106.0">9</text></g><g class="sor-g"><title>lsr: 4 drafts (Working-group drafts: 3, Individual drafts: 1)</title><rect class="sor-hit" x="0" y="116" width="420" height="30"/><text class="sor-t" x="170" y="136.0" text-anchor="end">lsr</text><rect class="sor-b1" x="178.0" y="123.0" width="20.1" height="16"/><path class="sor-b2" d="M200.1,123.0h3.4a4,4 0 0 1 4,4v8.0a4,4 0 0 1 -4,4h-3.4z"/><text class="sor-v" x="213.4" y="136.0">4</text></g><g class="sor-g"><title>6man: 4 drafts (Working-group drafts: 1, Individual drafts: 3)</title><rect class="sor-hit" x="0" y="146" width="420" height="30"/><text class="sor-t" x="170" y="166.0" text-anchor="end">6man</text><rect class="sor-b1" x="178.0" y="153.0" width="5.4" height="16"/><path class="sor-b2" d="M185.4,153.0h18.1a4,4 0 0 1 4,4v8.0a4,4 0 0 1 -4,4h-18.1z"/><text class="sor-v" x="213.4" y="166.0">4</text></g><g class="sor-g"><title>bess: 4 drafts (Working-group drafts: 0, Individual drafts: 4)</title><rect class="sor-hit" x="0" y="176" width="420" height="30"/><text class="sor-t" x="170" y="196.0" text-anchor="end">bess</text><path class="sor-b2" d="M178.0,183.0h25.4a4,4 0 0 1 4,4v8.0a4,4 0 0 1 -4,4h-25.4z"/><text class="sor-v" x="213.4" y="196.0">4</text></g><g class="sor-g"><title>pce: 3 drafts (Working-group drafts: 2, Individual drafts: 1)</title><rect class="sor-hit" x="0" y="206" width="420" height="30"/><text class="sor-t" x="170" y="226.0" text-anchor="end">pce</text><rect class="sor-b1" x="178.0" y="213.0" width="12.7" height="16"/><path class="sor-b2" d="M192.7,213.0h3.4a4,4 0 0 1 4,4v8.0a4,4 0 0 1 -4,4h-3.4z"/><text class="sor-v" x="206.1" y="226.0">3</text></g></svg>
<figcaption>Active Internet-Drafts that mention SRv6, by working group, on 20 October 2026. Source: IETF Datatracker API.</figcaption>
</figure>

??? note "Data: active SRv6 drafts by working group"

    | Working group | WG-adopted | Individual | Total |
    |---|:---:|:---:|:---:|
    | `spring` | 12 | 16 | 28 |
    | `srv6ops` | 3 | 10 | 13 |
    | `idr` | 4 | 5 | 9 |
    | `lsr` | 3 | 1 | 4 |
    | `6man` | 1 | 3 | 4 |
    | `bess` | 0 | 4 | 4 |
    | `pce` | 2 | 1 | 3 |
    | **All seven** | 25 | 40 | 65 |
<!-- /chart:drafts-by-wg -->

Two patterns stand out. SPRING, the group that owns the SRv6 architecture, still has the most drafts (28). And srv6ops, chartered for operations and deployment, has the highest ratio of proposals to adopted work: 10 individual drafts against 3 adopted. Several of those proposals cover AI networks, service function chaining and protection.

The 25 working-group drafts, furthest along first:

<!-- chart:wg-drafts -->
| Draft | Title | WG | Rev | Stage |
|---|:---:|:---:|:---:|:---:|
| [draft-ietf-spring-resource-aware-segments](https://datatracker.ietf.org/doc/draft-ietf-spring-resource-aware-segments/) | Introducing Resource Awareness to SR Segments | `spring` | 21 | RFC Editor queue |
| [draft-ietf-6man-sidlist-clarification](https://datatracker.ietf.org/doc/draft-ietf-6man-sidlist-clarification/) | Clarifying SRv6 SID List Processing | `6man` | 03 | RFC Editor queue |
| [draft-ietf-idr-ts-flowspec-srv6-policy](https://datatracker.ietf.org/doc/draft-ietf-idr-ts-flowspec-srv6-policy/) | Traffic Steering using BGP FlowSpec with SR Policy | `idr` | 19 | IETF Last Call |
| [draft-ietf-spring-srv6-security](https://datatracker.ietf.org/doc/draft-ietf-spring-srv6-security/) | Segment Routing over IPv6 (SRv6) Security Considerations | `spring` | 19 | IESG evaluation (deferred) |
| [draft-ietf-spring-sr-redundancy-protection](https://datatracker.ietf.org/doc/draft-ietf-spring-sr-redundancy-protection/) | SRv6 for Redundancy Protection | `spring` | 09 | WG Last Call |
| [draft-ietf-spring-stamp-srpm-mpls](https://datatracker.ietf.org/doc/draft-ietf-spring-stamp-srpm-mpls/) | Performance Measurement Using Simple Two-Way Active Measurement Protocol (STAMP) for Segment Routing over the MPLS Data Plane | `spring` | 12 | WG Last Call |
| [draft-ietf-spring-sid-as-source-address](https://datatracker.ietf.org/doc/draft-ietf-spring-sid-as-source-address/) | SID as source address in SRv6 | `spring` | 01 | WG document |
| [draft-ietf-spring-sr-policy-yang](https://datatracker.ietf.org/doc/draft-ietf-spring-sr-policy-yang/) | YANG Data Model for Segment Routing Policy | `spring` | 08 | WG document |
| [draft-ietf-spring-srv6-inter-layer-programming](https://datatracker.ietf.org/doc/draft-ietf-spring-srv6-inter-layer-programming/) | SRv6 for Inter-Layer Network Programming | `spring` | 03 | WG document |
| [draft-ietf-spring-srv6-mpls-interworking](https://datatracker.ietf.org/doc/draft-ietf-spring-srv6-mpls-interworking/) | SRv6 and MPLS interworking | `spring` | 03 | WG document |
| [draft-ietf-spring-srv6-path-segment](https://datatracker.ietf.org/doc/draft-ietf-spring-srv6-path-segment/) | Path Segment Identifier (PSID) in SRv6 (Segment Routing in IPv6) | `spring` | 16 | WG document |
| [draft-ietf-spring-srv6-service-programming](https://datatracker.ietf.org/doc/draft-ietf-spring-srv6-service-programming/) | SRv6 Service Programming | `spring` | 00 | WG document |
| [draft-ietf-spring-srv6-yang-base](https://datatracker.ietf.org/doc/draft-ietf-spring-srv6-yang-base/) | YANG Data Model for SRv6 Base | `spring` | 02 | WG document |
| [draft-ietf-spring-stamp-srpm-srv6](https://datatracker.ietf.org/doc/draft-ietf-spring-stamp-srpm-srv6/) | Performance Measurement Using Simple Two-Way Active Measurement Protocol (STAMP) for Segment Routing over the IPv6 (SRv6) Data Plane | `spring` | 09 | WG document |
| [draft-ietf-srv6ops-problem-summary](https://datatracker.ietf.org/doc/draft-ietf-srv6ops-problem-summary/) | SRv6 Deployment and Operation Problem Summary | `srv6ops` | 02 | WG document |
| [draft-ietf-srv6ops-srv6-deployment](https://datatracker.ietf.org/doc/draft-ietf-srv6ops-srv6-deployment/) | SRv6 Deployment Options | `srv6ops` | 03 | WG document |
| [draft-ietf-srv6ops-srv6addressing](https://datatracker.ietf.org/doc/draft-ietf-srv6ops-srv6addressing/) | Addressing Recommendations for SRv6 | `srv6ops` | 00 | WG document |
| [draft-ietf-idr-bgp-bestpath-nh-selection](https://datatracker.ietf.org/doc/draft-ietf-idr-bgp-bestpath-nh-selection/) | BGP best path next-hop selection enhancements | `idr` | 00 | WG document |
| [draft-ietf-idr-bgp-ls-link-mtu](https://datatracker.ietf.org/doc/draft-ietf-idr-bgp-ls-link-mtu/) | Signaling Maximum Transmission Unit (MTU) using BGP-LS | `idr` | 12 | WG document |
| [draft-ietf-idr-flowspec-srv6](https://datatracker.ietf.org/doc/draft-ietf-idr-flowspec-srv6/) | BGP Flow Specification for SRv6 | `idr` | 10 | WG document |
| [draft-ietf-lsr-isis-srv6-yang](https://datatracker.ietf.org/doc/draft-ietf-lsr-isis-srv6-yang/) | YANG Data Model for IS-IS SRv6 | `lsr` | 10 | WG document |
| [draft-ietf-lsr-ospf-srv6-yang](https://datatracker.ietf.org/doc/draft-ietf-lsr-ospf-srv6-yang/) | YANG Data Model for OSPF SRv6 | `lsr` | 10 | WG document |
| [draft-ietf-lsr-srv6-mirror-sid-igp-encoding](https://datatracker.ietf.org/doc/draft-ietf-lsr-srv6-mirror-sid-igp-encoding/) | IGP Encoding for SRv6 Mirror SID in Egress Protection | `lsr` | 00 | WG document |
| [draft-ietf-pce-pcep-srv6-yang](https://datatracker.ietf.org/doc/draft-ietf-pce-pcep-srv6-yang/) | A YANG Data Model for Segment Routing (SR) Policy and SR in IPv6 (SRv6) support in Path Computation Element Communications Protocol (PCEP) | `pce` | 09 | WG document |
| [draft-ietf-pce-stateful-pce-autobw-update](https://datatracker.ietf.org/doc/draft-ietf-pce-stateful-pce-autobw-update/) | Update to the Automatic Bandwidth Adjustment Procedure for MPLS-TE and SR-TE LSPs with a Stateful PCE | `pce` | 05 | WG document |
<!-- /chart:wg-drafts -->

## Deployments: 18 organizations

This is a count of organizations, not announcements, with a public account of SRv6 in their own network: a press release, an engineering blog, a conference talk by the operator, or an IETF document. Trials and vendor product listings are not counted. It is a lower bound. Many deployments, especially in China, are not announced in English, and the IETF's own deployment-status draft [stopped being updated in 2022](https://datatracker.ietf.org/doc/draft-matsushima-spring-srv6-deployment-status/).

<!-- chart:deployments-by-region -->
<figure class="srv6-figure sor-figure" style="width:100%">
<svg viewBox="0 0 420 132" role="img" aria-labelledby="sor-reg-t sor-reg-d" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:auto;max-width:588px"><title id="sor-reg-t">Public SRv6 deployments by region</title><desc id="sor-reg-d">Bar chart of 18 organizations with a public account of SRv6 in their network, by region: North America 7, Asia-Pacific 6, Europe 4, Latin America 1.</desc><style>.sor-b1{fill:var(--md-primary-fg-color)}.sor-b2{fill:var(--md-primary-fg-color);fill-opacity:.32;stroke:var(--md-primary-fg-color);stroke-width:1}[data-md-color-scheme=slate] .sor-b1{fill:var(--md-primary-fg-color--light)}[data-md-color-scheme=slate] .sor-b2{fill:var(--md-primary-fg-color--light);stroke:var(--md-primary-fg-color--light)}.sor-t{fill:var(--md-default-fg-color);font-family:var(--md-text-font-family,sans-serif);font-size:14px}.sor-v{fill:var(--md-default-fg-color);font-family:var(--md-text-font-family,sans-serif);font-size:13px;font-weight:600}.sor-m{fill:var(--md-default-fg-color--light);font-family:var(--md-text-font-family,sans-serif);font-size:12px}.sor-ax{stroke:var(--md-default-fg-color--lighter);stroke-width:1}.sor-hit{fill:transparent}.sor-g:hover .sor-b1,.sor-g:hover .sor-b2{fill-opacity:.8}</style><line class="sor-ax" x1="178" y1="4" x2="178" y2="128"/><g class="sor-g"><title>North America: 7 organizations</title><rect class="sor-hit" x="0" y="6" width="420" height="30"/><text class="sor-t" x="170" y="26.0" text-anchor="end">North America</text><path class="sor-b1" d="M178.0,13.0h202.0a4,4 0 0 1 4,4v8.0a4,4 0 0 1 -4,4h-202.0z"/><text class="sor-v" x="390.0" y="26.0">7</text></g><g class="sor-g"><title>Asia-Pacific: 6 organizations</title><rect class="sor-hit" x="0" y="36" width="420" height="30"/><text class="sor-t" x="170" y="56.0" text-anchor="end">Asia-Pacific</text><path class="sor-b1" d="M178.0,43.0h172.6a4,4 0 0 1 4,4v8.0a4,4 0 0 1 -4,4h-172.6z"/><text class="sor-v" x="360.6" y="56.0">6</text></g><g class="sor-g"><title>Europe: 4 organizations</title><rect class="sor-hit" x="0" y="66" width="420" height="30"/><text class="sor-t" x="170" y="86.0" text-anchor="end">Europe</text><path class="sor-b1" d="M178.0,73.0h113.7a4,4 0 0 1 4,4v8.0a4,4 0 0 1 -4,4h-113.7z"/><text class="sor-v" x="301.7" y="86.0">4</text></g><g class="sor-g"><title>Latin America: 1 organizations</title><rect class="sor-hit" x="0" y="96" width="420" height="30"/><text class="sor-t" x="170" y="116.0" text-anchor="end">Latin America</text><path class="sor-b1" d="M178.0,103.0h25.4a4,4 0 0 1 4,4v8.0a4,4 0 0 1 -4,4h-25.4z"/><text class="sor-v" x="213.4" y="116.0">1</text></g></svg>
<figcaption>Organizations with publicly documented SRv6 deployments, by region (18 in total).</figcaption>
</figure>

??? note "Data: deployments by region"

    | Region | Organizations |
    |---|:---:|
    | North America | 7 |
    | Asia-Pacific | 6 |
    | Europe | 4 |
    | Latin America | 1 |
<!-- /chart:deployments-by-region -->

<!-- chart:deployments-by-sector -->
<figure class="srv6-figure sor-figure" style="width:100%">
<svg viewBox="0 0 420 102" role="img" aria-labelledby="sor-sec-t sor-sec-d" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:auto;max-width:588px"><title id="sor-sec-t">Public SRv6 deployments by sector</title><desc id="sor-sec-d">Bar chart of 18 organizations with a public account of SRv6 in their network, by sector: Telecom operator 9, Cloud and AI 8, Public sector 1.</desc><style>.sor-b1{fill:var(--md-primary-fg-color)}.sor-b2{fill:var(--md-primary-fg-color);fill-opacity:.32;stroke:var(--md-primary-fg-color);stroke-width:1}[data-md-color-scheme=slate] .sor-b1{fill:var(--md-primary-fg-color--light)}[data-md-color-scheme=slate] .sor-b2{fill:var(--md-primary-fg-color--light);stroke:var(--md-primary-fg-color--light)}.sor-t{fill:var(--md-default-fg-color);font-family:var(--md-text-font-family,sans-serif);font-size:14px}.sor-v{fill:var(--md-default-fg-color);font-family:var(--md-text-font-family,sans-serif);font-size:13px;font-weight:600}.sor-m{fill:var(--md-default-fg-color--light);font-family:var(--md-text-font-family,sans-serif);font-size:12px}.sor-ax{stroke:var(--md-default-fg-color--lighter);stroke-width:1}.sor-hit{fill:transparent}.sor-g:hover .sor-b1,.sor-g:hover .sor-b2{fill-opacity:.8}</style><line class="sor-ax" x1="178" y1="4" x2="178" y2="98"/><g class="sor-g"><title>Telecom operator: 9 organizations</title><rect class="sor-hit" x="0" y="6" width="420" height="30"/><text class="sor-t" x="170" y="26.0" text-anchor="end">Telecom operator</text><path class="sor-b1" d="M178.0,13.0h202.0a4,4 0 0 1 4,4v8.0a4,4 0 0 1 -4,4h-202.0z"/><text class="sor-v" x="390.0" y="26.0">9</text></g><g class="sor-g"><title>Cloud and AI: 8 organizations</title><rect class="sor-hit" x="0" y="36" width="420" height="30"/><text class="sor-t" x="170" y="56.0" text-anchor="end">Cloud and AI</text><path class="sor-b1" d="M178.0,43.0h179.1a4,4 0 0 1 4,4v8.0a4,4 0 0 1 -4,4h-179.1z"/><text class="sor-v" x="367.1" y="56.0">8</text></g><g class="sor-g"><title>Public sector: 1 organizations</title><rect class="sor-hit" x="0" y="66" width="420" height="30"/><text class="sor-t" x="170" y="86.0" text-anchor="end">Public sector</text><path class="sor-b1" d="M178.0,73.0h18.9a4,4 0 0 1 4,4v8.0a4,4 0 0 1 -4,4h-18.9z"/><text class="sor-v" x="206.9" y="86.0">1</text></g></svg>
<figcaption>Organizations with publicly documented SRv6 deployments, by sector (18 in total).</figcaption>
</figure>

??? note "Data: deployments by sector"

    | Sector | Organizations |
    |---|:---:|
    | Telecom operator | 9 |
    | Cloud and AI | 8 |
    | Public sector | 1 |
<!-- /chart:deployments-by-sector -->

Cloud and AI companies (8) now nearly match telecom operators (9), and seven of the eight describe SRv6 in AI infrastructure. The operator list is in [Real-World Deployments](../use-cases/deployments.md) and the AI list in [SRv6 for AI](../ai/index.md#who-uses-srv6-for-ai).

| Organization | Sector | Region | Source |
|--------------|--------|--------|:------:|
| China Mobile | Telecom operator | Asia-Pacific | [WIC 2024](https://regional.chinadaily.com.cn/wic/2024-12/04/c_1050626.htm) |
| Rakuten Mobile | Telecom operator | Asia-Pacific | [Press release](https://corp.mobile.rakuten.co.jp/english/news/press/2024/0729_01/) |
| Reliance Jio | Telecom operator | Asia-Pacific | [Case study](https://www.cisco.com/site/us/en/about/case-studies-customer-stories/reliance-jio.html) |
| SoftBank | Telecom operator | Asia-Pacific | [Press release](https://www.softbank.jp/en/corp/news/press/sbkk/2022/20220426_01/) |
| Iliad | Telecom operator | Europe | [Press release](https://newsroom.cisco.com/c/r/newsroom/en/us/a/y2019/m04/iliad-launches-5g-ready-ip-network-architecture-with-segment-routing-ipv6-in-italy.html) |
| Swisscom | Telecom operator | Europe | [News](https://www.segment-routing.net/news/2024-10-09-swisscom-srv6-usid-ipm/) |
| Bell Canada | Telecom operator | North America | [Workshop slides](https://www.segment-routing.net/images/2023-03-30-srv6-workshop-bell-canada.pdf) |
| Verizon | Telecom operator | North America | [Upperside WC 2026](https://www.segment-routing.net/conferences/Paris26-Verizon-Luay-Jalil/) |
| Telefonica VIVO | Telecom operator | Latin America | [LACNIC blog](https://blog.lacnic.net/en/unveiling-the-future-of-the-network-implementation-of-srv6-usid-in-telefonica-vivos-infrastructure/) |
| Rijkswaterstaat | Public sector | Europe | [Cisco Live 2025](https://www.segment-routing.net/conferences/20250213-cleur-rws-srv6-deployment/) |
| Meta | Cloud and AI | North America | [Meta Engineering](https://engineering.fb.com/2026/10/12/open-source/ocp-summit-2026-powering-ai-with-open-innovations-in-scale-up-scale-out-and-scale-across-networks/) |
| Google | Cloud and AI | North America | [OCP 2026](https://www.segment-routing.net/conferences/2026-10-15-ocp-summit26-google-virgo/) |
| Microsoft | Cloud and AI | North America | [Azure HPC blog](https://techcommunity.microsoft.com/blog/azurehighperformancecomputingblog/building-resilient-networks-for-ai-supercomputers/4516919) |
| OpenAI | Cloud and AI | North America | [OpenAI](https://openai.com/index/mrc-supercomputer-networking/) |
| Oracle (OCI) | Cloud and AI | North America | [IETF draft -05](https://www.ietf.org/archive/id/draft-filsfils-srv6ops-srv6-ai-backend-05.txt) |
| Nebius | Cloud and AI | Europe | [@Scale 2026](https://www.segment-routing.net/conferences/2026-08-25-atscale-nebius-srv6-interconnects/) |
| Alibaba Cloud | Cloud and AI | Asia-Pacific | [IETF 125](https://datatracker.ietf.org/meeting/125/materials/slides-125-srv6ops-21-ipv6srv6-powering-alibaba-cloud-ai-computing-alibaba-02) |
| LINE | Cloud and AI | Asia-Pacific | [Talk, 2019](https://www.segment-routing.net/conferences/2019-09-20-SRv6-LINE-DC/) |

## Implementations: 11 tracked

The [SRv6 support matrix](../implementations/support-matrix.md) records, with a source for every cell, which capabilities each implementation documents: Cisco IOS-XR and IOS-XE, Juniper Junos, Arista EOS, Nokia SR OS, Huawei VRP, FRRouting, the Linux kernel, SONiC, FD.io VPP and open-source Cilium. The chart counts how many document each capability. A capability with no public source counts as not supported, so the bars are a floor.

<!-- chart:implementations -->
<figure class="srv6-figure sor-figure" style="width:100%">
<svg viewBox="0 0 420 362" role="img" aria-labelledby="sor-impl-t sor-impl-d" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:auto;max-width:588px"><title id="sor-impl-t">SRv6 capabilities across 11 implementations</title><desc id="sor-impl-d">Bar chart. Number of the 11 implementations in the SRv6.md support matrix (IOS-XR, IOS-XE, Junos, EOS, SR OS, VRP, FRR, Linux, SONiC, VPP, Cilium) whose documentation shows each capability, fully or partially. SRv6 endpoint (End / uN): 9 full, 1 partial; uSID (NEXT-C-SID): 8 full, 2 partial; IS-IS SRv6: 7 full, 0 partial; BGP L3VPN over SRv6: 6 full, 2 partial; BGP EVPN over SRv6: 4 full, 1 partial; SRv6 SR Policy: 4 full, 5 partial; TI-LFA: 5 full, 0 partial; Flex-Algo: 6 full, 0 partial; Multicast: 0 full, 3 partial; Performance measurement: 3 full, 2 partial; Mobile user plane: 0 full, 1 partial.</desc><style>.sor-b1{fill:var(--md-primary-fg-color)}.sor-b2{fill:var(--md-primary-fg-color);fill-opacity:.32;stroke:var(--md-primary-fg-color);stroke-width:1}[data-md-color-scheme=slate] .sor-b1{fill:var(--md-primary-fg-color--light)}[data-md-color-scheme=slate] .sor-b2{fill:var(--md-primary-fg-color--light);stroke:var(--md-primary-fg-color--light)}.sor-t{fill:var(--md-default-fg-color);font-family:var(--md-text-font-family,sans-serif);font-size:14px}.sor-v{fill:var(--md-default-fg-color);font-family:var(--md-text-font-family,sans-serif);font-size:13px;font-weight:600}.sor-m{fill:var(--md-default-fg-color--light);font-family:var(--md-text-font-family,sans-serif);font-size:12px}.sor-ax{stroke:var(--md-default-fg-color--lighter);stroke-width:1}.sor-hit{fill:transparent}.sor-g:hover .sor-b1,.sor-g:hover .sor-b2{fill-opacity:.8}</style><g transform="translate(270,0)"><rect class="sor-b1" x="0" y="6" width="12" height="12" rx="2"/><text class="sor-m" x="18" y="16">Supported</text><rect class="sor-b2" x="93" y="6" width="12" height="12" rx="2"/><text class="sor-m" x="111" y="16">Partial</text></g><line class="sor-ax" x1="178" y1="24" x2="178" y2="358"/><g class="sor-g"><title>SRv6 endpoint (End / uN): 10 implementations (Supported: 9, Partial: 1)</title><rect class="sor-hit" x="0" y="26" width="420" height="30"/><text class="sor-t" x="170" y="46.0" text-anchor="end">SRv6 endpoint (End / uN)</text><rect class="sor-b1" x="178.0" y="33.0" width="183.4" height="16"/><path class="sor-b2" d="M363.4,33.0h16.6a4,4 0 0 1 4,4v8.0a4,4 0 0 1 -4,4h-16.6z"/><text class="sor-v" x="390.0" y="46.0">10</text></g><g class="sor-g"><title>uSID (NEXT-C-SID): 10 implementations (Supported: 8, Partial: 2)</title><rect class="sor-hit" x="0" y="56" width="420" height="30"/><text class="sor-t" x="170" y="76.0" text-anchor="end">uSID (NEXT-C-SID)</text><rect class="sor-b1" x="178.0" y="63.0" width="162.8" height="16"/><path class="sor-b2" d="M342.8,63.0h37.2a4,4 0 0 1 4,4v8.0a4,4 0 0 1 -4,4h-37.2z"/><text class="sor-v" x="390.0" y="76.0">10</text></g><g class="sor-g"><title>IS-IS SRv6: 7 implementations (Supported: 7, Partial: 0)</title><rect class="sor-hit" x="0" y="86" width="420" height="30"/><text class="sor-t" x="170" y="106.0" text-anchor="end">IS-IS SRv6</text><path class="sor-b1" d="M178.0,93.0h140.2a4,4 0 0 1 4,4v8.0a4,4 0 0 1 -4,4h-140.2z"/><text class="sor-v" x="328.2" y="106.0">7</text></g><g class="sor-g"><title>BGP L3VPN over SRv6: 8 implementations (Supported: 6, Partial: 2)</title><rect class="sor-hit" x="0" y="116" width="420" height="30"/><text class="sor-t" x="170" y="136.0" text-anchor="end">BGP L3VPN over SRv6</text><rect class="sor-b1" x="178.0" y="123.0" width="121.6" height="16"/><path class="sor-b2" d="M301.6,123.0h37.2a4,4 0 0 1 4,4v8.0a4,4 0 0 1 -4,4h-37.2z"/><text class="sor-v" x="348.8" y="136.0">8</text></g><g class="sor-g"><title>BGP EVPN over SRv6: 5 implementations (Supported: 4, Partial: 1)</title><rect class="sor-hit" x="0" y="146" width="420" height="30"/><text class="sor-t" x="170" y="166.0" text-anchor="end">BGP EVPN over SRv6</text><rect class="sor-b1" x="178.0" y="153.0" width="80.4" height="16"/><path class="sor-b2" d="M260.4,153.0h16.6a4,4 0 0 1 4,4v8.0a4,4 0 0 1 -4,4h-16.6z"/><text class="sor-v" x="287.0" y="166.0">5</text></g><g class="sor-g"><title>SRv6 SR Policy: 9 implementations (Supported: 4, Partial: 5)</title><rect class="sor-hit" x="0" y="176" width="420" height="30"/><text class="sor-t" x="170" y="196.0" text-anchor="end">SRv6 SR Policy</text><rect class="sor-b1" x="178.0" y="183.0" width="80.4" height="16"/><path class="sor-b2" d="M260.4,183.0h99.0a4,4 0 0 1 4,4v8.0a4,4 0 0 1 -4,4h-99.0z"/><text class="sor-v" x="369.4" y="196.0">9</text></g><g class="sor-g"><title>TI-LFA: 5 implementations (Supported: 5, Partial: 0)</title><rect class="sor-hit" x="0" y="206" width="420" height="30"/><text class="sor-t" x="170" y="226.0" text-anchor="end">TI-LFA</text><path class="sor-b1" d="M178.0,213.0h99.0a4,4 0 0 1 4,4v8.0a4,4 0 0 1 -4,4h-99.0z"/><text class="sor-v" x="287.0" y="226.0">5</text></g><g class="sor-g"><title>Flex-Algo: 6 implementations (Supported: 6, Partial: 0)</title><rect class="sor-hit" x="0" y="236" width="420" height="30"/><text class="sor-t" x="170" y="256.0" text-anchor="end">Flex-Algo</text><path class="sor-b1" d="M178.0,243.0h119.6a4,4 0 0 1 4,4v8.0a4,4 0 0 1 -4,4h-119.6z"/><text class="sor-v" x="307.6" y="256.0">6</text></g><g class="sor-g"><title>Multicast: 3 implementations (Supported: 0, Partial: 3)</title><rect class="sor-hit" x="0" y="266" width="420" height="30"/><text class="sor-t" x="170" y="286.0" text-anchor="end">Multicast</text><path class="sor-b2" d="M178.0,273.0h57.8a4,4 0 0 1 4,4v8.0a4,4 0 0 1 -4,4h-57.8z"/><text class="sor-v" x="245.8" y="286.0">3</text></g><g class="sor-g"><title>Performance measurement: 5 implementations (Supported: 3, Partial: 2)</title><rect class="sor-hit" x="0" y="296" width="420" height="30"/><text class="sor-t" x="170" y="316.0" text-anchor="end">Performance measurement</text><rect class="sor-b1" x="178.0" y="303.0" width="59.8" height="16"/><path class="sor-b2" d="M239.8,303.0h37.2a4,4 0 0 1 4,4v8.0a4,4 0 0 1 -4,4h-37.2z"/><text class="sor-v" x="287.0" y="316.0">5</text></g><g class="sor-g"><title>Mobile user plane: 1 implementations (Supported: 0, Partial: 1)</title><rect class="sor-hit" x="0" y="326" width="420" height="30"/><text class="sor-t" x="170" y="346.0" text-anchor="end">Mobile user plane</text><path class="sor-b2" d="M178.0,333.0h16.6a4,4 0 0 1 4,4v8.0a4,4 0 0 1 -4,4h-16.6z"/><text class="sor-v" x="204.6" y="346.0">1</text></g></svg>
<figcaption>How many of 11 tracked implementations document each capability (support matrix verified 20 October 2026). Unknown counts as not supported.</figcaption>
</figure>

??? note "Data: implementations by capability"

    | Capability | Supported | Partial | Of 11 |
    |---|:---:|:---:|:---:|
    | SRv6 endpoint (End / uN) | 9 | 1 | 11 |
    | uSID (NEXT-C-SID) | 8 | 2 | 11 |
    | IS-IS SRv6 | 7 | 0 | 11 |
    | BGP L3VPN over SRv6 | 6 | 2 | 11 |
    | BGP EVPN over SRv6 | 4 | 1 | 11 |
    | SRv6 SR Policy | 4 | 5 | 11 |
    | TI-LFA | 5 | 0 | 11 |
    | Flex-Algo | 6 | 0 | 11 |
    | Multicast | 0 | 3 | 11 |
    | Performance measurement | 3 | 2 | 11 |
    | Mobile user plane | 0 | 1 | 11 |
<!-- /chart:implementations -->

The base data plane and uSID are close to universal: only open-source Cilium lacks uSID, and Huawei VRP and SONiC support it partially (in VRP's default 16-bit mode, compression is not the RFC 9800 form). The gaps are higher up the stack. Mobile user plane ([RFC 9433](../rfcs/rfc9433.md)) and SRv6 multicast have the least documented support, and none of the open-source stacks documents SRv6 TI-LFA or EVPN over SRv6.

## Milestones of 2026

| When | Milestone |
|------|-----------|
| Feb 2026 | Cisco and Microsoft present SRv6 uSID and SONiC in AI backends at NANOG 96 ([standards tracker](../ai/ai-standards.md)) |
| Mar 2026 | **FRR 10.6** carries global IPv4/IPv6 unicast over an SRv6 core, beyond VPNs ([FRRouting](../implementations/frrouting.md)) |
| Mar 2026 | **RFC 9947** published: alternate-marking performance measurement on the SRH ([RFC 9947](https://datatracker.ietf.org/doc/rfc9947/)) |
| Mar 2026 | IETF 125: Alibaba Cloud reports its AI computing network runs on IPv6/SRv6 ([SRv6 for AI](../ai/index.md#who-uses-srv6-for-ai)) |
| Mar 2026 | Verizon presents its move to unified traffic engineering with SRv6; Nebius presents SRv6 uSID from DC frontend to WAN (Upperside WC Paris, [deployments](../use-cases/deployments.md)) |
| Apr 2026 | **RFC 9960** published: SR point-to-multipoint policy (Tree-SID) ([RFC 9960](../rfcs/rfc9960.md)) |
| 5 May 2026 | **OpenAI and partners publish MRC** and OCP MRC 1.0: static SRv6 uSID source routing in OpenAI's largest GB200 clusters and Microsoft's Fairwater supercomputers ([MRC and SRv6](../ai/mrc.md)) |
| Jul 2026 | **FRR 10.7** adds BGP-LS with the SRv6 extensions of RFC 9514 ([FRRouting](../implementations/frrouting.md)) |
| Aug 2026 | **RFC 10038** published: SRv6 locators leased over DHCPv6 ([RFC 10038](../rfcs/rfc10038.md)) |
| Aug 2026 | SONiC master gains static uA SIDs in CONFIG_DB ([SONiC](../implementations/sonic.md)) |
| Sep 2026 | The SRv6 AI-backend draft reaches -05 with authors from Cisco, OpenAI, Microsoft, Oracle, IBM, NVIDIA and Arrcus ([standards tracker](../ai/ai-standards.md)) |
| Sep 2026 | China Mobile Henan's G-SRv6 single-stack metro network wins a first prize in the ICT China 2026 cases ([deployments](../use-cases/deployments.md)) |
| Oct 2026 | OCP Global Summit: Meta's first SRv6 TE backbone site in production, Google's Virgo fabric with SRv6 source routing, OpenAI's Clustermapper ([SRv6 for AI](../ai/index.md)) |
| Oct 2026 | Linux 7.3 adds a post-encapsulation lookup in a chosen FIB table; RFC 9433 mobile user plane patches reach v5 on netdev ([Linux kernel](../implementations/linux-kernel.md)) |
| 2026 | IOS-XE 26.1.1 brings SRv6 to the IR1101 industrial router and is validated on Cisco 8000 Series Secure Routers in a quantum-safe SRv6 fabric design ([IOS-XE](../implementations/cisco-ios-xe.md)) |
| 2026 | Arista 7280R4 acts as an SRv6 L3VPN and EVPN RT5 PE in the EANTC multi-vendor interop tests; Nokia SR OS 26.3 documents SRv6 microloop avoidance ([Arista EOS](../implementations/arista-eos.md), [Nokia SR OS](../implementations/nokia-sros.md)) |

## What to watch in 2027

These are the documents closest to publication or adoption on 20 October 2026, according to the Datatracker. The IETF does not commit to dates, so read them as signals rather than forecasts.

- **Next RFCs.** Two working-group drafts are in the RFC Editor queue: [draft-ietf-6man-sidlist-clarification](https://datatracker.ietf.org/doc/draft-ietf-6man-sidlist-clarification/), which clarifies how nodes process the SRv6 SID list, and [draft-ietf-spring-resource-aware-segments](https://datatracker.ietf.org/doc/draft-ietf-spring-resource-aware-segments/). [draft-ietf-idr-ts-flowspec-srv6-policy](https://datatracker.ietf.org/doc/draft-ietf-idr-ts-flowspec-srv6-policy/) (steering with BGP FlowSpec into SR Policies) is in IETF Last Call.
- **SRv6 security.** [draft-ietf-spring-srv6-security](https://datatracker.ietf.org/doc/draft-ietf-spring-srv6-security/), the threat analysis of the SRv6 data plane, is in IESG evaluation at revision -19. See [Security](../topics/security.md).
- **Operational guidance.** srv6ops has three adopted drafts on deployment options, addressing recommendations and a summary of operational problems.
- **AI networks.** [draft-filsfils-srv6ops-srv6-ai-backend](https://datatracker.ietf.org/doc/draft-filsfils-srv6ops-srv6-ai-backend/) asked for adoption at IETF 126. Other individual drafts cover SRv6 TE for AI networks and adaptive load balancing for AI data center interconnect. See the [standards tracker](../ai/ai-standards.md).
- **YANG models.** Base SRv6, IS-IS SRv6, OSPF SRv6 and PCEP SRv6 YANG models are all adopted, so vendor-neutral automation of SRv6 is getting closer.
- **MPLS coexistence.** [draft-ietf-spring-srv6-mpls-interworking](https://datatracker.ietf.org/doc/draft-ietf-spring-srv6-mpls-interworking/), plus individual drafts on BGP transport interworking and dual MPLS/SRv6 service advertisement, address the long migration most operators face. See [Migration](../topics/interworking-migration.md).
- **Open source.** The Linux RFC 9433 mobile user plane series is still under review, and SONiC's SRv6 control plane remains static configuration. Either changing would widen the open-source column of the support matrix.

## Methodology

- **RFCs.** The [IETF Datatracker API](https://datatracker.ietf.org/api/v1/) was queried for RFCs whose title or abstract contains "SRv6", "Segment Routing over IPv6", "Segment Routing over the IPv6", "IPv6 Segment Routing" or "Segment Routing Header". Publication dates and status come from the RFC Editor's metadata for each RFC. The rule is mechanical: it includes RFCs that cover SRv6 as one of several data planes (for example [RFC 9350](../rfcs/rfc9350.md), Flex-Algo) and leaves out SR RFCs that do not name SRv6 in the abstract.
- **Drafts.** Same text rule, applied to drafts in the Datatracker state "Active" in seven working groups. Working-group drafts are those named `draft-ietf-<wg>-…`. Individual drafts are those named `draft-<author>-<wg>-…`. Drafts aimed at other groups, such as `ippm` or `opsawg`, are not counted. Stages come from the Datatracker states.
- **Deployments.** Organizations listed in [Real-World Deployments](../use-cases/deployments.md) and [SRv6 for AI](../ai/index.md#who-uses-srv6-for-ai) whose source is the organization itself, a talk by it, or an IETF document naming it. Trials and vendor product listings are not counted. Region is the organization's headquarters.
- **Implementations.** Counts come from the [support matrix](../implementations/support-matrix.md) data file, verified 20 October 2026. "Partial" is the matrix's own rating. Unknown cells count as not supported.
- **Reproduce it.** `python tools/state-of-srv6/fetch_ietf.py` refreshes the IETF snapshot and `python tools/state-of-srv6/build.py --og` redraws the charts and the share image. The data files are [in the repository](https://github.com/eldaninavas/srv6.md/tree/main/tools/state-of-srv6).

Corrections are welcome as a [GitHub issue](https://github.com/eldaninavas/srv6.md/issues) or pull request.

## How to cite this report

> Navas, D. (2026). *State of SRv6 2026*. SRv6.md. https://srv6.md/reports/state-of-srv6-2026/ (data as of 20 October 2026).

```bibtex
@misc{srv6md2026state,
  author       = {Navas, Daniel},
  title        = {State of {SRv6} 2026},
  year         = {2026},
  howpublished = {SRv6.md},
  url          = {https://srv6.md/reports/state-of-srv6-2026/},
  note         = {Data as of 20 October 2026}
}
```

**Reusing the charts and data.** SRv6.md is published under the [MIT License](https://github.com/eldaninavas/srv6.md/blob/main/LICENSE). You may copy the charts, tables and numbers into articles, slides and posts, including commercial ones. Please credit "SRv6.md, State of SRv6 2026" with a link to this page. The share image is at [`/assets/images/state-of-srv6-2026.png`](../assets/images/state-of-srv6-2026.png).

## Frequently Asked Questions

### How many SRv6 RFCs are there?

As of 20 October 2026, 23 RFCs name SRv6 in their title or abstract. The first was RFC 8754 (the Segment Routing Header, March 2020) and the latest is RFC 10038 (August 2026). Several general Segment Routing RFCs, such as RFC 8402 and RFC 9256, also apply to SRv6 but are not in that count.

### Who uses SRv6 in production?

Publicly documented users include telecom operators such as China Mobile, SoftBank, Rakuten Mobile, Reliance Jio, Swisscom, Bell Canada and Telefonica VIVO, and cloud and AI companies such as Microsoft, OpenAI, Oracle, Meta, Alibaba Cloud and Nebius. This report counts 18 organizations.

### Which vendors support SRv6 uSID?

Cisco IOS-XR and IOS-XE, Juniper Junos, Arista EOS, Nokia SR OS, FRRouting, the Linux kernel and FD.io VPP document uSID (NEXT-C-SID) support. Huawei VRP and SONiC support it partially. See the [support matrix](../implementations/support-matrix.md) for releases and sources.
