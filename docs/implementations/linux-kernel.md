---
title: Linux Kernel
seo_title: "SRv6 on Linux: Kernel Behaviors, iproute2 Recipes and a Lab"
description: "SRv6 in the Linux kernel: which seg6 behaviors landed in which kernel, iproute2 recipes for encap and seg6local, a tested two-namespace lab and troubleshooting."
tags:
  - implementations
  - linux
  - open-source
---

# SRv6 on Linux

The Linux kernel has had native SRv6 since **4.10** (February 2017; `seg6local` endpoint behaviors since 4.14) and is one of the most complete open-source SRv6 data planes. Everything is configured with **iproute2**: `seg6` routes act as headends (H.Encaps and friends), and `seg6local` routes bind local SIDs to endpoint behaviors (End, End.X, End.DT4, …). Routing daemons such as [FRRouting](frrouting.md) program the same kernel objects, so what you learn here applies to FRR, SONiC hosts and container labs alike.

## Behavior Support by Kernel Version

First mainline release containing each feature, checked against the kernel git history (latest release: 7.3, October 2026). Distribution and stable kernels may carry fixes earlier; features also need a matching **iproute2**.

### Headend behaviors (`ip route ... encap seg6 mode ...`)

| RFC 8986 behavior | iproute2 mode | Kernel | Notes |
|-------------------|---------------|:------:|-------|
| H.Encaps | `encap` | **4.10** | IPv6 or IPv4 payload |
| *SRH insertion* (not in RFC 8986) | `inline` | **4.10** | Adds an SRH to an IPv6 packet in place |
| H.Encaps.L2 | `l2encap` | **4.14** | Ethernet payload |
| H.Encaps.Red | `encap.red` | **6.0** | iproute2 6.0 |
| H.Encaps.L2.Red | `l2encap.red` | **6.0** | iproute2 6.0 |
| Per-route outer source (`tunsrc`) | `... tunsrc <addr>` | **7.1** | iproute2 7.1; overrides the per-namespace `ip sr tunsrc` |

### Endpoint behaviors (`ip -6 route ... encap seg6local action ...`)

| Behavior | Kernel | Notes |
|----------|:------:|-------|
| End | **4.14** | `seg6local` itself arrived in 4.14 |
| End.X | **4.14** | Optional `oif` for link-local next hops from 6.17 |
| End.T | **4.14** | `table N` |
| End.DX2 | **4.14** | `oif <dev>`; no VLAN variant (End.DX2V) |
| End.DX4 / End.DX6 | **4.14** | `nh4` / `nh6` |
| End.DT6 | **4.14** (`table`), **5.11** (`vrftable`) | VRF mode needs `net.vrf.strict_mode=1` |
| End.DT4 | **5.11** | `vrftable` only; needs VRF strict mode |
| End.DT46 | **5.14** | `vrftable`; needs VRF strict mode |
| End.B6 (SRH insertion) | **4.14** | `srh segs ...` |
| End.B6.Encaps | **4.14** | `srh segs ...` |
| End.BPF | **4.18** | Attach an eBPF program as the behavior |
| PSP flavor | **6.3** | End only (`flavors psp`) |
| NEXT-C-SID flavor (uSID) | **6.1** (End), **6.6** (End.X) | `flavors next-csid lblen 32 nflen 16` (defaults 32/16) |
| Per-SID counters | **5.13** | `count`; iproute2 5.14 |

### Infrastructure

