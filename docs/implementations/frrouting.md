---
title: FRRouting
description: SRv6 support in FRRouting (FRR)
tags:
  - implementations
  - frr
  - open-source
---

# SRv6 on FRRouting (FRR)

FRRouting is an open-source routing suite that provides SRv6 support through its IS-IS and BGP daemons.

## SRv6 Support Status

| Feature | Status | FRR Version |
|---------|:------:|:-----------:|
| IS-IS SRv6 locator | :material-check-circle: | 8.4+ |
| BGP SRv6 VPN | :material-check-circle: | 8.4+ |
| SRv6 TE Policy | :material-progress-clock: | In dev |

## Configuration Example

```frr
! Enable SRv6 in IS-IS
router isis CORE
 segment-routing srv6
  locator MAIN
 exit

! Define SRv6 locator
segment-routing
 srv6
  locators
   locator MAIN
    prefix fc00:0:1::/48 block-len 32 node-len 16 func-bits 16
   exit
  exit
 exit
```

## Further Reading

- :material-arrow-right: [Linux Kernel](linux-kernel.md) - Data plane for FRR
- :material-arrow-right: [Containerlab](../labs/containerlab.md) - FRR + Linux labs
