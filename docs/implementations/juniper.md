---
title: Juniper
description: SRv6 on Juniper Networks routers
tags:
  - implementations
  - juniper
---

# SRv6 on Juniper

Juniper supports SRv6 on MX Series, PTX Series, and ACX Series platforms.

## Basic Configuration

```junos
set routing-options source-packet-routing srv6 locator myloc fc00:0:2::/48
set routing-options source-packet-routing srv6 no-reduced-srh

set protocols isis source-packet-routing srv6 locator myloc end-sid fc00:0:2::1

set routing-instances CUSTOMER-A instance-type vrf
set routing-instances CUSTOMER-A route-distinguisher 100:1
set routing-instances CUSTOMER-A vrf-target target:100:1
set routing-instances CUSTOMER-A protocols bgp source-packet-routing srv6 locator myloc
```

## Verification

```junos
show spring-traffic-engineering srv6-sid
show route table CUSTOMER-A.inet.0
show isis database extensive | match srv6
```

## Further Reading

- :material-arrow-right: [Implementations Overview](index.md)
- :material-web: [Juniper SRv6 Validated Design](https://www.juniper.net/documentation/us/en/software/jvd/jvd-sp-core-edge-srv6-01-01/service_provider_srv6_core_and_edge_-_phase_1_juniper_validated_design_jvd.html)

## References

1. [Segment Routing User Guide - Juniper TechLibrary](https://www.juniper.net/documentation/us/en/software/junos/segment-routing/index.html) - Comprehensive Junos OS guide for configuring SR-MPLS and SRv6
2. [Understanding SRv6 Network Programming in IS-IS Networks](https://www.juniper.net/documentation/us/en/software/junos/is-is/topics/concept/isis-srv6-network-programming.html) - TechLibrary reference for SRv6 with IS-IS on MX Series routers
3. [SRv6 Network Programming and Layer 3 Services in BGP Networks](https://www.juniper.net/documentation/us/en/software/junos/segment-routing/topics/topic-map/bgp-srv6-network-programming.html) - TechLibrary guide for SRv6 L3VPN services with BGP
4. [Day One: Introduction to SRv6 (PDF)](https://www.juniper.net/documentation/en_US/day-one-books/DayOne-Intro-SRv6.pdf) - Juniper Day One book introducing SRv6 concepts and configuration
5. [Day One: Inside Segment Routing](https://www.juniper.net/documentation/en_US/day-one-books/information-products/pathway-pages/day-one-inside-segment-routing.html) - Day One book covering advanced segment routing use cases and deployment
