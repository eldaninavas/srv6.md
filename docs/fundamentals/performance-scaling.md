---
title: Performance & Scaling
description: MTU impact, hardware support, overhead analysis, and scaling considerations for SRv6
tags:
  - fundamentals
  - performance
  - mtu
  - scaling
  - hardware
---

# Performance & Scaling

Understanding the performance characteristics of SRv6 is essential for capacity planning and architecture decisions. This page covers MTU impact, encapsulation overhead, hardware forwarding, and scaling limits.

## Encapsulation Overhead

### Overhead Comparison

Every encapsulation adds bytes. Here's how SRv6 compares:

| Encapsulation | Overhead | Notes |
|---------------|:--------:|-------|
| **MPLS (1 label)** | 4 bytes | Minimum MPLS encapsulation |
| **MPLS (3 labels)** | 12 bytes | Typical L3VPN with TE |
| **MPLS (6 labels)** | 24 bytes | Deep label stack for TE |
| **VXLAN** | 50 bytes | UDP + VXLAN + Outer Ethernet |
| **SRv6 uSID (no SRH)** | 40 bytes | Just outer IPv6 header, up to 6 hops encoded in DA |
| **SRv6 (1 SID in SRH)** | 64 bytes | IPv6 (40) + SRH base (8) + 1 SID (16) |
| **SRv6 (3 SIDs in SRH)** | 96 bytes | IPv6 (40) + SRH base (8) + 3 SIDs (48) |
| **SRv6 uSID (2 containers)** | 72 bytes | IPv6 (40) + SRH (8) + 1 extra container (16) + DA container; up to 12 hops |
| **GRE** | 24 bytes | IP (20) + GRE (4) |
| **IPsec (tunnel)** | 73+ bytes | IP (20) + ESP (8+) + IV + Pad + Auth |

### Key Insight: uSID Changes the Equation

Without uSID, SRv6 has significantly more overhead than MPLS. With uSID:

| Scenario | MPLS | SRv6 uSID | Winner |
|----------|:----:|:----------:|:------:|
| 3 hops | 12 bytes (3 labels) | 40 bytes (DA only) | MPLS |
| 6 hops | 24 bytes (6 labels) | 40 bytes (DA only) | MPLS slightly |
| 7+ hops | 28+ bytes | 72 bytes (2 containers) | MPLS |
| Network programming (TE + VPN) | 12-24 bytes | 40 bytes | Comparable |

MPLS wins on raw overhead, but SRv6 provides programmability, native IPv6, and no signaling protocols — the overhead tradeoff is the cost of those capabilities.

## MTU Impact

### The Math

For a typical network with **1500-byte MTU** on customer-facing interfaces:

```
Inner packet:           1500 bytes (customer MTU)
SRv6 uSID (no SRH):  + 40 bytes  = 1540 bytes minimum
SRv6 (3 SIDs):        + 96 bytes  = 1596 bytes
```

### Recommended MTU Settings

| Interface | Recommended MTU | Rationale |
|-----------|:---------------:|-----------|
| **Core/fabric links** | 9100+ bytes | Accommodate any SRv6 encapsulation without fragmentation |
| **PE-CE (customer)** | 1500 bytes | Standard customer MTU |
| **DC fabric (leaf-spine)** | 9216 bytes | Standard jumbo frame for DC |
| **WAN links** | 9100+ bytes or adjust per-link | May need path MTU discovery |

### What Happens If MTU Is Too Small?

1. Encapsulated SRv6 packet exceeds link MTU
2. **IPv6 does not fragment in transit** — the router drops the packet
3. Router sends ICMPv6 "Packet Too Big" to the source
4. Source must reduce packet size (Path MTU Discovery)

!!! warning "Don't rely on fragmentation"
    IPv6 intermediate nodes **cannot fragment** packets. Only the source can fragment. If your core links don't support the encapsulated packet size, traffic will be silently dropped until PMTUD kicks in.

## Hardware Forwarding

SRv6 forwarding is performed in hardware on modern ASICs. The key operations:

| Operation | Hardware Support |
|-----------|:----------------:|
| SRH insertion (encap) | Line rate on modern ASICs |
| SRH removal (decap) | Line rate on modern ASICs |
| SID lookup (My SID table) | TCAM-based, line rate |
| Segments Left update + DA copy | Line rate |
| uSID shift operation | Line rate (single-cycle) |
| HMAC computation | May require recirculation on some ASICs |

### ASIC Capabilities

Different ASIC generations have different SRv6 capabilities:

| Capability | Description |
|------------|-------------|
| **Max SIDs in SRH** | How many segments can be pushed at encap (typically 6-13) |
| **Max uSIDs per container** | Usually 6 (16-bit uSIDs) |
| **My SID table size** | Number of local SIDs supported (hundreds to thousands) |
| **SRH insertion at line rate** | Whether encap/decap happens without recirculation |
| **IOAM support** | Whether the ASIC can insert/read IOAM TLVs |

## Scaling Considerations

### SID Space

| Dimension | Scale |
|-----------|:-----:|
| SRv6 SID space | 128 bits = 3.4 × 10³⁸ unique SIDs (practically unlimited) |
| uSID block | 32 bits = ~4 billion unique blocks |
| uSID per block | 16 bits = 65,536 unique micro-SIDs per block |
| Realistic per-node | 10-100 SIDs per node (locator + functions) |

### FIB/RIB Scale

SRv6 locators are IPv6 routes in the IGP. The scaling impact:

| Network Size | Additional IPv6 Routes (locators) | Impact |
|:------------:|:---------------------------------:|--------|
| 100 nodes | ~100-300 routes | Negligible |
| 1,000 nodes | ~1,000-3,000 routes | Minimal |
| 10,000 nodes | ~10,000-30,000 routes | Moderate — within modern IGP capacity |

Each node advertises 1-3 locators (default algo + Flex-Algo). This is well within IS-IS and OSPFv3 scaling limits.

### BGP VPN Scale

SRv6 VPN SIDs are signaled via BGP like MPLS VPN labels. The scale characteristics are the same:

- **Per-VRF SID allocation**: 1 SID per VRF per PE → most scalable
- **Per-CE SID allocation**: 1 SID per CE → moderate scale
- **Per-prefix SID allocation**: 1 SID per prefix → highest granularity but highest scale impact

### Control Plane Convergence

SRv6 convergence is comparable to SR-MPLS:

| Event | Convergence Time |
|-------|:----------------:|
| Link failure (with TI-LFA) | < 50 ms |
| Node failure (with TI-LFA) | < 50 ms |
| IGP convergence | 200 ms - 2 s (same as any IGP) |
| BGP VPN convergence | Seconds (same as MPLS VPN) |

## Further Reading

- :material-arrow-right: [uSID / SRv6 Compression](usid-compression.md) - How uSID reduces overhead
- :material-arrow-right: [Interworking & Migration](interworking-migration.md) - MTU during migration
- :material-arrow-right: [TI-LFA](ti-lfa.md) - Fast convergence with SRv6
- :material-arrow-right: [SRv6 vs SR-MPLS](srv6-vs-sr-mpls.md) - Overhead comparison

## References

1. [RFC 8986 - SRv6 Network Programming](https://datatracker.ietf.org/doc/rfc8986/) - Defines SRv6 encapsulation behaviors and overhead
2. [RFC 9800 - Compressed SRv6 Segment List Encoding](https://datatracker.ietf.org/doc/rfc9800/) - uSID compression reducing overhead by up to 83%
3. [RFC 8754 - IPv6 Segment Routing Header](https://datatracker.ietf.org/doc/rfc8754/) - SRH format and size calculations
