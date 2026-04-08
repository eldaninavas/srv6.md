---
title: Implementations
description: SRv6 implementations on Linux, Cisco IOS-XR, Juniper, FRRouting, and SONiC. Practical deployment guides for Segment Routing over IPv6.
tags:
  - implementations
  - SRv6
  - SRv6 implementations
  - SRv6 Linux
  - SRv6 Cisco
  - SRv6 Juniper
---

# :material-server-network: Implementations

Practical guides for deploying SRv6 on different platforms.

| Platform | Type | Key Behaviors | SID | uSID |
|----------|------|---------------|:---:|:----:|
| [Linux Kernel](linux-kernel.md) | Open Source | End, End.X, End.DT4/6, End.DX4/6 | :material-check-circle:{ .srv6-green } | :material-check-circle:{ .srv6-green } |
| [Cisco IOS-XR](cisco-ios-xr.md) | Commercial | End, End.X, End.DT4/6/46, End.DX2/4/6, End.DT2U/M | :material-check-circle:{ .srv6-green } | :material-check-circle:{ .srv6-green } |
| [Juniper](juniper.md) | Commercial | End, End.X, End.DT4/6, End.DX2/4/6 | :material-check-circle:{ .srv6-green } | :material-check-circle:{ .srv6-green } |
| [FRRouting](frrouting.md) | Open Source | End, End.DT4/6 | :material-check-circle:{ .srv6-green } | :material-close-circle:{ .srv6-red } |
| [SONiC](sonic.md) | Open Source | End, End.DT4/6, End.DX4/6 | :material-check-circle:{ .srv6-green } | :material-progress-clock: Partial |

!!! tip "Contribute your experience"
    Running SRv6 on a platform not listed here? We'd love your contribution!
