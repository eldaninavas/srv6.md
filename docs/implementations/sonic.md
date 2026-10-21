---
title: SONiC
seo_title: "SRv6 on SONiC: Status and Architecture"
description: "SRv6 in the SONiC network OS: release-by-release status from 202111, uSID and static CONFIG_DB SIDs for AI fabrics, and the SAI/orchagent architecture with FRR."
tags:
  - implementations
  - sonic
  - open-source
---

# SRv6 on SONiC

SONiC (Software for Open Networking in the Cloud) has carried SRv6 code since the **202111** release. On a switch, SRv6 forwarding happens in the ASIC: SONiC programs it through orchagent (`srv6orch`) and the SAI SRv6 objects, so which behaviors actually forward depends on each vendor's SAI implementation.

## Current Status

| Release | SRv6 change | Source |
|---------|-------------|--------|
| 202111 | First orchagent SRv6: End, End.DT46, H.Encaps.Red | [Release notes](https://github.com/sonic-net/SONiC/blob/master/doc/release-notes/SONiC_202111_Release_Notes.md) |
| 202211 | uSID data plane: uN, uA | [Release notes](https://github.com/sonic-net/SONiC/blob/master/doc/release-notes/SONiC_202211_Release_Notes.md) |
| 202305 | Selectable SID-list type (encaps / encaps.red / insert) | [sonic-swss #2406](https://github.com/sonic-net/sonic-swss/pull/2406) |
| 202405 | Adjacency programming for End.X, uA, End.DX4/DX6 (L3Adj) | [Release notes](https://github.com/sonic-net/SONiC/blob/master/doc/release-notes/SONiC_202405_Release_Notes.md) |
| 202505 | Static SRv6 in CONFIG_DB (uN, uDT46), rated **Alpha** in the release notes; SRv6 VPN support in srv6orch | [Release notes](https://github.com/sonic-net/SONiC/blob/master/doc/release-notes/SONiC_202505_Release_Notes.md), [sonic-swss #3293](https://github.com/sonic-net/sonic-swss/pull/3293) |
| master (Aug 2026) | Static uA in CONFIG_DB | [sonic-buildimage #27903](https://github.com/sonic-net/sonic-buildimage/pull/27903) |

SAI defines End, End.X, End.T, End.DX4/DX6, End.DT4/DT6/DT46, End.B6.Encaps(.Red) and their uSID variants, but no L2 behaviors (End.DX2, End.DT2U/DT2M), so EVPN over SRv6 has no data plane in SONiC. See the [SRv6 Support Matrix](support-matrix.md) for the full list.

## Architecture

- **ASIC data plane via SAI** — `srv6orch` turns APP_DB entries into SAI `my_sid` and `sidlist` objects. The Linux kernel's seg6 data plane is not what forwards traffic on a SONiC switch.
- **FRRouting control plane** — `fpmsyncd` carries SRv6 routes from FRR's zebra into APP_DB. SONiC's FRR container runs bgpd, staticd and ospfd (OSPFv2) but **not isisd or ospf6d**, so SIDs come from BGP (L3VPN) or from static configuration, not from an IGP.
- **Static configuration** — since 202505, `SRV6_MY_LOCATORS` and `SRV6_MY_SIDS` in CONFIG_DB are translated by bgpcfgd into FRR static SIDs. This is the model used for AI back-end fabrics; see [SRv6 AI Fabric Design](../ai/ai-fabric-design.md).

## Further Reading

- :material-arrow-right: [SRv6 Support Matrix](support-matrix.md) - SONiC next to vendor and open-source SRv6 platforms
- :material-arrow-right: [SONiC & SAI](../topics/sonic-sai.md) - How SAI models SRv6 objects
- :material-arrow-right: [SRv6 AI Fabric Design](../ai/ai-fabric-design.md) - SONiC static SRv6 (CONFIG_DB) for AI backends, release by release
- :fontawesome-brands-github: [SONiC SRv6 HLD](https://github.com/sonic-net/SONiC/blob/master/doc/srv6/)

## References

1. [SONiC SRv6 High Level Design Document](https://github.com/sonic-net/SONiC/blob/master/doc/srv6/srv6_hld.md) - Official SRv6 HLD covering architecture and feature design in SONiC
2. [SONiC SRv6 VPN HLD](https://github.com/sonic-net/SONiC/blob/master/doc/srv6/srv6_vpn.md) - Design document for SRv6 VPN services in SONiC (targeted 202305; the code landed in 202505)
3. [SONiC SRv6 uSID HLD](https://github.com/sonic-net/SONiC/blob/master/doc/srv6/SRv6_uSID.md) - Design document for SRv6 micro-SID support in SONiC
4. [SONiC Foundation](https://sonicfoundation.dev/) - Official SONiC Foundation site with blog, community resources, and roadmap
5. [SONiC Roadmap Planning - GitHub Wiki](https://github.com/sonic-net/SONiC/wiki/Sonic-Roadmap-Planning) - Release planning and feature tracking for SONiC including SRv6 milestones
6. [SONiC SRv6 Static Configuration HLD](https://github.com/sonic-net/SONiC/blob/master/doc/srv6/srv6_static_config_hld.md) - CONFIG_DB locators and SIDs (202505+)
7. [SONiC SRv6 SID L3Adj HLD](https://github.com/sonic-net/SONiC/blob/master/doc/srv6/srv6_sid_l3adj.md) - Adjacency programming for End.X, uA and End.DX4/DX6
8. [SAI saisrv6.h](https://github.com/opencomputeproject/SAI/blob/master/inc/saisrv6.h) - The SRv6 behaviors and SID-list types SAI can express
