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
