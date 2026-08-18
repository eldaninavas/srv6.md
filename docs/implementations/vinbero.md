---
title: Vinbero (eBPF/Go)
description: SRv6 with Vinbero — a Go daemon whose eBPF data plane implements the RFC 8986 behaviors, EVPN L2VPN with multi-homing, the RFC 9433 mobile user plane, and service programming proxies, driven by an in-process GoBGP speaker.
tags:
  - implementations
  - vinbero
  - ebpf
  - go
  - open-source
  - l3vpn
  - evpn
  - mobile-user-plane
  - service-programming
---

# SRv6 with Vinbero (eBPF/Go)

**Vinbero** is an SRv6 implementation in two Go binaries: `vinberod`, a daemon that owns an eBPF data plane and an in-process BGP speaker, and `vinbero`, a CLI that drives it over Connect RPC.
Forwarding happens in eBPF; the control plane exists to populate its maps.

Its coverage runs in two directions the other open-source stacks rarely take: the **mobile user plane** (RFC 9433 GTP-U ⇄ SRv6, signalled by BGP MUP) and **service programming** proxies that put SR-unaware appliances inside an SRv6 chain.
Two gaps come with that.
There is no IGP, so the underlay is plain IPv6 routing and BGP carries every service.
RFC 9800 SID compression is on the roadmap and not implemented.

