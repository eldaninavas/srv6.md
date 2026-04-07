---
title: Host-Based SRv6
description: SRv6 at the host level with Linux kernel, eBPF, VPP, and the open-source ecosystem
tags:
  - topics
  - host-based
  - linux
  - ebpf
  - vpp
  - open-source
---

# Host-Based SRv6

SRv6 is not limited to routers and switches. It can run **directly on hosts** — servers, hypervisors, and containers — using the Linux kernel, eBPF, or VPP. This enables end-to-end SRv6 from the application all the way through the network.

## Why Host-Based SRv6?

When SRv6 runs on the host:

- **End-to-end path control** — the application or VM can choose its network path via SRv6 SIDs
- **No overlay translation** — no need for VXLAN↔SRv6 stitching at the edge
- **Service chaining from the host** — insert network functions directly in the SRv6 segment list
- **Multi-tenancy** — per-VRF or per-container isolation using SRv6 behaviors
- **Zero additional hardware** — uses existing server NICs and CPUs

## Linux Kernel SRv6

The Linux kernel has native SRv6 support since kernel 4.10 through two subsystems:

### seg6 (Encapsulation)

The `seg6` lightweight tunnel handles SRv6 **encapsulation** at the source:

```bash
# Encapsulate traffic to 10.0.0.0/24 with SRv6
ip route add 10.0.0.0/24 encap seg6 mode encap \
  segs fc00:0:2::1,fc00:0:3::100 dev eth0
```

### seg6local (Local SID Processing)

The `seg6local` subsystem handles **local SID processing** — making the host an SRv6 endpoint:

```bash
# Host acts as an SRv6 End.DT4 endpoint
ip -6 route add fc00:0:1::DT4 encap seg6local \
  action End.DT4 vrftable 100

# Host acts as an SRv6 End.DX6 cross-connect
ip -6 route add fc00:0:1::DX6 encap seg6local \
  action End.DX6 nh6 2001:db8::1 dev veth0
```

### Kernel Architecture

```
┌──────────────────────────────────────┐
│  Application / Container / VM        │
├──────────────────────────────────────┤
│  Socket API                          │
├──────────────────────────────────────┤
│  Linux Network Stack                 │
│  ├── seg6 (encap/decap)             │
│  ├── seg6local (SID processing)     │
│  └── VRF / network namespaces       │
├──────────────────────────────────────┤
│  NIC Driver                          │
└──────────────────────────────────────┘
```

## eBPF + SRv6

**eBPF** (extended Berkeley Packet Filter) enables programmable SRv6 processing in the kernel without modifying kernel code. This is powerful for custom SRv6 behaviors.

### Use Cases for eBPF + SRv6

| Use Case | Description |
|----------|-------------|
| **Custom SRv6 behaviors** | Implement new End.* behaviors as eBPF programs |
| **SRv6-aware load balancing** | Intelligent flowlet steering at the host level |
| **Telemetry** | In-band OAM and per-SID counters via eBPF hooks |
| **Policy enforcement** | Per-SID access control and rate limiting |
| **Service chaining** | Insert eBPF-based network functions in the SRv6 path |

### How It Works

eBPF programs attach to the `seg6local` subsystem as custom SRv6 endpoint actions using the `BPF` action type:

```bash
# Attach eBPF program as an SRv6 local SID action
ip -6 route add fc00:0:1::BPF encap seg6local \
  action End.BPF endpoint obj my_srv6_func.o sec srv6_handler
```

The eBPF program receives the packet with full access to the SRH and can:

- Read and modify SRv6 segment list
- Make forwarding decisions based on SID arguments
- Collect per-SID telemetry
- Implement custom decapsulation or encapsulation logic

## VPP (Vector Packet Processing)

**VPP** is a high-performance user-space networking stack from the [fd.io](https://fd.io) project. It provides SRv6 processing at speeds far exceeding the Linux kernel:

### Performance

| Platform | Performance |
|----------|-------------|
| Linux kernel seg6 | ~1-5 Mpps per core |
| VPP SRv6 | ~10-30 Mpps per core |

### VPP SRv6 Features

- Full SRv6 encap/decap (T.Encaps, End, End.X, End.DT4/6, etc.)
- SRv6 proxy behaviors for service chaining (End.AS, End.AD, End.AM)
- SR Policy management
- High-performance SRv6 tunnel endpoints

### VPP Configuration Example

```vpp
!! Configure SRv6 locator
sr localsid address fc00:0:1::100 behavior end

!! Configure SRv6 policy
sr policy add bsid fc00:0:1::999 next fc00:0:2::1 next fc00:0:3::100 encap

!! Steer traffic into SRv6 policy
sr steer l3 10.0.0.0/24 via bsid fc00:0:1::999
```

## Comparison

| Aspect | Linux Kernel | eBPF | VPP |
|--------|:-------------|:-----|:----|
| **Performance** | Moderate | Moderate-High | Very High |
| **Flexibility** | Fixed behaviors | Fully programmable | Fixed + plugins |
| **Deployment** | Built into every Linux server | Requires eBPF toolchain | Requires VPP installation |
| **Use case** | General-purpose host SRv6 | Custom behaviors, telemetry | High-performance endpoints |
| **Maturity** | Production (since kernel 4.10) | Growing (kernel 5.x+) | Production (fd.io) |

## Open-Source Ecosystem

| Project | Description | License |
|---------|-------------|---------|
| **Linux Kernel (seg6)** | Native SRv6 data plane | GPL v2 |
| **iproute2** | CLI for SRv6 configuration | GPL v2 |
| **FRRouting** | Routing suite with SRv6 control plane | GPL v2 |
| **VPP / fd.io** | High-performance SRv6 user-space stack | Apache 2.0 |
| **SONiC** | NOS with SRv6 via SAI | Apache 2.0 |
| **Scapy** | Python packet crafting with SRv6 support | GPL v2 |
| **tcpdump / Wireshark** | Packet capture with SRH decoding | BSD / GPL v2 |
| **Containerlab** | Lab topology tool for SRv6 testing | BSD 3-Clause |

!!! tip "Fully open stack"
    It is possible to build a complete SRv6 network — from host to fabric — using **entirely open-source software**: Linux kernel (data plane) + FRRouting (control plane) + SONiC (switch NOS) + Containerlab (testing).

## Further Reading

- :material-arrow-right: [Linux Kernel Implementation](../implementations/linux-kernel.md) - Detailed Linux SRv6 configuration
- :material-arrow-right: [FRRouting](../implementations/frrouting.md) - Open-source routing with SRv6
- :material-arrow-right: [SONiC & SAI](sonic-sai.md) - Open-source switch NOS
- :material-arrow-right: [Containerlab](../labs/containerlab.md) - Build SRv6 labs with containers

## References

1. [Linux Kernel seg6 Documentation](https://docs.kernel.org/networking/seg6-sysctl.html) - Kernel sysctl parameters for SRv6
2. [eBPF and SRv6 - LPC 2018](https://lpc.events/event/2/contributions/36/) - Linux Plumbers Conference talk on eBPF + SRv6 integration
3. [VPP SRv6 Documentation (fd.io)](https://s3-docs.fd.io/vpp/24.02/developer/plugins/srv6.html) - VPP Segment Routing plugin documentation
4. [FRRouting SRv6 Documentation](https://docs.frrouting.org/en/latest/zebra.html#segment-routing-ipv6) - FRR Zebra SRv6 configuration reference
