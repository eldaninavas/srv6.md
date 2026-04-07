---
title: What is SRv6? - Segment Routing over IPv6 Explained
description: Learn what SRv6 is, how Segment Routing over IPv6 works, its key concepts (SID, SRH, network programming), benefits over MPLS, and real-world use cases.
tags:
  - topics
  - beginner
  - srv6
  - what is srv6
  - srv6 explained
  - segment routing ipv6
---

# What is SRv6?

**Segment Routing over IPv6 (SRv6)** is a network architecture that leverages the IPv6 data plane to implement source routing and network programming capabilities.

## Overview

SRv6 encodes a list of instructions (called **segments**) in the IPv6 packet header. Each segment is a 128-bit IPv6 address that represents a specific network instruction or behavior.

```mermaid
%%{init: {"theme": "base", "themeVariables": {"primaryTextColor": "#fff", "lineColor": "#ce93d8", "textColor": "#fff"}}}%%
graph LR
    A[Source] -->|SRv6 Path| B[Node 1]
    B -->|Segment List| C[Node 2]
    C -->|End.DT4| D[Destination]
    style A fill:#7b1fa2,color:#fff,stroke:#ab47bc
    style B fill:#4a148c,color:#fff,stroke:#ab47bc
    style C fill:#4a148c,color:#fff,stroke:#ab47bc
    style D fill:#7b1fa2,color:#fff,stroke:#ab47bc
```

## Key Concepts

### Segments
A **segment** is an IPv6 address that encodes:

- **Locator**: Identifies the node in the network
- **Function**: Specifies the behavior to apply
- **Arguments**: Optional parameters for the function

### Segment Routing Header (SRH)
The SRH is an IPv6 extension header (routing header type 4) that carries the ordered list of segments.

```
 0                   1                   2                   3
 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|  Next Header  |  Hdr Ext Len  | Routing Type  | Segments Left |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|  Last Entry   |    Flags      |              Tag              |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|                                                               |
|            Segment List[0] (128-bit IPv6 address)             |
|                                                               |
|                                                               |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|                                                               |
|            Segment List[1] (128-bit IPv6 address)             |
|                                                               |
|                                                               |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|                            ...                                |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
```

### Source Routing

In SRv6, the **source node** (ingress) determines the entire path through the network by populating the segment list. Intermediate nodes simply process the active segment and forward the packet.

## Benefits

| Feature | Description |
|---------|-------------|
| :material-ip-network: **Native IPv6** | No overlay protocol needed, uses IPv6 natively |
| :material-code-tags: **Programmability** | Network behaviors defined via SRv6 functions |
| :material-cog: **Simplification** | Eliminates MPLS signaling protocols (LDP, RSVP) |
| :material-chart-line: **Scalability** | 128-bit SID space supports massive networks |
| :material-shield-check: **Security** | HMAC TLV support in SRH for authentication |

## How It Works (Simplified)

1. **Ingress node** receives a packet and determines the SRv6 policy
2. Encapsulates the packet with an outer IPv6 header + SRH
3. Segment List is populated with the desired path
4. **Transit nodes** forward based on the IPv6 destination address
5. **Endpoint nodes** process the active SID and execute the associated behavior
6. **Egress node** decapsulates and delivers the original packet

!!! example "Simple SRv6 Packet Flow"
    ```
    Original:  [IPv4: 10.0.0.1 -> 10.0.0.2][Payload]

    SRv6:      [IPv6: A::1 -> C::100]             <- Outer IPv6
               [SRH: SL=1, [C::100, B::100]]       <- Segment List
               [IPv4: 10.0.0.1 -> 10.0.0.2]        <- Original Packet
               [Payload]
    ```

## SRv6 vs MPLS

SRv6 fundamentally changes how networks are programmed compared to traditional MPLS. While MPLS uses 20-bit labels with signaling protocols (LDP, RSVP-TE), SRv6 uses 128-bit IPv6 addresses as segment identifiers, enabling a programmable network fabric without overlay complexity. See the detailed comparison in [Interworking & Migration](interworking-migration.md).

## Further Reading

- :material-arrow-right: [SID Structure](sid-structure.md) — Deep dive into the 128-bit SRv6 SID format (Locator, Function, Arguments)
- :material-arrow-right: [Network Programming](network-programming.md) — SRv6 behaviors and functions (End, End.DT4, End.DX6, etc.)
- :material-arrow-right: [Traffic Engineering](../use-cases/traffic-engineering.md) — How SRv6 enables flexible traffic engineering
- :material-arrow-right: [SRv6 on Linux](../implementations/linux-kernel.md) — Get hands-on with SRv6 on the Linux kernel
- :material-arrow-right: [Build an SRv6 Lab](../labs/index.md) — Hands-on SRv6 labs with Containerlab and GNS3
- :material-file-document: [RFC 8986](../rfcs/rfc8986.md) — SRv6 Network Programming specification

## References

1. [RFC 8402 - Segment Routing Architecture](https://www.rfc-editor.org/rfc/rfc8402) - Defines the Segment Routing architecture, including both MPLS and IPv6 data plane instantiations
2. [RFC 8754 - IPv6 Segment Routing Header (SRH)](https://www.rfc-editor.org/rfc/rfc8754.html) - Specifies the Segment Routing Header used in the IPv6 data plane
3. [RFC 8986 - SRv6 Network Programming](https://datatracker.ietf.org/doc/rfc8986/) - Defines the SRv6 Network Programming framework and base set of SRv6 endpoint behaviors
4. [What is SRv6 network programming? - APNIC Blog](https://blog.apnic.net/2020/05/01/what-is-srv6-network-programming/) - Accessible introduction to SRv6 network programming concepts
