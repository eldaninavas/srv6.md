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
