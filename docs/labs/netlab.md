---
title: netlab
description: Build SRv6 labs with netlab
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

module: [ isis ]                # All devices are running IS-IS and SRv6
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

## Further Reading

- :material-arrow-right: [Linux Kernel SRv6](../implementations/linux-kernel.md)
- :material-arrow-right: [FRRouting](../implementations/frrouting.md)
- :material-web: [netlab documentation](https://netlab.tools)
- :material-web: [Sample SRv6 lab topologies](https://github.com/ipspace/srv6-examples)

## References

1. [netlab Documentation](https://netlab.tools) - Official netlab documentation site with installation, usage, and topology reference
2. [netlab GitHub Repository](https://github.com/ipspace/netlab) - Source code, releases, and issue tracking for netlab
3. [Sample netlab SRv6 lab topologies](https://github.com/ipspace/srv6-examples)
3. [More netlab Examples](https://github.com/ipspace/netlab-examples) - Curated collection of lab topology examples for various network scenarios
