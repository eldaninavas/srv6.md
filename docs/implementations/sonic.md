---
title: SONiC
description: SRv6 support in SONiC network operating system
tags:
  - implementations
  - sonic
  - open-source
---

# SRv6 on SONiC

SONiC (Software for Open Networking in the Cloud) is actively developing SRv6 support for data center and WAN use cases.

## Current Status

!!! warning "Work in Progress"
    SRv6 support in SONiC is under active development. Check the SONiC GitHub for the latest status.

## Architecture

SONiC's SRv6 implementation leverages:

- **Linux kernel** SRv6 data plane
- **FRRouting** for control plane (IS-IS, BGP)
- **SAI (Switch Abstraction Interface)** for hardware offload

## Further Reading

- :material-arrow-right: [Linux Kernel](linux-kernel.md) - Underlying SRv6 data plane
- :fontawesome-brands-github: [SONiC SRv6 HLD](https://github.com/sonic-net/SONiC/blob/master/doc/srv6/)

## References

1. [SONiC SRv6 High Level Design Document](https://github.com/sonic-net/SONiC/blob/master/doc/srv6/srv6_hld.md) - Official SRv6 HLD covering architecture and feature design in SONiC
2. [SONiC SRv6 VPN HLD](https://github.com/sonic-net/SONiC/blob/master/doc/srv6/srv6_vpn.md) - Design document for SRv6 VPN services in SONiC
3. [SONiC SRv6 uSID HLD](https://github.com/sonic-net/SONiC/blob/master/doc/srv6/SRv6_uSID.md) - Design document for SRv6 micro-SID support in SONiC
4. [SONiC Foundation](https://sonicfoundation.dev/) - Official SONiC Foundation site with blog, community resources, and roadmap
5. [SONiC Roadmap Planning - GitHub Wiki](https://github.com/sonic-net/SONiC/wiki/Sonic-Roadmap-Planning) - Release planning and feature tracking for SONiC including SRv6 milestones
