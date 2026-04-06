---
title: SID Structure
description: Understanding the 128-bit SRv6 Segment Identifier
tags:
  - fundamentals
  - sid
---

# SID Structure

An SRv6 **Segment Identifier (SID)** is a 128-bit value, formatted as a standard IPv6 address. It encodes both the location of a node and the behavior to be executed.

## Anatomy of an SRv6 SID

```
|<------------ 128 bits ------------->|
|  Locator      | Function | Arguments|
|<-- L bits --->|<-F bits->|<-A bits->|
```

| Field | Description | Typical Size |
|-------|-------------|:------------:|
| **Locator** | Routable prefix identifying the node | 40-64 bits |
| **Function** | Identifies the local behavior (End, End.DT4, etc.) | 16-24 bits |
| **Arguments** | Optional parameters for the function | 0-48 bits |

## Example

```
SID:  fc00:0:1::100

Breakdown:
  Locator:  fc00:0:1::/48   (identifies the node)
  Function: ::100            (End.DT4 - decap and lookup in IPv4 table)
  Args:     (none)
```

!!! tip "Locator as an IGP route"
    The locator block is advertised as a regular IPv6 route in the IGP (IS-IS or OSPFv3). This ensures reachability to any SRv6-capable node in the network.

## SID Block

Organizations typically allocate a **SID block** prefix (e.g., `fc00::/24`) for all SRv6 SIDs in their network. This simplifies:

- ACL and policy management
- Traffic classification
- Security filtering

## Further Reading

- :material-arrow-right: [Network Programming](network-programming.md) - How SIDs map to behaviors
- :material-arrow-right: [What is SRv6?](what-is-srv6.md) - Back to overview