| Feature | Kernel | Notes |
|---------|:------:|-------|
| SRH processing, `seg6_enabled` sysctl | **4.10** | Per interface; see [Troubleshooting](#troubleshooting) |
| HMAC TLV, `seg6_require_hmac`, `ip sr hmac` | **4.10** | Constant-time MAC compare from 6.17 |
| `ip sr tunsrc` (per-namespace outer source) | **4.10** | Default `::` = pick from the egress interface |
| `net.ipv6.seg6_flowlabel` | **4.18** | Compute the outer flow label for encapsulated traffic |
| Netfilter hooks on seg6/seg6local | **5.15** | Off by default; `net.netfilter.nf_hooks_lwtunnel=1` |
| Post-encapsulation lookup in a chosen FIB table | **7.3** | `SEG6_IPTUNNEL_TABLE`; iproute2 support not yet in a release |

!!! warning "Not implemented in the kernel"
    End.DX2V, End.DT2U, End.DT2M, End.B6.Encaps.Red, the USP and USD flavors, REPLACE-C-SID and every [RFC 9433](../rfcs/rfc9433.md) mobile behavior. `End.BM`, `End.S`, `End.AS` and `End.AM` exist as names in the UAPI and in iproute2, but the kernel has no implementation behind them. For EVPN (End.DT2U/DT2M), use [FRRouting](frrouting.md) with a VXLAN data plane or a vendor router. For MUP behaviors, use an eBPF data plane such as [Vinbero](vinbero.md).

## iproute2 Recipes

Every command on this page was tested on kernel 6.12 with iproute2 6.9. Behavior names follow [RFC 8986](../topics/network-programming.md); in iproute2 they are the `action` keyword of a `seg6local` route.

### Headend: steering traffic into SRv6 (`seg6`)

```bash
# H.Encaps: IPv4 prefix into an outer IPv6 header + SRH with two segments
ip route add 198.51.100.0/24 encap seg6 mode encap \
    segs fc00:0:3::1,fc00:0:4::a4 dev eth0

# H.Encaps.Red: same, but the first SID is only in the DA (SRH one entry shorter;
# with a single SID there is no SRH at all)
ip route add 198.51.101.0/24 encap seg6 mode encap.red \
    segs fc00:0:3::1,fc00:0:4::a4 dev eth0

# uSID: one container carrying uN(3) uN(4) uDT4 — no SRH needed
ip route add 198.51.102.0/24 encap seg6 mode encap \
    segs fcbb:bb00:300:400:e004:: dev eth0

# SRH insertion into an existing IPv6 packet (not an RFC 8986 behavior)
ip -6 route add 2001:db8:99::/48 encap seg6 mode inline segs fc00:0:3::1 dev eth0

# H.Encaps.L2 / H.Encaps.L2.Red: frames received for this route are carried as Ethernet payload
ip -6 route add fc00:0:1::12/128 encap seg6 mode l2encap segs fc00:0:4::d2 dev eth1
ip -6 route add fc00:0:1::13/128 encap seg6 mode l2encap.red segs fc00:0:3::1,fc00:0:4::d2 dev eth1
```

The outer source address comes from `ip sr tunsrc set <addr>` (one per network namespace); if it is unset, the kernel picks a source address of the outgoing interface. Kernel and iproute2 7.1 add a per-route `tunsrc <addr>` option that overrides it.

### Endpoint behaviors (`seg6local`)

```bash
# End (node SID), optionally with the PSP flavor (6.3+)
ip -6 route add fc00:0:1::1/128 encap seg6local action End dev eth0
ip -6 route add fc00:0:1::2/128 encap seg6local action End flavors psp dev eth0

# End.X (adjacency SID) toward a specific IPv6 next hop
ip -6 route add fc00:0:1:e001::/64 encap seg6local action End.X nh6 2001:db8:1::2 dev eth0

# End.T: next segment looked up in table 10
ip -6 route add fc00:0:1::3/128 encap seg6local action End.T table 10 dev eth0

# End.DX4 / End.DX6: decapsulate and cross-connect to a next hop (per-CE VPN)
ip -6 route add fc00:0:1::d4/128 encap seg6local action End.DX4 nh4 192.0.2.2 dev eth1
ip -6 route add fc00:0:1::d6/128 encap seg6local action End.DX6 nh6 2001:db8:2::2 dev eth1

# End.DX2: decapsulate and send the inner Ethernet frame out of eth1
ip -6 route add fc00:0:1::d2/128 encap seg6local action End.DX2 oif eth1 dev eth1

# End.B6 (SRH insertion) and End.B6.Encaps: binding SIDs for an SR policy
ip -6 route add fc00:0:1::b6/128 encap seg6local action End.B6 srh segs fc00:0:3::1,fc00:0:4::1 dev eth0
ip -6 route add fc00:0:1::b7/128 encap seg6local action End.B6.Encaps srh segs fc00:0:3::1,fc00:0:4::1 dev eth0

# Per-SID counters (read with: ip -s -6 route show fc00:0:1::c)
ip -6 route add fc00:0:1::c/128 encap seg6local action End count dev eth0
```

### VRF decapsulation: End.DT4, End.DT6, End.DT46

The table-lookup behaviors deliver the inner packet into a **VRF**. Create the VRF first and enable strict mode; without it the kernel rejects any `vrftable` SID with `Error: Strict mode for VRF is disabled.`

```bash
ip link add vrf-red type vrf table 10
ip link set vrf-red up
sysctl -w net.vrf.strict_mode=1      # the sysctl appears once the vrf module is loaded

ip -6 route add fc00:0:1::a4/128  encap seg6local action End.DT4  vrftable 10 dev vrf-red
ip -6 route add fc00:0:1::a6/128  encap seg6local action End.DT6  vrftable 10 dev vrf-red
ip -6 route add fc00:0:1::a46/128 encap seg6local action End.DT46 vrftable 10 dev vrf-red

# legacy End.DT6 form without a VRF device: plain table lookup
ip -6 route add fc00:0:1::a7/128 encap seg6local action End.DT6 table 10 dev eth0
```

### Compressed SIDs: NEXT-C-SID (uSID)

```bash
# uN: End with the NEXT-C-SID flavor (6.1+), 32-bit block + 16-bit node uSID
ip -6 route add fcbb:bb00:100::/48 encap seg6local action End \
    flavors next-csid lblen 32 nflen 16 dev eth0

# uA: End.X with NEXT-C-SID (6.6+)
ip -6 route add fcbb:bb00:100:e001::/64 encap seg6local action End.X nh6 2001:db8:1::2 \
    flavors next-csid lblen 32 nflen 16 dev eth0
```

`lblen` is the locator-block length and `nflen` the node + function length (both in bits, multiples of 8). See [uSID Compression](../topics/usid-compression.md) for how the destination address is shifted at each hop.

## Lab: Two Routers in Network Namespaces

A self-contained L3VPN over SRv6 between two network namespaces, `r1` and `r2`. Each has a customer VRF (table 100) with a dummy "LAN", an End.DT46 SID for the VRF, and an H.Encaps.Red route toward the other side. Static routes for the locators stand in for IS-IS. Run as root on any recent kernel:

```bash title="srv6-lab.sh"
#!/bin/sh
set -e
ip netns add r1
ip netns add r2
ip link add veth1 netns r1 type veth peer name veth2 netns r2

for r in r1 r2; do
  ip -n $r link set lo up
  ip -n $r link add vrf-cust type vrf table 100
  ip -n $r link set vrf-cust up
  ip -n $r link add cust0 type dummy
  ip -n $r link set cust0 master vrf-cust up
  ip netns exec $r sysctl -qw net.ipv6.conf.all.forwarding=1
  ip netns exec $r sysctl -qw net.ipv4.ip_forward=1
  ip netns exec $r sysctl -qw net.ipv6.conf.all.seg6_enabled=1
  ip netns exec $r sysctl -qw net.vrf.strict_mode=1
  ip netns exec $r sysctl -qw net.ipv4.conf.all.rp_filter=0
  ip netns exec $r sysctl -qw net.ipv4.conf.vrf-cust.rp_filter=0
done
ip netns exec r1 sysctl -qw net.ipv6.conf.veth1.seg6_enabled=1
ip netns exec r2 sysctl -qw net.ipv6.conf.veth2.seg6_enabled=1

ip -n r1 link set veth1 up
ip -n r2 link set veth2 up
ip -n r1 -6 addr add 2001:db8:12::1/64 dev veth1 nodad
ip -n r2 -6 addr add 2001:db8:12::2/64 dev veth2 nodad
ip -n r1 addr add 10.1.1.1/24 dev cust0
ip -n r2 addr add 10.2.2.2/24 dev cust0

# Locators: r1 = fc00:0:1::/48, r2 = fc00:0:2::/48
ip -n r1 -6 route add fc00:0:2::/48 via 2001:db8:12::2
ip -n r2 -6 route add fc00:0:1::/48 via 2001:db8:12::1

# Service SIDs: End.DT46 into the customer VRF
ip -n r1 -6 route add fc00:0:1::d46/128 encap seg6local action End.DT46 vrftable 100 dev vrf-cust
ip -n r2 -6 route add fc00:0:2::d46/128 encap seg6local action End.DT46 vrftable 100 dev vrf-cust

# Headend: H.Encaps.Red from the VRF toward the remote End.DT46 SID
ip -n r1 route add 10.2.2.0/24 vrf vrf-cust encap seg6 mode encap.red segs fc00:0:2::d46 dev veth1
ip -n r2 route add 10.1.1.0/24 vrf vrf-cust encap seg6 mode encap.red segs fc00:0:1::d46 dev veth2

ip netns exec r1 ping -c 3 -I vrf-cust 10.2.2.2
```

Watch the encapsulated traffic on r2 while pinging. With a single SID and `encap.red`, there is no SRH: the outer header's next header is 4 (IPv4).

```text
# ip netns exec r2 tcpdump -nvi veth2 'ip6[6] == 4'
IP6 (hlim 64, next-header IPIP (4) payload length: 84) 2001:db8:12::1 > fc00:0:2::d46:
    IP (tos 0x0, ttl 64, id 60488, offset 0, flags [DF], proto ICMP (1), length 84)
    10.1.1.1 > 10.2.2.2: ICMP echo request, id 49, seq 1, length 64
```

Switch r1 to `mode encap` and the SRH appears, with one segment and Segments Left 0:

```text
# ip -n r1 route replace 10.2.2.0/24 vrf vrf-cust encap seg6 mode encap segs fc00:0:2::d46 dev veth1
# ip netns exec r2 tcpdump -nvi veth2 'ip6[6] == 43'
IP6 (hlim 64, next-header Routing (43) payload length: 108) 2001:db8:12::1 > fc00:0:2::d46:
    RT6 (len=2, type=4, segleft=0, last-entry=0, flags=0x0, tag=0, [0]fc00:0:2::d46)
    IP (tos 0x0, ttl 64, ...) 10.1.1.1 > 10.2.2.2: ICMP echo request, id 54, seq 1, length 64
```

Clean up with `ip netns del r1; ip netns del r2`. To grow this into a multi-hop topology with IS-IS and BGP, move to [Containerlab](../labs/containerlab.md) with FRR.

## Troubleshooting

| Symptom | Likely cause | Fix |
|---------|--------------|-----|
| Packets with an SRH are dropped on arrival | `seg6_enabled` is 0. The kernel uses the **lower** of the `all` value and the receiving interface's value, so both must be 1 | `sysctl -w net.ipv6.conf.all.seg6_enabled=1` and `net.ipv6.conf.<if>.seg6_enabled=1` |
| Transit node does not forward SRv6 traffic | IPv6 forwarding disabled | `sysctl -w net.ipv6.conf.all.forwarding=1` |
| End.DT4/End.DT46 decapsulates, but nothing reaches the VRF and no counter increments | Reverse-path filtering on the VRF device. Distributions often set `rp_filter` (1 or 2) by default; new devices inherit it, and the effective value is the max of `all` and the device | `sysctl -w net.ipv4.conf.<vrf>.rp_filter=0` (and `all`) — this was the one failure we hit building the lab above |
| `Error: Strict mode for VRF is disabled.` when adding End.DT4/DT6/DT46 | VRF strict mode off | `sysctl -w net.vrf.strict_mode=1` (after creating a VRF) |
| Ping from the VRF fails with `ip vrf exec` in containers | `ip vrf exec` needs cgroup BPF | Use `ping -I <vrf-device>` instead |
| Encapsulated packets leave with an unexpected source | No `tunsrc` set | `ip sr tunsrc set <addr>` |
| Large packets disappear after encapsulation | Encapsulation adds 40 bytes (plus 8 + 16 × n for an SRH) | Raise the underlay MTU or lower the customer MTU |
| SRH packets dropped on an HMAC-enabled interface | `seg6_require_hmac` = 1 drops packets without a valid HMAC TLV | Configure keys with `ip sr hmac set` on both ends, or use 0 (validate only if present) / -1 (ignore HMAC) |

Useful commands:

```bash
ip -6 route show | grep seg6local           # local SIDs
ip route show vrf vrf-cust                  # encap routes in a VRF
ip -s -6 route show fc00:0:1::c             # per-SID counters (routes added with "count")
ip -6 route get fc00:0:2::d46               # which route/SID a destination hits
tcpdump -nvi eth0 'ip6 proto 43'            # packets whose first extension header is the SRH
tcpdump -nvi eth0 'ip6[6] == 4 or ip6[6] == 41'  # H.Encaps(.Red) with no SRH (IPv4 / IPv6 inside)
nstat -az | grep -i -E 'Ip6InNoRoutes|Ip6InDiscards|Ip6InHdrErrors'
sysctl -a 2>/dev/null | grep seg6           # seg6_enabled / seg6_require_hmac per interface
```

!!! tip "Filtering SRv6 in tcpdump"
    `ip6 proto 43` only matches when the SRH directly follows the IPv6 header. Reduced encapsulation with one SID has **no** SRH at all, so match the payload type (`ip6[6] == 4` for IPv4, `41` for IPv6) or the destination prefix (`dst net fc00::/16`).

## Not Yet Merged: Mobile User Plane (RFC 9433)

The kernel has **no** [RFC 9433](../rfcs/rfc9433.md) Mobile User Plane behaviors in any release up to 7.3. Patches from Yuya Kusakabe are under review on netdev (status as of 20 October 2026):

| Series | Posted | Status | What it adds |
|--------|--------|--------|--------------|
| net-next "seg6: add SRv6 Mobile User Plane (RFC 9433) behaviors" (7 patches) and the matching iproute2-next series | v1 3 May, v2 4 May 2026 | Changes requested; superseded | End.MAP, End.M.GTP4.E, End.M.GTP6.E, End.M.GTP6.D, End.M.GTP6.D.Di and H.M.GTP4.D |
| RFC net-next "seg6: add support for the SRv6 End.MAP behavior" + selftest | v1 10 July → **v5 2 October 2026** | **RFC, not merged** | End.MAP only: rewrites the IPv6 DA to a configured mapped SID and forwards via the FIB, under a new `seg6mobile` lightweight-tunnel encap |
| RFC iproute2-next "End.MAP behavior under seg6mobile encap" | v5 2 October 2026 | RFC, not applied | iproute2 support plus a new uapi header `seg6_mobile.h` |

After review of the all-in-one submission, the author split the work into **per-behavior series**, starting with End.MAP; the GTP-U interworking behaviors (End.M.GTP4.E and friends) would follow separately. An "RFC" posting cannot be merged as is, so End.MAP will not appear before a non-RFC version is accepted into net-next — at the earliest, the release after that. Until then, use an eBPF data plane such as [Vinbero](vinbero.md) for MUP/GTP behaviors.

## Tools

- **iproute2** - `ip route ... encap seg6|seg6local`, `ip sr tunsrc`, `ip sr hmac`
- **tcpdump** / **tshark** - SRH decoding (`RT6 ... type=4`)
- **scapy** - Packet crafting with `IPv6ExtHdrSegmentRouting`
- **FRRouting** - IS-IS/BGP control plane that installs the same seg6 routes ([FRRouting](frrouting.md))
- **eBPF** - `End.BPF` and XDP/TC programs for custom behaviors ([Vinbero](vinbero.md), [Cilium](cilium.md))

## Further Reading

- :material-arrow-right: [SRv6 Support Matrix](support-matrix.md) - The kernel next to FRR, VPP and vendor routers, behavior by behavior
- :material-arrow-right: [Network Programming](../topics/network-programming.md) - What each behavior does, per RFC 8986
- :material-arrow-right: [Containerlab](../labs/containerlab.md) - Build a multi-node Linux SRv6 lab
- :material-arrow-right: [FRRouting](frrouting.md) - Add routing protocol support
- :material-arrow-right: [Host-Based SRv6](../topics/host-based-srv6.md) - SRv6 from end hosts and containers
- :material-arrow-right: [Security](../topics/security.md#implementation-vulnerabilities) - Kernel SRv6 CVEs such as CVE-2026-23442

## References

1. [Seg6 sysctl variables - Linux kernel documentation](https://docs.kernel.org/networking/seg6-sysctl.html) - Official documentation for seg6_enabled, seg6_require_hmac and seg6_flowlabel
2. [ip-route(8)](https://man7.org/linux/man-pages/man8/ip-route.8.html) and [ip-sr(8)](https://man7.org/linux/man-pages/man8/ip-sr.8.html) - iproute2 man pages for seg6/seg6local routes, tunsrc and HMAC
3. [seg6_local.c at v7.3](https://github.com/torvalds/linux/blob/v7.3/net/ipv6/seg6_local.c) - Kernel implementation of every seg6local behavior and flavor
4. [ipv6: sr: implement several seg6local actions](https://github.com/torvalds/linux/commit/140f04c33bbc) - The 4.14 commit that introduced End, End.X, End.DX6, End.B6 and End.B6.Encaps
5. [seg6: add support for the SRv6 End.DT4 behavior](https://github.com/torvalds/linux/commit/664d6f86868b) - End.DT4 and the VRF strict-mode requirement (5.11)
6. [seg6: add support for SRv6 H.Encaps.Red behavior](https://github.com/torvalds/linux/commit/b07c8cdbe918) - Reduced encapsulation (6.0)
7. [seg6: add NEXT-C-SID support for SRv6 End behavior](https://github.com/torvalds/linux/commit/848f3c0d4769) - uSID support in End (6.1); End.X followed in 6.6 ([7458575a07f1](https://github.com/torvalds/linux/commit/7458575a07f1))
8. [seg6: add per-route tunnel source address](https://github.com/torvalds/linux/commit/78723a62b969) - Per-route `tunsrc` (7.1)
9. [SRv6 - Linux Kernel Implementation](https://segment-routing.org/) - Community resource for SRv6 installation, configuration, and advanced usage on Linux
10. [IPv6 Segment Routing - LWN.net](https://lwn.net/Articles/722804/) - LWN.net coverage of SRv6 merging into the Linux kernel
11. [SRv6 Network Programming in Linux Kernel - Netdev 0x16](https://netdevconf.info/0x16/sessions/workshop/srv6-network-programming-in-linux-kernel.html) - Workshop on SRv6 network programming at the Netdev conference
12. [RFC net-next v5: seg6: add support for the SRv6 End.MAP behavior](https://patchwork.kernel.org/project/netdevbpf/cover/20261002-seg6-mobile-end-map-v5-0-30eec37563a8@gmail.com/) - Latest End.MAP kernel series (2 October 2026, unmerged)
13. [RFC iproute2-next v5: End.MAP under seg6mobile encap](https://patchwork.kernel.org/project/netdevbpf/cover/20261002-seg6-mobile-end-map-v5-0-92ac9b315d23@gmail.com/) - Matching iproute2 series
14. [net-next v2: seg6: add SRv6 Mobile User Plane (RFC 9433) behaviors](https://patchwork.kernel.org/project/netdevbpf/cover/20260505-seg6-mobile-v2-0-9e8022bdfdb6@gmail.com/) - The original all-in-one MUP series (May 2026)
