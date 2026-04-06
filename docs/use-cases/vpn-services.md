---
title: VPN Services
description: L3VPN and L2VPN services with SRv6
tags:
  - use-cases
  - vpn
  - l3vpn
---

# VPN Services with SRv6

SRv6 provides a native mechanism to deliver L3VPN and L2VPN services without MPLS, using SRv6 SIDs as service identifiers.

## SRv6-based L3VPN

SRv6 L3VPN uses `End.DT4` / `End.DT6` behaviors to decapsulate traffic and perform a lookup in the appropriate VRF table.

### How It Works

1. PE router receives customer IPv4/IPv6 traffic
2. Encapsulates with outer IPv6 header + SRH
3. Sets destination to the remote PE's VPN SID (`End.DT4`)
4. Remote PE decapsulates and forwards to the correct VRF

!!! example "BGP VPNv4 with SRv6"
    ```
    BGP Update:
      Prefix: 10.0.0.0/24
      Next-Hop: 2001:db8::2
      SRv6 SID: fc00:0:2::DT4  (End.DT4 behavior)
      VRF: CUSTOMER-A
    ```

## Comparison with MPLS VPN

| Aspect | MPLS L3VPN | SRv6 L3VPN |
|--------|-----------|-------------|
| Label signaling | MP-BGP + LDP/RSVP | MP-BGP only |
| Service identifier | VPN label | SRv6 SID (End.DT4/DT6) |
| Transport | MPLS LSP | IPv6 native |
| Complexity | Higher (multiple protocols) | Lower (IPv6 + BGP) |

## Further Reading

- :material-arrow-right: [Traffic Engineering](traffic-engineering.md)
- :material-file-document: [RFC 9252](../rfcs/rfc9252.md) - BGP Overlay Services Based on SRv6
