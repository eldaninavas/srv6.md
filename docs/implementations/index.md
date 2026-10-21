---
title: Implementations
seo_title: "SRv6 Implementations: Cisco, Juniper, Arista, Nokia, FRR"
description: SRv6 implementations on Linux, Cisco IOS-XR, Juniper, Arista EOS, Nokia SR OS, FRRouting, and SONiC. Practical deployment guides for Segment Routing over IPv6.
tags:
  - implementations
  - SRv6
  - SRv6 implementations
  - SRv6 Linux
  - SRv6 Cisco
  - SRv6 Juniper
  - SRv6 Arista
  - SRv6 Nokia
---

# :material-server-network: Implementations

Practical guides for deploying SRv6 on different platforms. For a feature-by-feature comparison with minimum releases and a source for every cell, see the **[SRv6 Support Matrix](support-matrix.md)**.

| Platform | Type | Key Behaviors | SID | uSID |
|----------|------|---------------|:---:|:----:|
| [Linux Kernel](linux-kernel.md) | Open Source | End, End.X, End.DT4/6, End.DX4/6 | :material-check-circle:{ .srv6-green } | :material-check-circle:{ .srv6-green } |
| [Cisco IOS-XR](cisco-ios-xr.md) | Commercial | End, End.X, End.DT4/6/46, End.DX2/4/6, End.DT2U/M | :material-check-circle:{ .srv6-green } | :material-check-circle:{ .srv6-green } |
| [Cisco IOS-XE](cisco-ios-xe.md) | Commercial | uN, uA, uDT4/6/46, End.DTMC4, H.Encaps.Red | :material-check-circle:{ .srv6-green } | :material-check-circle:{ .srv6-green } |
| [Arista EOS](arista-eos.md) | Commercial | uN, uA (static), End.DT4/6, H.Encaps (F3216 uSID) | :material-check-circle:{ .srv6-green } | :material-check-circle:{ .srv6-green } |
| [Juniper](juniper.md) | Commercial | End, End.X, End.DT4/6/46, End.DX2, End.DT2 | :material-check-circle:{ .srv6-green } | :material-check-circle:{ .srv6-green } |
| [Nokia SR OS](nokia-sros.md) | Commercial | End, End.X, End.DT4/6/46, End.DX2; uN, uA, uDT4/6/46, uDX2, uDT2U/M | :material-check-circle:{ .srv6-green } | :material-check-circle:{ .srv6-green } |
| [FRRouting](frrouting.md) | Open Source | End/uN, End.X/uA (IS-IS, 9.1+), End.DT4/6/46 (BGP; uSID 8.5+) | :material-check-circle:{ .srv6-green } | :material-check-circle:{ .srv6-green } |
| [zebra-rs (eBPF)](zebra-rs.md) | Open Source | End, End.X, End.T, End.DT4/6/46, End.DX2/4/6, End.DT2U/M, End.B6, End.M | :material-check-circle:{ .srv6-green } | :material-check-circle:{ .srv6-green } |
| [Vinbero (eBPF/Go)](vinbero.md) | Open Source | End, End.X, End.T, End.DT4/6/46, End.DX2/4/6, End.DT2U/M, End.B6, GTP4/6, End.AS/AD/AM/AN | :material-check-circle:{ .srv6-green } | :material-close-circle:{ .srv6-red } |
| [SONiC](sonic.md) | Open Source | End, End.X, End.DT4/6/46, End.DX4/6 (ASIC-dependent) | :material-check-circle:{ .srv6-green } | :material-progress-clock: Partial |

## Conformance Testing: IPv6 Ready SRv6 Logo

The IPv6 Forum's **IPv6 Ready Logo** program added SRv6 as a test category for routers (Logo ID letter "R"). It tests conformance against **RFC 8402, RFC 8754 and RFC 8986** — SRv6 only, not SR-MPLS.

| Logo | Scope | Launched |
|------|-------|----------|
| **SRv6 Silver** | Conformance (SRH flags/TLVs, HMAC, Segments Left and Hop Limit handling, PMTU, SID arguments, End.X/End.T, ...) | March 2025 |
| **SRv6 Gold** | Conformance + multi-vendor interoperability | September 2025 |

The test specifications (developed by UNH-IOL, CNLabs and BII) are public on the [IPv6 Ready SRv6 resources page](https://www.ipv6ready.org/resources/srv6.html). When comparing platforms, an SRv6 logo is useful evidence of baseline RFC compliance, but it does not cover uSID/C-SID, control-plane extensions, or service behaviors beyond the specs.

!!! tip "Contribute your experience"
    Running SRv6 on a platform not listed here? We'd love your contribution!
