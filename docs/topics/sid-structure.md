---
title: SID Structure
description: Understand the SRv6 SID structure. Learn how the 128-bit Segment Identifier encodes locator, function, and arguments, and how the IANA-allocated 5f00::/16 block from RFC 9602 fits in.
tags:
  - topics
  - sid
  - SRv6
  - SRv6 SID structure
  - 128-bit SID
  - RFC 9602
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
SID:  5f00:0:1::100

Breakdown:
  Locator:  5f00:0:1::/48   (identifies the node)
  Function: ::100            (End.DT4 - decap and lookup in IPv4 table)
  Args:     (none)
```

!!! info "Locator as an IGP route"
    The locator block is advertised as a regular IPv6 route in the IGP (IS-IS or OSPFv3). This ensures reachability to any SRv6-capable node in the network.

## IANA-Allocated SRv6 SID Block (`5f00::/16`)

[RFC 9602](https://datatracker.ietf.org/doc/rfc9602/) (October 2024) allocates a dedicated IPv6 prefix for SRv6 Segment Identifiers. IANA assigned the block from the IPv6 Unicast Address Registry and recorded it in the [IPv6 Special-Purpose Address Registry](https://www.iana.org/assignments/iana-ipv6-special-registry/iana-ipv6-special-registry.xhtml).

| Property | Value |
|----------|-------|
| Address Block | `5f00::/16` |
| Name | Segment Routing (SRv6) SIDs |
| RFC | [RFC 9602](https://datatracker.ietf.org/doc/rfc9602/) |
| Allocation Date | 2024-04 |
| Source | True |
| Destination | True |
| Forwardable | True |
| Globally Reachable | False |
| Reserved-by-Protocol | False |

The `5f00::/16` block is **forwardable within SR domains** but is explicitly marked as **not globally reachable**: packets carrying these addresses as destination should not transit the public Internet.

A typical allocation hierarchy within this block:

```
5f00::/16                          <- IANA SRv6 SID block
  5f00:<domain>::/32               <- Operator / SR domain
    5f00:<domain>:<node>::/48      <- Node locator
      5f00:<domain>:<node>:<func>::/64  <- SID (locator + function)
```

### Using Operator GUA Prefixes vs `5f00::/16`

RFC 9602 does not mandate `5f00::/16`. Operators can continue using their own globally unique address (GUA) prefixes as SRv6 locators. Both approaches are valid:

| Approach | Prefix Source | Pros | Cons |
|----------|---------------|------|------|
| IANA SRv6 block | `5f00::/16` | Instantly recognizable in captures and ACLs; easy filtering; no GUA consumption | Not globally routable; requires explicit IGP/BGP advertisement within the SR domain |
| Operator GUA | Provider /32 or /48 | Already routable in the operator's network; dual-use as IPv6 reachability | Consumes GUA space; harder to distinguish SRv6 traffic from regular IPv6 |

Most early SRv6 deployments (China Mobile, SoftBank, and others) use operator-assigned GUA prefixes. RFC 9602 provides a complementary option, especially useful for greenfield deployments and inter-domain SRv6 where a common recognizable prefix simplifies filtering.

### Filtering `5f00::/16` at Domain Boundaries

Whether you use `5f00::/16` or your own GUA, you must prevent SRv6 SIDs from leaking outside the SR domain.

=== "Cisco IOS-XR"

    ```cisco
    prefix-set DENY-SRV6
      5f00::/16 le 128
    end-set

    route-policy EBGP-IN
      if destination in DENY-SRV6 then
        drop
      endif
    end-policy
    ```

=== "Juniper Junos"

    ```junos
    policy-options {
        prefix-list SRV6-SID-SPACE {
            5f00::/16;
        }
        policy-statement REJECT-SRV6 {
            term deny-srv6 {
                from prefix-list SRV6-SID-SPACE;
                then reject;
            }
        }
    }
    ```

=== "Linux (ip6tables)"

    ```bash
    ip6tables -A FORWARD -d 5f00::/16 -j DROP
    ```

For deployments using operator GUA prefixes, apply the same principle with your locator prefix range (see also [RFC 8754 Section 5.1](https://datatracker.ietf.org/doc/html/rfc8754#section-5.1)).

## Further Reading

- :material-arrow-right: [Network Programming](network-programming.md) - How SIDs map to behaviors
- :material-arrow-right: [What is SRv6?](what-is-srv6.md) - Back to overview
- :material-arrow-right: [uSID Compression](usid-compression.md) - Compressed SID encoding (RFC 9800)
- :material-arrow-right: [Security](security.md) - SRv6 security considerations

## References

1. [RFC 8986 - SRv6 Network Programming](https://datatracker.ietf.org/doc/rfc8986/) - Defines SID structure, locator, function, and argument fields
2. [RFC 9602 - SRv6 SIDs in the IPv6 Addressing Architecture](https://datatracker.ietf.org/doc/rfc9602/) - IANA allocation of `5f00::/16` for SRv6 SIDs
3. [RFC 8754 - IPv6 Segment Routing Header (SRH)](https://datatracker.ietf.org/doc/rfc8754/) - SRH specification and security considerations
4. [IANA IPv6 Special-Purpose Address Registry](https://www.iana.org/assignments/iana-ipv6-special-registry/) - Official registry entry for `5f00::/16`
5. [Segment Routing - segment-routing.net](https://www.segment-routing.net/) - Community resource with tutorials, demos, and SRv6 deployment information
