---
title: Topics
description: Complete SRv6 topic index — from basics to advanced operations
tags:
  - topics
---

# :material-book-open-variant: SRv6 Topics

Whether you're a network engineer new to SRv6 or looking to solidify your understanding, start here. Topics are organized from foundational concepts through architecture, services, operations, and platform-specific guides.

## Foundations

The core concepts you need before diving deeper.

| Topic | Description |
|-------|-------------|
| [What is SRv6?](what-is-srv6.md) | High-level overview and motivation |
| [SID Structure](sid-structure.md) | Understanding the 128-bit SRv6 SID |
| [Network Programming](network-programming.md) | SRv6 behaviors and functions |
| [SRH Mechanics & Packet Walk](srh-packet-walk.md) | Step-by-step packet processing through the SRH |
| [SRv6 vs SR-MPLS](srv6-vs-sr-mpls.md) | Comparing the two SR approaches |

## Architecture

How SRv6 networks are designed and built.

| Topic | Description |
|-------|-------------|
| [uSID / SRv6 Compression](usid-compression.md) | Micro-SID for efficient header encoding (RFC 9800) |
| [Flex-Algorithm](flex-algorithm.md) | Constraint-based path computation and network slicing |
| [BGP Overlay Services](bgp-overlay-services.md) | EVPN and L3VPN over SRv6 with BGP (RFC 9252) |
| [TI-LFA](ti-lfa.md) | Sub-50ms fast reroute with topology-independent protection |
| [CLOS Fabrics & Load Balancing](clos-glb.md) | SRv6 in data center CLOS topologies, GLB, and flowlets |

## Services

The services SRv6 delivers on top of the architecture.

| Topic | Description |
|-------|-------------|
| [EVPN Multihoming](evpn-multihoming.md) | All-Active multihoming for L3VPN using EVPN signaling |
| [QoS & Traffic Classification](qos.md) | DSCP, Traffic Class, Flex-Algo constraints, and network slicing |
| [Multicast & Broadcast](multicast.md) | Replication segments, Tree-SID, BIER, and EVPN BUM handling |

## Operations

Running, securing, and monitoring SRv6 in production.

| Topic | Description |
|-------|-------------|
| [Security](security.md) | HMAC, infrastructure ACLs, attack vectors, and best practices |
| [OAM & Troubleshooting](oam-troubleshooting.md) | SRv6 ping, traceroute, IOAM, path tracing, and debugging |
| [Telemetry & Monitoring](telemetry.md) | IPFIX, YANG models, streaming telemetry, alerting |
| [Performance & Scaling](performance-scaling.md) | MTU impact, encapsulation overhead, hardware forwarding, FIB scale |
| [Interworking & Migration](interworking-migration.md) | SR-MPLS ↔ SRv6 gateways, brownfield coexistence |

## Platforms

Where SRv6 runs — open-source and programmable platforms.

| Topic | Description |
|-------|-------------|
| [SONiC & SAI](sonic-sai.md) | Open-source NOS with hardware-abstracted SRv6 |
| [Host-Based SRv6 & Open Source](host-based-srv6.md) | SRv6 on Linux kernel, eBPF, VPP, and the open-source ecosystem |

## Prerequisites

To get the most from this section, you should be familiar with:

- [x] IPv6 addressing and headers
- [x] Basic routing concepts (IGP, BGP)
- [x] General understanding of MPLS (helpful, not required)

!!! note "Contribute"
    See something missing? Every page has an :material-pencil: edit button in the top right.