!!! info "Versions"
    Facts on this page reflect **Vinbero 0.1.1**, Apache-2.0 licensed: [takehaya/vinbero](https://github.com/takehaya/vinbero).
    The eBPF objects are load-tested in CI on kernels 6.1, 6.6, 6.12, and 7.0; the documented floor is Linux 5.15.

## Supported SRv6 Behaviors

Many of these behaviors have a runnable scenario under [`examples/`](https://github.com/takehaya/vinbero/tree/main/examples), built from network namespaces with setup, test, and teardown scripts, and the BGP services are verified against FRRouting in CI with containerlab.

| Group | Behaviors | Status |
|-------|-----------|:------:|
| Headend | `H.Encaps`, `H.Encaps.L2`, `H.Insert` (all `.Red`) | :material-check-circle: |
| Endpoint | `End`, `End.X`, `End.T`, `End.DT4/6/46`, `End.DX4/6` | :material-check-circle: |
| Endpoint (L2) | `End.DX2`, `End.DX2V`, `End.DT2U`, `End.DT2M` | :material-check-circle: |
| Binding SID | `End.B6.Encaps`, `End.B6.Insert` (both `.Red`) | :material-check-circle: |
| Mobile user plane (RFC 9433) | `H.M.GTP4.D`, `H.M.GTP6.D`, `End.M.GTP6.D`/`.D.Di`, `End.M.GTP4.E`, `End.M.GTP6.E`, `Args.Mob.Session` | :material-check-circle: |
| Service programming | `End.AS` (static), `End.AD` (dynamic), `End.AM` (masquerading), `End.AN` (SR-aware) | :material-check-circle: |
| Flavors | PSP / USP / USD | :material-check-circle: |
| Compression (RFC 9800) | NEXT-C-SID (uSID), REPLACE-C-SID, `End.LBS`/`XLBS` | :material-close-circle: |
| Other | `End.BM`, `End.NSH`, `End.Replicate`, `End.MAP`, `End.Limit` | :material-close-circle: |

## Architecture

One XDP program per interface dispatches behaviors through `PROG_ARRAY` tail calls, one slot per behavior.
Reserved slots take operator-supplied XDP plugins registered at runtime, each configured per SID from JSON marshalled through the plugin's own BTF.
A separate and much smaller TC program handles BUM replication, because `bpf_clone_redirect` exists only in TC.

Packets enter through an ingress front door that maps `{ifindex, vlan}` to a VRF, then take one of three paths: an LPM lookup in the local SID table, which yields a behavior and its per-SID parameters; an LPM lookup in the headend tables, which encapsulates towards a service SID after resolving an SR Policy if the route carries a color; or the L2 tables.
A headend entry can point at a group of up to eight weighted paths, chosen by a hash of the inner flow and masked by a liveness bitmap that a userspace prober updates for fast reroute.
That same hash goes into the outer flow label (RFC 6437), because every encapsulated packet between one pair of PEs otherwise shares an outer source and destination, which pins a whole site-to-site tunnel to one transit ECMP path.

One deliberate split: Vinbero holds **no per-VRF IP routing table in eBPF**.
`End.DT4/DT6/DT46` decapsulate and hand the inner packet to the kernel VRF device the SID names, and the kernel FIB does the lookup.
eBPF owns what the kernel cannot do: the SRv6 service tables, the L2 tables, and the GTP behaviors.

## Control Plane

GoBGP v4 runs as a library inside `vinberod` (`--bgp-enabled`), so a received route becomes an eBPF map write inside a single process, with no sidecar.
Each entry carries an owner tag, so a withdrawal removes what that route installed and leaves an operator's static entries in place.

| Address family | What it programs | Reference |
|----------------|------------------|-----------|
| VPNv4 / VPNv6 | RD/RT demux, SRv6 Service TLV (incl. §4 SID-structure transposition) to `H.Encaps` towards the remote `End.DT4`/`DT6` | RFC 9252 |
| EVPN (L2VPN) | RT2 remote MACs, RT3 BUM peers (`End.DT2M`), RT4 Ethernet Segment with RFC 8584 DF election and Local-Bias split horizon, RT1 aliasing | RFC 9252, RFC 7432, RFC 8584 |
| SR Policy (SAFI 73) | `{color, endpoint}` to a transport SID list, weighted segment lists, color steering in the data plane | RFC 9256 |
| BGP MUP (SAFI 85) | ISD/DSD segment discovery and T1ST/T2ST sessions to GTP downlink `H.Encaps` and uplink F-TEID entries | `draft-mpmz-bess-mup-safi` |
| IPv6 unicast | Injected into the kernel FIB | RFC 4760 |

Route targets bind per family and per direction in one command, `vinbero vrf-bgp bind --vrf vrf100 --rt vpnv4:65100:100:both`, which drives both import filtering and auto-advertise: connected and static prefixes, EVPN RT2/RT3/RT4 from the bridge lifecycle, local SR Policies, and local MUP routes.

## Installation

```bash
curl -fsSL https://raw.githubusercontent.com/takehaya/vinbero/main/scripts/install_vinbero.sh | sudo bash
sudo vinberod -c vinbero.yml   # --bgp-enabled to start the BGP speaker
```

## Configuration

`vinbero.yml` declares only what must exist at boot: which interfaces get XDP (`internal.devices`), the attach mode (`internal.bpf.device_mode`, either `driver` or `generic` for veth labs), the RPC bind address, and optional map pinning that carries data-plane state across a restart.
Everything else is created at runtime.

```bash
# L3VPN: a VRF is one object (kernel device + vrf_id + ingress membership)
vinbero vrf create --name vrf100 --table-id 100 --members eth2 --enable-l3mdev-rule
vinbero sid create --trigger-prefix fc00:3::3/128 --action END_DT4 --vrf-name vrf100

# EVPN: a bridge domain behind an L2 VRF facet
vinbero vrf bridge-attach --vrf evi-100 --name br100 --bd-id 100 --members eth1
vinbero sid create --trigger-prefix fc00:2::2/128 --action END_DT2 --bd-id 100 --bridge-name br100

# Static headend (BGP writes the equivalent entries once a session is up)
vinbero hv4 create --trigger-prefix 10.2.0.0/24 --src-addr fc00:1::1 \
    --segments fc00:2::2,fc00:3::3

vinbero sid list && vinbero stats show
```

A VRF cannot be deleted while a SID, an ingress access circuit, or a BGP binding still references it: the daemon refuses and names the reference.

## Further Reading

- :material-arrow-right: [Network Programming](../topics/network-programming.md) -- The RFC 8986 behavior catalog this implements
- :material-arrow-right: [5G Transport](../use-cases/5g-transport.md) -- Where the RFC 9433 mobile user plane behaviors belong
- :material-arrow-right: [zebra-rs (eBPF)](zebra-rs.md) -- The other eBPF stack, approached from the routing side
- :material-arrow-right: [Cilium (eBPF)](cilium.md) -- eBPF SRv6 from the Kubernetes side
- :material-arrow-right: [Linux Kernel](linux-kernel.md) -- The seg6 data plane Vinbero bypasses, and the VRF FIB it still relies on

## References

1. [Vinbero on GitHub](https://github.com/takehaya/vinbero) -- Daemon, CLI, eBPF sources, and the plugin SDK
2. [Vinbero roadmap](https://github.com/takehaya/vinbero/blob/main/docs/loadmap.md) -- Per-behavior support status
3. [Interop scenarios](https://github.com/takehaya/vinbero/tree/main/examples/interop-clab) -- containerlab topologies verified against FRRouting in CI
4. [RFC 9252 - BGP Overlay Services Based on SRv6](https://www.rfc-editor.org/rfc/rfc9252) -- L3VPN and EVPN service SID signaling
5. [RFC 9433 - SRv6 for the Mobile User Plane](https://www.rfc-editor.org/rfc/rfc9433) -- The GTP-U interworking behaviors
6. [draft-ietf-spring-srv6-service-programming](https://datatracker.ietf.org/doc/draft-ietf-spring-srv6-service-programming/) -- End.AS / End.AD / End.AM / End.AN
