---
title: Linux Kernel
description: SRv6 implementation in the Linux kernel
tags:
  - implementations
  - linux
  - open-source
---

# SRv6 on Linux Kernel

The Linux kernel has native SRv6 support since **kernel 4.10** and is one of the most complete open-source implementations.

## Supported Behaviors

| Behavior | Kernel Version | Status |
|----------|:--------------:|:------:|
| `End` | 4.10+ | :material-check-circle: |
| `End.X` | 4.10+ | :material-check-circle: |
| `End.DX4` | 4.14+ | :material-check-circle: |
| `End.DX6` | 4.10+ | :material-check-circle: |
| `End.DT4` | 5.11+ | :material-check-circle: |
| `End.DT6` | 4.14+ | :material-check-circle: |
| `End.B6.Encaps` | 4.10+ | :material-check-circle: |
| `H.Encaps` | 4.10+ | :material-check-circle: |
| `H.Encaps.Red` | 5.0+ | :material-check-circle: |

## Quick Start

### Enable SRv6

```bash
# Enable IPv6 forwarding
sysctl -w net.ipv6.conf.all.forwarding=1

# Enable SRv6 on specific interface
sysctl -w net.ipv6.conf.eth0.seg6_enabled=1

# Enable SRH processing
sysctl -w net.ipv6.conf.all.seg6_enabled=1
```

### Configure a Local SID

```bash
# Add End behavior
ip -6 route add fc00:0:1::100 encap seg6local action End dev eth0

# Add End.DT4 behavior (decap to IPv4 VRF)
ip -6 route add fc00:0:1::DT4 encap seg6local action End.DT4 vrftable 100

# Add End.DX6 behavior (cross-connect)
ip -6 route add fc00:0:1::DX6 encap seg6local action End.DX6 nh6 2001:db8::1 dev eth1
```

### Configure an SRv6 Policy (Encapsulation)

```bash
# Encapsulate traffic destined to 10.0.0.0/24 with SRv6
ip route add 10.0.0.0/24 encap seg6 mode encap segs fc00:0:2::100,fc00:0:3::DT4 dev eth0
```

### Verify Configuration

```bash
# Show local SID table
ip -6 route show | grep seg6local

# Show SRv6 policies
ip route show | grep seg6

# Monitor SRv6 counters
cat /proc/net/seg6_local
```

## Tools

- **iproute2** - Primary CLI for SRv6 configuration
- **tcpdump** / **tshark** - Packet capture with SRH decoding
- **scapy** - Python-based packet crafting with SRv6 support

!!! example "Capture SRv6 packets"
    ```bash
    tcpdump -i eth0 -v 'ip6 proto 43'
    ```

## Further Reading

- :material-arrow-right: [Containerlab](../labs/containerlab.md) - Build a Linux SRv6 lab
- :material-arrow-right: [FRRouting](frrouting.md) - Add routing protocol support

## References

1. [Seg6 Sysfs Variables - Linux Kernel Documentation](https://www.kernel.org/doc/html/v6.1/networking/seg6-sysctl.html) - Official kernel.org documentation for seg6 sysctl parameters
2. [ip-route(8) Linux Manual Page](https://man7.org/linux/man-pages/man8/ip-route.8.html) - iproute2 man page covering seg6 and seg6local encapsulation options
3. [SRv6 - Linux Kernel Implementation](https://segment-routing.org/) - Community resource for SRv6 installation, configuration, and advanced usage on Linux
4. [IPv6 Segment Routing - LWN.net](https://lwn.net/Articles/722804/) - LWN.net coverage of SRv6 merging into the Linux kernel in version 4.10
5. [SRv6 Network Programming in Linux Kernel - Netdev 0x16](https://netdevconf.info/0x16/sessions/workshop/srv6-network-programming-in-linux-kernel.html) - Workshop on SRv6 network programming at the Netdev conference
