---
title: Fundamentals
description: Core concepts of Segment Routing over IPv6
tags:
  - fundamentals
  - beginner
---

# :material-book-open-variant: SRv6 Fundamentals

Welcome to the fundamentals section. Whether you're a network engineer new to SRv6 or looking to solidify your understanding, start here.

## Learning Path

### :material-numeric-1-circle: Start Here

| Topic | Description |
|-------|-------------|
| [What is SRv6?](what-is-srv6.md) | High-level overview and motivation |
| [SID Structure](sid-structure.md) | Understanding the 128-bit SRv6 SID |
| [Network Programming](network-programming.md) | SRv6 behaviors and functions |
| [SRv6 vs SR-MPLS](srv6-vs-sr-mpls.md) | Comparing the two SR approaches |

### :material-numeric-2-circle: Deep Dive

| Topic | Description |
|-------|-------------|
| [SRH Mechanics & Packet Walk](srh-packet-walk.md) | Step-by-step packet processing through the SRH |
| [uSID / SRv6 Compression](usid-compression.md) | Micro-SID for efficient header encoding (RFC 9800) |
| [Flex-Algorithm](flex-algorithm.md) | Constraint-based path computation and network slicing |

### :material-numeric-3-circle: Advanced Topics

| Topic | Description |
|-------|-------------|
| [BGP Overlay Services](bgp-overlay-services.md) | EVPN and L3VPN over SRv6 with BGP (RFC 9252) |
| [TI-LFA](ti-lfa.md) | Sub-50ms fast reroute with topology-independent protection |
| [CLOS Fabrics & Load Balancing](clos-glb.md) | SRv6 in data center CLOS topologies, GLB, and flowlets |
| [SONiC & SAI](sonic-sai.md) | Open-source NOS with hardware-abstracted SRv6 |
| [Host-Based SRv6 & Open Source](host-based-srv6.md) | SRv6 on Linux kernel, eBPF, VPP, and the open-source ecosystem |

## Prerequisites

To get the most from this section, you should be familiar with:

- [x] IPv6 addressing and headers
- [x] Basic routing concepts (IGP, BGP)
- [x] General understanding of MPLS (helpful, not required)

!!! note "Contribute"
    See something missing? Every page has an :material-pencil: edit button in the top right.
