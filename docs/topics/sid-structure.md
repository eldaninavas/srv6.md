---
title: SID Structure
seo_title: "SRv6 SID Structure: Locator, Function and Arguments"
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

!!! tip "Decode a SID"
    Paste any SID into the [SRv6 SID Decoder](../tools/sid-decoder.md) to see its block, node, function and argument bits for the lengths you choose, and whether it sits in `5f00::/16`.

## Example

```
SID:  5f00:0:1:100::

Breakdown:
  Locator:  5f00:0:1::/48   (bits 0-47: identifies the node)
  Function: 100              (bits 48-63: End.DT4, decapsulate and look up in an IPv4 table)
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

Whether you use `5f00::/16` or your own GUA, keep SRv6 SIDs inside the SR domain at two layers:

1. **Routes:** never advertise the SID block to external peers, and never accept it from them.
2. **Packets:** drop packets arriving on external interfaces whose destination is in the SID block, so nobody outside can send traffic to your SIDs.

=== "Cisco IOS-XR"

    ```cisco
    prefix-set SRV6-SIDS
      5f00::/16 le 128
    end-set
    !
    route-policy NO-SRV6-SIDS
      if destination in SRV6-SIDS then
        drop
      else
        pass
      endif
    end-policy
    !
    router bgp 65000
     neighbor 2001:db8:ff::1
      address-family ipv6 unicast
       route-policy NO-SRV6-SIDS in
       route-policy NO-SRV6-SIDS out
    !
    ipv6 access-list EDGE-IN
     10 deny ipv6 any 5f00::/16
     20 permit ipv6 any any
    !
    interface HundredGigE0/0/0/0
     ipv6 access-group EDGE-IN ingress
    ```

    The `else pass` matters: an IOS-XR route policy drops everything it does not explicitly pass.

=== "Juniper Junos"

    ```junos
    policy-options {
        policy-statement NO-SRV6-SIDS {
            term deny-srv6 {
                from {
                    route-filter 5f00::/16 orlonger;
                }
                then reject;
            }
        }
    }
    firewall {
        family inet6 {
            filter EDGE-IN {
                term no-srv6-sids {
                    from {
                        destination-address {
                            5f00::/16;
                        }
                    }
                    then discard;
                }
                term rest {
                    then accept;
                }
            }
        }
    }
    ```

    Apply `NO-SRV6-SIDS` as both `import` and `export` policy on the external BGP group, and `EDGE-IN` as `filter input` on the external interfaces (`family inet6`). `orlonger` is needed: without it the policy only matches the /16 itself.

=== "Linux (ip6tables)"

    ```bash
    # External interface only: inside the domain, SRv6 traffic to the SID block is legitimate
    ip6tables -t raw -A PREROUTING -i eth-external -d 5f00::/16 -j DROP
    ```

    The `raw` table's `PREROUTING` chain runs before the routing decision, so it also covers packets addressed to local SIDs, which never reach `FORWARD`.

For deployments using operator GUA prefixes, apply the same principle with your locator prefix range (see also [RFC 8754 Section 5.1](https://datatracker.ietf.org/doc/html/rfc8754#section-5.1)).

## Further Reading

- :material-tools: [SRv6 SID Decoder](../tools/sid-decoder.md) - Decode a SID or uSID container bit by bit
- :material-arrow-right: [Network Programming](network-programming.md) - How SIDs map to behaviors
- :material-arrow-right: [What is SRv6?](what-is-srv6.md) - Back to overview
- :material-arrow-right: [uSID Compression](usid-compression.md) - Compressed SID encoding (RFC 9800)
- :material-arrow-right: [Security](security.md) - SRv6 security considerations
- :material-arrow-right: [RFC 9602](../rfcs/rfc9602.md) - The IANA 5f00::/16 SRv6 SID block

## References

1. [RFC 8986 - SRv6 Network Programming](https://datatracker.ietf.org/doc/rfc8986/) - Defines SID structure, locator, function, and argument fields
2. [RFC 9602 - SRv6 SIDs in the IPv6 Addressing Architecture](https://datatracker.ietf.org/doc/rfc9602/) - IANA allocation of `5f00::/16` for SRv6 SIDs
3. [RFC 8754 - IPv6 Segment Routing Header (SRH)](https://datatracker.ietf.org/doc/rfc8754/) - SRH specification and security considerations
4. [IANA IPv6 Special-Purpose Address Registry](https://www.iana.org/assignments/iana-ipv6-special-registry/) - Official registry entry for `5f00::/16`
5. [Segment Routing - segment-routing.net](https://www.segment-routing.net/) - Community resource with tutorials, demos, and SRv6 deployment information
