---
title: SRv6 vs SR-MPLS
description: Comparing Segment Routing over IPv6 with SR-MPLS
tags:
  - fundamentals
  - comparison
  - mpls
---

# SRv6 vs SR-MPLS

Both SRv6 and SR-MPLS implement Segment Routing, but they use different data planes. Here's a practical comparison.

## Comparison Table

| Aspect | SR-MPLS | SRv6 |
|--------|---------|------|
| **Data Plane** | MPLS | IPv6 |
| **Segment ID** | 20-bit label | 128-bit IPv6 address |
| **SID Space** | ~1M labels | Virtually unlimited |
| **Encapsulation** | MPLS label stack | SRv6 SRH (IPv6 ext. header) |
| **Network Programming** | Limited | Rich (End, End.X, End.DT4...) |
| **MTU Impact** | 4 bytes per label | 40B IPv6 + 8B + 16B per SID |
| **Existing Infra** | Requires MPLS forwarding | Uses native IPv6 |
| **Signaling** | None (same as SRv6) | None |
| **Maturity** | Widely deployed | Growing rapidly |

## When to Choose What

!!! tip "Choose SR-MPLS when..."
    - You have existing MPLS infrastructure
    - MTU overhead is a concern
    - Your use case is primarily TE or VPN

!!! tip "Choose SRv6 when..."
    - Building a new IPv6-native network
    - You need advanced network programmability
    - Simplification and future-proofing are priorities
    - You want to eliminate MPLS entirely

## Further Reading

- :material-arrow-right: [What is SRv6?](what-is-srv6.md)
- :material-arrow-right: [Use Cases](../use-cases/index.md)

## References

1. [RFC 8402 - Segment Routing Architecture](https://www.rfc-editor.org/rfc/rfc8402) - Defines the SR architecture covering both MPLS and IPv6 data planes
2. [RFC 8660 - Segment Routing with the MPLS Data Plane](https://datatracker.ietf.org/doc/html/rfc8660) - Specifies SR-MPLS forwarding behavior and MPLS label-based segment encoding
3. [Cisco Segment Routing Overview and Migration Guidelines](https://www.cisco.com/c/en/us/support/docs/multiprotocol-label-switching-mpls/mpls/215215-segment-routing-overview-and-migration-g.html) - Practical overview of SR deployment and migration from traditional MPLS
