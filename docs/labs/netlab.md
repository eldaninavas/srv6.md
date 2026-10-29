---
title: netlab
seo_title: "SRv6 Lab with netlab: Ready-Made Multi-Vendor Topologies"
description: "Spin up preconfigured SRv6 labs with netlab: IS-IS, unnumbered core, multivendor, IPv4 islands, BGP-free core and L3VPN topologies on FRR, IOS XE/XR and Junos."
tags:
  - labs
  - netlab
  - docker
---

# SRv6 Lab with netlab

[netlab](https://netlab.tools/) builds a network design, addressing, and topology from a high-level infrastructure-as-code description, deploys containers or virtual machines using *[containerlab](containerlab.md)* or *Vagrant*, and configures the network devices. It's by far the most convenient way to get a working SRv6 lab, regardless of whether you want to practice configuring SRv6 or just kick its tires.

## Prerequisites

- [Install netlab](https://netlab.tools/install/)
- Use **[netlab install containerlab ansible](https://netlab.tools/netlab/install/)** to install containerlab, Docker, and Ansible

## Sample IS-IS + SRv6 Topology

Create a file `topology.yml` in an empty directory:

```yaml
addressing:                     # Define IPv6 address pools
  p2p.ipv6: 2001:1::/48         # SRv6 requires ipv6 addresses on interfaces
  loopback.ipv6: 2001:db8::/48  # Loopback IPv6 addresses can't hurt ;)

defaults.device: frr            # We'll use FRRouting ...
provider: clab                  # ... containers orchestrated with containerlab

module: [ isis, srv6 ]          # All devices are running IS-IS and SRv6
nodes: [ pe1, p, pe2 ]          # The lab topology has three nodes
links: [ pe1-p, p-pe2 ]         # And two links between them
```

You don't need initial device configurations; netlab will:

* Design the IS-IS routing protocol (not too hard with three nodes and one area),
* Allocate IPv4 and IPv6 addresses to links and interfaces,
* Allocate SRv6 SIDs to individual nodes,
* Create interface, IS-IS, and SRv6 configurations for all devices,
* Deploy the configurations to FRRouting containers using a combination of **bash** and **vtysh** scripts.

## Deploy

```bash
# Start the lab
netlab up

# Check lab status
netlab status

# Connect to a node
netlab connect pe1

# Destroy the lab
netlab down --cleanup
```

Useful netlab [reports](https://netlab.tools/netlab/report/):

* **netlab report devices** -- nodes, node IDs, device types, and device images
* **netlab report wiring** -- lab nodes and links
* **netlab report addressing** -- lab addressing
* **netlab report isis-nodes** -- IS-IS routing
* **netlab report mgmt** -- Management access to lab devices

Check also [netlab graphs](https://netlab.tools/netlab/graph/) (although the topology is trivial enough to visualize without one).

## Sample IS-IS Topology

Use this topology (stored in `topology.yml`) if you want to practice SRv6 configuration in an already-configured IS-IS network:

```yaml
addressing:                     # Define IPv6 address pools
  p2p.ipv6: 2001:1::/48         # SRv6 requires ipv6 addresses on interfaces
  loopback.ipv6: 2001:db8::/48  # Loopback IPv6 addresses can't hurt ;)

defaults.device: frr            # We'll use FRRouting ...
provider: clab                  # ... containers orchestrated with containerlab

module: [ isis ]                # All devices are running IS-IS
nodes: [ pe1, p, pe2 ]          # The lab topology has three nodes
links: [ pe1-p, p-pe2 ]         # And two links between them
```

## Verify SRv6

```bash
# Check SRv6 SIDs
netlab connect pe1 vtysh -c "show ipv6 route"

# Check IS-IS topology database
netlab connect pe1 vtysh -c "show isis database detail"
```

## Ready-Made SRv6 Topologies

Instead of writing your own topology, you can start from the [ipspace/srv6-examples](https://github.com/ipspace/srv6-examples) collection — ready-to-run netlab topologies published by Ivan Pepelnjak ([announcement](https://blog.ipspace.net/2026/10/srv6-examples/)) and organized in two tracks:

**Introductory**

| Topology | What it demonstrates | Lab |
|----------|---------------------|:---:|
| **SRv6 with IS-IS** | Basic SRv6 forwarding with IS-IS as the IGP | [:material-github:](https://github.com/ipspace/srv6-examples/blob/main/1-intro/1-isis) |
| **Unnumbered core** | SRv6 over core links with link-local addresses only | [:material-github:](https://github.com/ipspace/srv6-examples/blob/main/1-intro/2-unnumbered) |
| **Multivendor SRv6** | Interoperability across different vendor platforms | [:material-github:](https://github.com/ipspace/srv6-examples/blob/main/1-intro/3-multivendor) |

**Services**

| Topology | What it demonstrates | Lab |
|----------|---------------------|:---:|
| **IPv4 islands** | IPv4 networks carried over an SRv6-enabled IPv6 core | [:material-github:](https://github.com/ipspace/srv6-examples/blob/main/2-services/1-ipv4-islands) |
| **BGP-free IPv6 core** | IPv6 core with no BGP on transit nodes | [:material-github:](https://github.com/ipspace/srv6-examples/blob/main/2-services/2-bgp-free-ipv6) |
| **L3VPN over SRv6** | MPLS-style L3VPN services over an SRv6 core | [:material-github:](https://github.com/ipspace/srv6-examples/blob/main/2-services/3-mpls-vpn) |

Each lab directory is self-contained; see the collection's [getting started guide](https://github.com/ipspace/srv6-examples/blob/main/docs/use.md) and the [netlab SRv6 module](https://netlab.tools/module/srv6/#module-srv6-platform) for the list of supported platforms.

## Further Reading

- :material-arrow-right: [Linux Kernel SRv6](../implementations/linux-kernel.md)
- :material-arrow-right: [FRRouting](../implementations/frrouting.md)
- :material-web: [netlab documentation](https://netlab.tools)
- :material-web: [Sample SRv6 lab topologies](https://github.com/ipspace/srv6-examples)

## References

1. [netlab Documentation](https://netlab.tools) - Official netlab documentation site with installation, usage, and topology reference
2. [netlab GitHub Repository](https://github.com/ipspace/netlab) - Source code, releases, and issue tracking for netlab
3. [Sample netlab SRv6 lab topologies](https://github.com/ipspace/srv6-examples) - Ready-to-run introductory and services topologies
4. [Sample netlab SRv6 Lab Topologies (ipSpace.net)](https://blog.ipspace.net/2026/10/srv6-examples/) - Ivan Pepelnjak's announcement post for the srv6-examples collection
5. [netlab 26.10 Release Notes](https://blog.ipspace.net/2026/10/netlab-26-10/) - Release adding the SRv6 configuration module
6. [More netlab Examples](https://github.com/ipspace/netlab-examples) - Curated collection of lab topology examples for various network scenarios
