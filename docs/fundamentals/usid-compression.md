---
title: uSID / SRv6 Compression
description: Micro-SID (uSID) and SRv6 header compression for efficient forwarding
tags:
  - fundamentals
  - usid
  - compression
  - rfc9800
---

# uSID / SRv6 Compression

One of the early criticisms of SRv6 was **overhead** — each SID is 128 bits (16 bytes), and a segment list of 5 SIDs adds 80 bytes to every packet. **Micro-SID (uSID)** solves this by packing multiple segment instructions into a single 128-bit SID.

## The Problem

With classic SRv6, each hop in the segment list costs 16 bytes:

```
Classic SRv6 (5 SIDs = 80 bytes overhead):
┌──────────────────────────────────────────────┐
│ SRH: Segment List                             │
│   [0]: fc00:0:5::1  (16 bytes)               │
│   [1]: fc00:0:4::1  (16 bytes)               │
│   [2]: fc00:0:3::1  (16 bytes)               │
│   [3]: fc00:0:2::1  (16 bytes)               │
│   [4]: fc00:0:1::1  (16 bytes)               │
│                          Total: 80 bytes      │
└──────────────────────────────────────────────┘
```

For short packets or latency-sensitive traffic, this overhead is significant.

## The Solution: Micro-SID (uSID)

uSID (RFC 9800) packs **up to 6 micro-instructions** into a single 128-bit container:

```
uSID Container (6 micro-SIDs = 16 bytes total!):
┌──────────────────────────────────────────────┐
│ Single 128-bit IPv6 Address:                  │
│                                               │
│  fcbb:bbbb:0001:0002:0003:0004:0005:0006    │
│  ├──┬────┤├──┤├──┤├──┤├──┤├──┤├──┤          │
│  │ Block ││uS1││uS2││uS3││uS4││uS5││uS6│   │
│  │(32bit)││16b││16b││16b││16b││16b││16b│     │
│                          Total: 16 bytes!     │
└──────────────────────────────────────────────┘
```

### Structure

| Component | Size | Description |
|-----------|:----:|-------------|
| **uSID Block** | 32 bits | Common prefix for all uSIDs in the domain (e.g., `fcbb:bbbb`) |
| **uSID** | 16 bits each | Individual micro-instruction identifying a node + behavior |
| **End-of-Container** | 16 bits (0000) | Marks the end of active uSIDs in the container |

### How It Works

Processing a uSID container is a simple **shift-and-lookup** operation:

```
Step 1 - Ingress receives:
  DA = fcbb:bbbb:0001:0002:0003:0000:0000:0000
                  ^^^^
                  Active uSID → Node 1

Step 2 - Node 1 processes uSID 0001, shifts left:
  DA = fcbb:bbbb:0002:0003:0000:0000:0000:0000
                  ^^^^
                  Active uSID → Node 2

Step 3 - Node 2 processes uSID 0002, shifts left:
  DA = fcbb:bbbb:0003:0000:0000:0000:0000:0000
                  ^^^^
                  Active uSID → Node 3

Step 4 - Node 3 processes uSID 0003, shifts left:
  DA = fcbb:bbbb:0000:0000:0000:0000:0000:0000
                  ^^^^
                  End-of-Container (0000) → Move to next SRH entry
```

## Overhead Comparison

| Scenario | Classic SRv6 | uSID | Savings |
|----------|:------------:|:----:|:-------:|
| 3 SIDs | 48 bytes | 16 bytes | **67%** |
| 6 SIDs | 96 bytes | 16 bytes | **83%** |
| 10 SIDs | 160 bytes | 32 bytes (2 containers) | **80%** |
| 12 SIDs | 192 bytes | 32 bytes (2 containers) | **83%** |

!!! tip "6 hops in 16 bytes"
    A single uSID container can encode **up to 6 segment instructions** in the same space that classic SRv6 uses for just **1 SID**. This makes SRv6 competitive with or better than MPLS label stacks in terms of overhead.

## uSID vs G-SRv6

Two compression approaches emerged and are now unified under **RFC 9800**:

| Aspect | uSID (NEXT-C-SID) | G-SRv6 (Replace-C-SID) |
|--------|:------------------:|:----------------------:|
| **Origin** | Cisco, Bell Canada | China Mobile, Huawei |
| **Processing** | Shift-and-lookup | Replace-and-lookup |
| **uSID size** | 16 or 32 bits | 16 or 32 bits |
| **RFC** | RFC 9800 | RFC 9800 |
| **Deployments** | Rakuten, SoftBank, Bell, Swisscom, Iliad, VIVO | China Mobile, China Unicom, MTN |

Both are now standardized in **RFC 9800** (SRv6 SID Compression), ensuring interoperability.

## Configuration Examples

=== "Cisco IOS-XR"

    ```cisco
    segment-routing
     srv6
      locators
       locator uSID-MAIN
        micro-segment behavior unode psp-usd
        prefix fcbb:bb01::/48
       !
      !
     !
    !
    ```

=== "Linux (iproute2)"

    ```bash
    # Encapsulate with uSID container
    ip route add 10.0.0.0/24 encap seg6 mode encap \
      segs fcbb:bbbb:0001:0002:0003:: dev eth0
    ```

## Real-World Impact

uSID has been validated at massive scale:

- **Bell Canada:** 26 uSIDs pushed at line rate on NCS 5700
- **Rakuten Mobile:** World's largest uSID IP transport migration
- **Swisscom:** Consolidated 5 MPLS networks into 1 SRv6 uSID network
- **40+ vendors** support RFC 9800 commercially as of 2025

## Further Reading

- :material-arrow-right: [SRH Mechanics & Packet Walk](srh-packet-walk.md) - How the SRH is processed
- :material-arrow-right: [SID Structure](sid-structure.md) - Classic SID format
- :material-arrow-right: [Real-World Deployments](../use-cases/deployments.md) - Who's running uSID
- :material-file-document: [RFC 8754](../rfcs/rfc8754.md) - SRH specification
