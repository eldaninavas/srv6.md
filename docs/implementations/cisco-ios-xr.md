---
title: Cisco IOS-XR
description: SRv6 on Cisco IOS-XR routers
tags:
  - implementations
  - cisco
  - ios-xr
---

# SRv6 on Cisco IOS-XR

Cisco IOS-XR provides comprehensive SRv6 support across NCS and ASR platforms.

## Supported Platforms

- NCS 5500 / 5700 Series
- NCS 540 Series
- ASR 9000 Series
- Cisco 8000 Series (Silicon One)

## Basic Configuration

```cisco
!! Enable SRv6
segment-routing
 srv6
  locators
   locator MAIN
    micro-segment behavior unode psp-usd
    prefix fc00:0:1::/48
   !
  !
 !
!

!! Enable SRv6 in IS-IS
router isis CORE
 address-family ipv6 unicast
  segment-routing srv6
   locator MAIN
  !
 !
!

!! SRv6-based L3VPN
vrf CUSTOMER-A
 address-family ipv4 unicast
  import route-target 100:1
  export route-target 100:1
 !
!

router bgp 65000
 vrf CUSTOMER-A
  address-family ipv4 unicast
   segment-routing srv6
    locator MAIN
    alloc mode per-vrf
   !
  !
 !
!
```

## Verification Commands

```cisco
show segment-routing srv6 locator
show segment-routing srv6 sid
show segment-routing srv6 manager
show isis segment-routing srv6 locators
show bgp vpnv4 unicast vrf CUSTOMER-A
```

## Further Reading

- :material-arrow-right: [GNS3 Labs](../labs/gns3.md) - Test with IOS-XR images
- :material-web: [Cisco SRv6 Documentation](https://www.cisco.com/c/en/us/td/docs/routers/asr9000/software/asr9k-r7-8/segment-routing/configuration/guide/b-segment-routing-cg-asr9000-78x.html)
