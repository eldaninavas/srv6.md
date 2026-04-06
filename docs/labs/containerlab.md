---
title: Containerlab
description: Build SRv6 labs with Containerlab
tags:
  - labs
  - containerlab
  - docker
---

# SRv6 Lab with Containerlab

[Containerlab](https://containerlab.dev) lets you build network topologies using containers. It's the fastest way to get a working SRv6 lab.

## Prerequisites

- Docker installed
- Containerlab installed (`bash -c "$(curl -sL https://get.containerlab.dev)"`)

## Sample Topology

Create a file `srv6-lab.clab.yml`:

```yaml
name: srv6-lab

topology:
  nodes:
    r1:
      kind: linux
      image: frrouting/frr:latest
      binds:
        - r1/daemons:/etc/frr/daemons
        - r1/frr.conf:/etc/frr/frr.conf
    r2:
      kind: linux
      image: frrouting/frr:latest
      binds:
        - r2/daemons:/etc/frr/daemons
        - r2/frr.conf:/etc/frr/frr.conf
    r3:
      kind: linux
      image: frrouting/frr:latest
      binds:
        - r3/daemons:/etc/frr/daemons
        - r3/frr.conf:/etc/frr/frr.conf

  links:
    - endpoints: ["r1:eth1", "r2:eth1"]
    - endpoints: ["r2:eth2", "r3:eth1"]
    - endpoints: ["r1:eth2", "r3:eth2"]
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
sudo containerlab destroy -t srv6-lab.clab.yml
```

## Verify SRv6

```bash
# On r1: Check SRv6 SIDs
docker exec clab-srv6-lab-r1 ip -6 route show | grep seg6local

# Ping through SRv6 path
docker exec clab-srv6-lab-r1 ping6 fc00:0:3::1
```

## Further Reading

- :material-arrow-right: [Linux Kernel SRv6](../implementations/linux-kernel.md)
- :material-arrow-right: [FRRouting](../implementations/frrouting.md)
- :material-web: [Containerlab docs](https://containerlab.dev)
