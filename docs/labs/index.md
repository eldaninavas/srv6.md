---
title: Labs
description: Hands-on SRv6 lab environments using Containerlab and GNS3. Practice Segment Routing over IPv6 with no hardware required.
tags:
  - labs
  - hands-on
  - SRv6
  - SRv6 lab
  - SRv6 hands-on
---

# :material-flask: Labs

Get hands-on with SRv6 in your own lab environment. No expensive hardware required.

<div class="srv6-grid" markdown>

<div class="srv6-card" markdown>
### :material-docker: Containerlab
Build lightweight SRv6 topologies with Docker containers. Ideal for Linux-native SRv6 and FRR.

[:material-arrow-right: Start lab](containerlab.md)
</div>

<div class="srv6-card" markdown>
### :material-monitor: GNS3
Emulate vendor routers (IOS-XR, Junos) for realistic SRv6 testing.

[:material-arrow-right: Start lab](gns3.md)
</div>

</div>

## Quick Comparison

| Feature | Containerlab | GNS3 |
|---------|:------------:|:----:|
| Resource usage | Low | High |
| Vendor images | Linux/FRR | IOS-XR, Junos, etc. |
| Setup time | Minutes | Longer |
| Best for | Learning, CI/CD | Vendor-specific testing |
