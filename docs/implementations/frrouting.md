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

## References

1. [FRRouting User Guide](https://docs.frrouting.org/en/stable-10.3/) - Official FRR documentation portal with SRv6 configuration guides
2. [FRRouting ISIS Documentation](https://docs.frrouting.org/en/latest/isisd.html) - IS-IS daemon docs covering SRv6 locator and SID advertisement
3. [FRRouting GitHub Repository](https://github.com/FRRouting/frr) - Source code and releases for the FRRouting project
4. [Add Support for SRv6 IPv4 L3VPN - FRR PR #9649](https://github.com/FRRouting/frr/pull/9649) - Pull request adding SRv6 VPNv4 support to FRR
5. [Add Support for SRv6 uSID Behaviors - FRR PR #12219](https://github.com/FRRouting/frr/pull/12219) - Pull request adding SRv6 micro-SID behavior support
