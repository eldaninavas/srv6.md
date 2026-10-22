---
title: Containerlab
seo_title: "SRv6 Lab with Containerlab: Step-by-Step Topology"
description: "Free SRv6 lab with Containerlab and FRRouting: IS-IS uSID locators, an SRv6 path steered through a transit node, and SRH checks at packet level."
tags:
  - labs
  - containerlab
  - docker
---

# SRv6 Lab with Containerlab

[Containerlab](https://containerlab.dev) lets you build network topologies using containers. It's the fastest way to get a working SRv6 lab.

This lab builds a three-router triangle running FRRouting. IS-IS provides IPv6 reachability and advertises an SRv6 uSID locator per router. Then an SRv6 policy on `r1` forces traffic for `r3` through `r2`, even though the IGP shortest path is the direct `r1`–`r3` link, and you verify every hop at packet level.

```
         r2  fc00:0:2::/48
   eth1 /  \ eth2
       /    \
 eth1 /      \ eth1
    r1 ------ r3
       eth2  eth2
 fc00:0:1::/48   fc00:0:3::/48
```

| Node | Loopback | SRv6 locator | Static SID |
|------|----------|--------------|------------|
| r1 | `2001:db8::1` | `fc00:0:1::/48` | — (headend) |
| r2 | `2001:db8::2` | `fc00:0:2::/48` | `fc00:0:2:e000::` End |
| r3 | `2001:db8::3` | `fc00:0:3::/48` | `fc00:0:3:e000::` End.DT6 |

## Prerequisites

- Docker installed
- Containerlab installed (`bash -c "$(curl -sL https://get.containerlab.dev)"`)
- A Linux kernel with SRv6 support (`CONFIG_IPV6_SEG6_LWTUNNEL`). Any recent distribution kernel works; this lab was tested on kernel 7.2 (OrbStack) with FRR 10.2.1.

## Lab Files

Create this directory layout:

```
srv6-lab/
├── srv6-lab.clab.yml
├── r1/  daemons  frr.conf  vtysh.conf
├── r2/  daemons  frr.conf  vtysh.conf
└── r3/  daemons  frr.conf  vtysh.conf
```

### Topology

`srv6-lab.clab.yml`:

```yaml
name: srv6-lab

topology:
  defaults:
    kind: linux
    image: quay.io/frrouting/frr:10.2.1
    sysctls:
      net.ipv6.conf.all.disable_ipv6: 0
      net.ipv6.conf.all.forwarding: 1
      net.ipv6.conf.all.seg6_enabled: 1
      net.ipv6.conf.default.seg6_enabled: 1

  nodes:
    r1:
      binds:
        - r1/daemons:/etc/frr/daemons
        - r1/frr.conf:/etc/frr/frr.conf
        - r1/vtysh.conf:/etc/frr/vtysh.conf
      exec: &exec
        # No IPv6 default route via the management network:
        # if a lab route is missing, traffic must fail instead of leaking out eth0
        - ip -6 route del default dev eth0
        - sysctl -w net.ipv6.conf.eth1.seg6_enabled=1
        - sysctl -w net.ipv6.conf.eth2.seg6_enabled=1
    r2:
      binds:
        - r2/daemons:/etc/frr/daemons
        - r2/frr.conf:/etc/frr/frr.conf
        - r2/vtysh.conf:/etc/frr/vtysh.conf
      exec: *exec
    r3:
      binds:
        - r3/daemons:/etc/frr/daemons
        - r3/frr.conf:/etc/frr/frr.conf
        - r3/vtysh.conf:/etc/frr/vtysh.conf
      exec: *exec

  links:
    - endpoints: ["r1:eth1", "r2:eth1"]
    - endpoints: ["r2:eth2", "r3:eth1"]
    - endpoints: ["r1:eth2", "r3:eth2"]
```

!!! warning "The management network hides mistakes"
    Containerlab gives every node an IPv6 default route through `eth0`, the management network. If an IS-IS route is missing, a ping to a loopback will silently leave the lab through `eth0` and may even get a reply. The `exec` block removes that route so that broken forwarding fails visibly.

### FRR daemons

`daemons` is the same on all three routers:

```ini
zebra=yes
mgmtd=yes
isisd=yes
staticd=yes
bgpd=no
ospfd=no
ospf6d=no
ripd=no
ripngd=no
pimd=no
ldpd=no
nhrpd=no
eigrpd=no
babeld=no
sharpd=no
pbrd=no
bfdd=no
fabricd=no
vrrpd=no
pathd=no

vtysh_enable=yes
zebra_options="  -A 127.0.0.1 -s 90000000"
mgmtd_options="  -A 127.0.0.1"
isisd_options="  -A 127.0.0.1"
staticd_options="-A 127.0.0.1"
```

`vtysh.conf` is also identical on all routers:

```
service integrated-vtysh-config
```

### FRR configuration

The core links have no global addresses: IS-IS uses IPv6 link-local next hops. Each router only differs in its hostname, loopback, NET and locator.

=== "r1"

    ```
    frr version 10.2.1
    frr defaults traditional
    hostname r1
    !
    segment-routing
     srv6
      locators
       locator MAIN
        prefix fc00:0:1::/48 block-len 32 node-len 16 func-bits 16
        behavior usid
       exit
      exit
     exit
    exit
    !
    interface lo
     ipv6 address 2001:db8::1/128
     ipv6 router isis CORE
     isis passive
    exit
    !
    interface eth1
     ipv6 router isis CORE
     isis network point-to-point
    exit
    !
    interface eth2
     ipv6 router isis CORE
     isis network point-to-point
    exit
    !
    router isis CORE
     is-type level-2-only
     net 49.0001.0000.0000.0001.00
     segment-routing srv6
      locator MAIN
     exit
    exit
    ```

=== "r2"

    ```
    frr version 10.2.1
    frr defaults traditional
    hostname r2
    !
    segment-routing
     srv6
      locators
       locator MAIN
        prefix fc00:0:2::/48 block-len 32 node-len 16 func-bits 16
        behavior usid
       exit
      exit
     exit
    exit
    !
    interface lo
     ipv6 address 2001:db8::2/128
     ipv6 router isis CORE
     isis passive
    exit
    !
    interface eth1
     ipv6 router isis CORE
     isis network point-to-point
    exit
    !
    interface eth2
     ipv6 router isis CORE
     isis network point-to-point
    exit
    !
    router isis CORE
     is-type level-2-only
     net 49.0001.0000.0000.0002.00
     segment-routing srv6
      locator MAIN
     exit
    exit
    ```

=== "r3"

    ```
    frr version 10.2.1
    frr defaults traditional
    hostname r3
    !
    segment-routing
     srv6
      locators
       locator MAIN
        prefix fc00:0:3::/48 block-len 32 node-len 16 func-bits 16
        behavior usid
       exit
      exit
     exit
    exit
    !
    interface lo
     ipv6 address 2001:db8::3/128
     ipv6 router isis CORE
     isis passive
    exit
    !
    interface eth1
     ipv6 router isis CORE
     isis network point-to-point
    exit
    !
    interface eth2
     ipv6 router isis CORE
     isis network point-to-point
    exit
    !
    router isis CORE
     is-type level-2-only
     net 49.0001.0000.0000.0003.00
     segment-routing srv6
      locator MAIN
     exit
    exit
    ```

## Deploy

```bash
# Start the lab
sudo containerlab deploy -t srv6-lab.clab.yml

# Check status
sudo containerlab inspect -t srv6-lab.clab.yml

# Connect to a node
docker exec -it clab-srv6-lab-r1 vtysh

# Destroy the lab
sudo containerlab destroy -t srv6-lab.clab.yml --cleanup
```

IS-IS takes around 30 seconds to converge after deployment. Wait until `show ipv6 route isis` on `r1` lists the remote loopbacks before testing.

## Verify the Control Plane

```bash
# IS-IS adjacencies to r2 and r3
docker exec clab-srv6-lab-r1 vtysh -c "show isis neighbor"

# Local SRv6 locator
docker exec clab-srv6-lab-r1 vtysh -c "show segment-routing srv6 locator"

# Remote loopbacks and locators learned via IS-IS
docker exec clab-srv6-lab-r1 vtysh -c "show ipv6 route isis"

# SRv6 Locator TLV and End.X SIDs advertised by r2
docker exec clab-srv6-lab-r1 vtysh -c "show isis database detail r2.00-00"
```

`r1` should have routes to `2001:db8::2/128`, `2001:db8::3/128`, `fc00:0:2::/48` and `fc00:0:3::/48` via link-local next hops. IS-IS also allocates one End.X SID per adjacency and installs it in the kernel:

```bash
docker exec clab-srv6-lab-r2 ip -6 route show | grep seg6local
```

```
fc00:0:2:1::/64 ... encap seg6local action End.X nh6 fe80::... flavors next-csid lblen 32 nflen 16 dev eth1 proto isis
fc00:0:2:2::/64 ... encap seg6local action End.X nh6 fe80::... flavors next-csid lblen 32 nflen 16 dev eth2 proto isis
```

!!! note "Dynamic End.X SIDs"
    The function part of each End.X SID (`:1::`, `:2::`) is allocated dynamically and can map to a different adjacency after every deployment, so this lab uses static SIDs with predictable values for the explicit path below.

Without any SRv6 policy, traffic from `r1` to `r3` follows the IGP shortest path over the direct link:

```bash
docker exec clab-srv6-lab-r1 ip -6 route get 2001:db8::3
# 2001:db8::3 via fe80::... dev eth2 proto isis src 2001:db8::1 metric 20

docker exec clab-srv6-lab-r1 ping -6 -c3 -I 2001:db8::1 2001:db8::3
```

## Steer Traffic Through r2 with SRv6

Program two SIDs inside the locators that IS-IS already advertises, so they are reachable from every router:

```bash
# r2: End — advance to the next segment in the SRH
docker exec clab-srv6-lab-r2 ip -6 route add fc00:0:2:e000::/128 \
  encap seg6local action End dev eth1

# r3: End.DT6 — decapsulate and look up the inner IPv6 destination
docker exec clab-srv6-lab-r3 ip -6 route add fc00:0:3:e000::/128 \
  encap seg6local action End.DT6 table 255 dev eth1
```

!!! warning "End.DT6 and the local table"
    `table 255` is the kernel's **local** table, where the router's own addresses live. With `table 254` (main), `r3` decapsulates the packet but cannot find `2001:db8::3` and drops it, incrementing `Ip6InNoRoutes` in `/proc/net/snmp6`. Use `table 254` instead when the decapsulated traffic is destined to hosts behind `r3`.

On `r1`, set the source address of the outer header and add an SRv6 encapsulation route for `r3`'s loopback. The lower metric makes it win over the IS-IS route (metric 20):

```bash
docker exec clab-srv6-lab-r1 ip sr tunsrc set 2001:db8::1

docker exec clab-srv6-lab-r1 ip -6 route add 2001:db8::3/128 metric 1 \
  encap seg6 mode encap segs fc00:0:2:e000::,fc00:0:3:e000:: dev eth1

docker exec clab-srv6-lab-r1 ip -6 route get 2001:db8::3
# 2001:db8::3 encap seg6 mode encap segs 2 [ fc00:0:2:e000:: fc00:0:3:e000:: ] dev eth1 src 2001:db8::1 metric 1

docker exec clab-srv6-lab-r1 ping -6 -c3 -I 2001:db8::1 2001:db8::3
```

Echo requests now travel `r1 → r2 → r3` inside SRv6, while echo replies return directly from `r3` to `r1` over the IGP path. The policy only affects traffic sourced at `r1`.

## Verify at Packet Level

The FRR image has no `tcpdump`, but you can attach a [netshoot](https://github.com/nicolaka/netshoot) container to a node's network namespace. Run each capture in its own terminal while pinging from `r1`:

```bash
# Ingress of r2, from r1
docker run --rm -it --net container:clab-srv6-lab-r2 nicolaka/netshoot \
  tcpdump -ni eth1 -vv 'ip6[6]==43'

# Ingress of r3, from r2
docker run --rm -it --net container:clab-srv6-lab-r3 nicolaka/netshoot \
  tcpdump -ni eth1 -vv 'ip6[6]==43'
```

The filter `ip6[6]==43` matches IPv6 packets whose next header is a Routing Header. At `r2` you should see:

```
IP6 (hlim 64, next-header Routing (43), payload length 144) 2001:db8::1 > fc00:0:2:e000::: RT6 (len=4, type=4, segleft=1, last-entry=1, ... [0]fc00:0:3:e000::, [1]fc00:0:2:e000::) IP6 (hlim 64, next-header ICMPv6 (58), payload length 64) 2001:db8::1 > 2001:db8::3: ICMP6, echo request
```

And at `r3`:

```
IP6 (hlim 63, next-header Routing (43), payload length 144) 2001:db8::1 > fc00:0:3:e000::: RT6 (len=4, type=4, segleft=0, last-entry=1, ... [0]fc00:0:3:e000::, [1]fc00:0:2:e000::) IP6 (hlim 64, next-header ICMPv6 (58), payload length 64) 2001:db8::1 > 2001:db8::3: ICMP6, echo request
```

What to look for:

- **Outer header**: source is the `tunsrc` address, destination is the active segment.
- **SRH segment list** is encoded in reverse order: `[0]` is the last segment, `[1]` the first ([RFC 8754](../rfcs/rfc8754.md)).
- **End at r2**: `segleft` drops from 1 to 0, the destination address is replaced by the next segment, and the outer hop limit drops from 64 to 63. The inner packet is untouched.
- **End.DT6 at r3**: with `segleft=0`, `r3` removes the outer header and SRH and delivers the inner ICMPv6 packet ([RFC 8986](../rfcs/rfc8986.md)).

## Clean Up the Policy

```bash
docker exec clab-srv6-lab-r1 ip -6 route del 2001:db8::3/128 metric 1
docker exec clab-srv6-lab-r2 ip -6 route del fc00:0:2:e000::/128
docker exec clab-srv6-lab-r3 ip -6 route del fc00:0:3:e000::/128
```

## Further Reading

- :material-arrow-right: [SRH Packet Walk](../topics/srh-packet-walk.md)
- :material-arrow-right: [SRv6 Packet Captures](pcaps.md) - Reference pcaps with Wireshark SRH filters
- :material-arrow-right: [SRv6 Network Programming](../topics/network-programming.md)
- :material-arrow-right: [Linux Kernel SRv6](../implementations/linux-kernel.md)
- :material-arrow-right: [FRRouting](../implementations/frrouting.md)
- :material-web: [Containerlab docs](https://containerlab.dev)

## References

1. [Containerlab Documentation](https://containerlab.dev) - Official Containerlab documentation site with installation, usage, and topology reference
2. [Containerlab GitHub Repository](https://github.com/srl-labs/containerlab) - Source code, releases, and issue tracking for Containerlab
3. [Containerlab Lab Examples](https://containerlab.dev/lab-examples/lab-examples/) - Curated collection of lab topology examples for various network scenarios
4. [SRv6 Labs Repository (segmentrouting/srv6-labs)](https://github.com/segmentrouting/srv6-labs) - Containerlab-based SRv6 test topologies with starter configs and use-case scenarios
5. [FRRouting SRv6 documentation](https://docs.frrouting.org/en/latest/zebra.html#segment-routing-ipv6) - Locator and SRv6 configuration reference for FRR
6. [netshoot](https://github.com/nicolaka/netshoot) - Network troubleshooting container used for packet captures
