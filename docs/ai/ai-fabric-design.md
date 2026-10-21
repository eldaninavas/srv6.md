---
title: SRv6 AI Fabric Design
seo_title: "SRv6 AI Fabric Design: uSID Plan for GPU Backend Networks"
description: "Design an SRv6 uSID AI backend fabric: multi-plane Clos, uSID addressing plan, static per-switch tables, SONiC CONFIG_DB and FRR config, NIC encapsulation, hardware support and security."
tags:
  - ai
  - design
  - usid
  - sonic
  - gpu
  - data-center
---

# SRv6 AI Fabric Design

This page turns the public designs behind [MRC](mrc.md) and the IETF draft [*SRv6 for Deterministic Path Placement in AI Backends*](https://datatracker.ietf.org/doc/draft-filsfils-srv6ops-srv6-ai-backend/) into a practical blueprint for building an SRv6 uSID GPU backend fabric. The model is simple. The **switches are static SRv6 transit nodes**, the **NIC writes the path** of every packet into the IPv6 destination address, and an **orchestrator** tells the NICs which paths exist.

!!! abstract "The design in five lines"
    1. Two-tier Clos, split into parallel **planes** (4 or 8) so it reaches 100K+ GPUs without a third tier.
    2. One SRv6 **block** for the fabric and one 16-bit **uN uSID** per switch (plus uSIDs for last-hop ports).
    3. **Static tables** on every switch: its own uSID plus one /48 route per neighbor. No BGP or IGP is needed for the backend.
    4. The **NIC** encapsulates RoCEv2 in an outer IPv6 header whose destination address is the path: up to six uSIDs, no SRH, 40 bytes of overhead.
    5. The **transport** (MRC or similar) sprays across many paths and abandons failing ones; **probes** use the same encoding to test every link.

## Roles

| Role | Responsibility | Changes at run time? |
|------|----------------|:--------------------:|
| **Orchestrator** | Discovers topology and uSIDs at bring-up; gives each NIC its path templates | Rarely (topology changes) |
| **Switch** | uN shift-and-forward on static /48 routes | **No** |
| **NIC** | Builds the uSID path per packet, encapsulates and decapsulates, reacts to ECN, trims, loss | Per packet |
| **Host agent** | Probes paths, maintains denylists, configures NIC path profiles | Continuously |

The IETF draft is explicit that this "is not switch adaptive routing": switches never change their decisions. Only the source does.

## Step 1: Topology

Use the multi-plane two-tier Clos described in the MRC paper:

- Break each 800G NIC into **8 × 100G** (or 4 × 200G) ports, one per plane.
- In each plane, 51.2 Tb/s switches run as **512 × 100G**. A T0 has 256 NIC-facing ports and 256 uplinks, and a T1 connects to 512 T0s.
- Capacity: **512 T0 × 256 NICs = 131,072 GPUs** in two tiers. Microsoft has shown variants of the design up to 524,288 GPUs.
- Paths: T0-local (NIC → T0 → NIC) or cross-T1 (NIC → T0 → T1 → T0 → NIC). Every path stays inside one plane.

The draft's minimal example is the same idea at small scale: two spines, four leaves, and NICs dual-homed to two leaves.

## Step 2: Addressing plan

Pick one block for the backend: the IANA SRv6 block `5f00::/16` ([RFC 9602](../rfcs/rfc9602.md)) or a ULA such as `fcbb:bb00::/32`. The IETF draft uses `5f00:0::/32`, and the MRC paper uses a **32-bit block followed by 16-bit uSIDs** (the F3216 format of [RFC 9800](../rfcs/rfc9800.md)).

Each switch gets one 16-bit uN uSID. MRC's NICs copy the **plane number into every uSID**, so it pays to make the plane a field of the uSID. One possible plan for 8 planes:

```
16-bit uSID = | type (2) | plane (3) | index (11) |
  type 00 = T0 switch     index 0-511
  type 01 = T1 switch     index 0-255
  type 10 = last-hop port index 0-255 (the T0 downlink to a NIC)
```

!!! note "Illustrative plan"
    This bit layout is an example built on the published constraints: 16-bit uN uSIDs, the plane copied into each uSID, and the last hop encoded as a port. The MRC paper does not publish its own numbering. Any scheme works if uSIDs are unique within a plane and a NIC can compute them from the plane and indices.

A cross-T1 path then looks like this:

```
DA = block | T0(src) | T1 | T0(dst) | PORT(dst) | 0000 | 0000
```

Four uSIDs fit with room to spare. Six uSIDs fit in the destination address without an SRH, which is enough to pin a five-hop path through a three-tier Clos (leaf, spine, super-spine, spine, leaf). An SRH is needed only beyond six instructions.

The IETF draft walks through the same encoding on its small example:

```
GPU1 → GPU3 via Leaf1, Spine5, Leaf3:   5f00:0:0100:0500:0300::
GPU2 → GPU3 via Leaf2, Spine6, Leaf4:   5f00:0:0200:0600:0400::
Avoid congested Spine5 (NIC rewrite):   5f00:0:0100:0600:0300::
```

## Step 3: Static switch tables

Each switch needs exactly:

| Switch | Entries | Count (8-plane, 131K GPUs) |
|--------|---------|:--------------------------:|
| T0 | its own uN SID; a /48 route to each T1's uSID (uplink); a /48 route to each port uSID (downlink) | 1 + 256 + 256 = **513** |
| T1 | its own uN SID; a /48 route to each T0's uSID (downlink) | 1 + 512 = **513** |

The table size grows with the switch radix, not with the number of paths, flows or GPUs, and it is written once. The MRC paper describes these routes as configured at install time and generally never changed. Microsoft's NANOG 96 example uses the same pattern: static uN SIDs as /48s plus a static route to each neighbor's SID.

### SONiC

Since SONiC **202505**, static SRv6 is configured in CONFIG_DB with two tables, which bgpcfgd compiles into FRR (the 202505 release notes rate the feature Alpha). This is the format from the SONiC static SRv6 design document:

```json
{
  "SRV6_MY_LOCATORS": {
    "loc1": { "prefix": "FCBB:BB00:0103::", "block_len": "32", "node_len": "16", "func_len": "16", "arg_len": "0" }
  },
  "SRV6_MY_SIDS": {
    "loc1|FCBB:BB00:0103::/48": { "action": "uN", "decap_dscp_mode": "pipe" }
  }
}
```

bgpcfgd renders it as FRR static SIDs:

```
segment-routing
 srv6
  locators
   locator loc1
    prefix fcbb:bb00:103::/48 block-len 32 node-len 16 func-bits 16
    behavior usid
  static-sids
   sid fcbb:bb00:103::/48 locator loc1 behavior uN
```

The neighbor routes (`fcbb:bb00:<neighbor uSID>::/48` pointing at the port that faces that neighbor) are ordinary static IPv6 routes.

| SONiC release | SRv6 static configuration via CONFIG_DB | FRR |
|---------------|------------------------------------------|-----|
| **202505** | uN, uDT46 | 10.3 |
| **202511** | uN, uDT46 (FRR itself also supports static uA) | 10.4.1 |
| **202605** | uN, uDT46 | 10.5.4 |
| **master** (Aug 2026 onward) | adds **uA** with `interface` and optional `adj` fields | 10.7.1 |

The SAI and orchagent layers already map uN, uA, uDT4/6/46 and uDX4/6 to the ASIC. See [SONiC](../implementations/sonic.md) and [SONiC & SAI](../topics/sonic-sai.md).

### uN or uA?

- **uN** names a switch. The switch forwards the shifted address on its route to the next uSID, so a T0 that has several parallel links to the same T1 still hashes across them.
- **uA** names a specific link (an adjacency). It is the tool for pinning one member of a bundle. OpenAI's Clustermapper team asked vendors at OCP 2026 for exactly this: a supported way to select individual links among parallel adjacencies.

The MRC deployment uses uN. Meta's SRv6 backbone uses uA ([scale-across](scale-across.md)). The IETF draft allows either.

## Step 4: The NIC

- **Encapsulation**: H.Encaps.Red, which places the path in the outer destination address with no SRH when it fits. The inner IPv6 destination is the remote NIC's own address, which it uses to recognize and decapsulate the packet.
- **Path set**: per connection, a set of paths (MRC: 128–256 entropy values) spread evenly across planes. The orchestrator provides a template per destination group, and the NIC fills in the plane and uplink fields.
- **Reaction**: on ECN, the NIC deprioritizes a path for a while; on untrimmed loss, it retires the path at once and uses a backup; background probes restore paths that recover.
- **Hardware**: AMD lists "NIC-based source routing (SR/SRv6)" for its Vulcano 800G AI NIC. ConnectX-8, Pollara and Thor Ultra run MRC over SRv6 in the published clusters.

For lab work, Linux can play the NIC role. With `encap.red` and a single uSID container, no SRH is added (see [SRv6 on Linux](../implementations/linux-kernel.md)):

```bash
# Path to the remote GPU host: src T0 0103 -> T1 0b07 -> dst T0 0141 -> port 0012
ip -6 route add 2001:db8:3::3/128 \
  encap seg6 mode encap.red segs fcbb:bb00:0103:0b07:0141:0012:: dev eth0
```

## Step 5: Telemetry and probing

Give every host the ability to probe paths that loop back to itself through a T0 and through each T1, and run the probes continuously. This is what turns a static fabric into a well-observed one. See [AI Fabric Telemetry](ai-fabric-telemetry.md).

## Hardware support (published)

| Vendor | Published SRv6 capability relevant to AI backends |
|--------|---------------------------------------------------|
| NVIDIA | Spectrum-4/5 with Cumulus or SONiC forward SRv6 for MRC (MRC paper). Cumulus Linux 5.18 documents static uN and uA on Spectrum-4. |
| Arista | EOS on Broadcom Tomahawk 5 forwards SRv6 for MRC. EOS 4.36.2F documents uN (NEXT-CSID) in F3216 format. |
| Broadcom | Tomahawk 5 switches and Thor Ultra NICs in the MRC clusters. |
| Cisco | Silicon One G200 is marketed with native SRv6 uSID for GPU-to-GPU path steering. SRv6 on a SONiC system depends on the vendor's SAI implementation, so confirm uSID support for the specific Silicon One platform and SONiC image. |
| AMD | Vulcano NIC: NIC-based SR/SRv6 source routing; Pollara and Vulcano run MRC. |

Check each vendor's current documentation for the exact behaviors and formats, because support differs. Arista's documentation lists F3216 only and H.Encaps.Red as unsupported on the switch, which matters if the switch rather than the NIC is the head-end.

## Security

A host that can write any SRv6 path can steer traffic anywhere in the fabric. The IETF draft recommends:

- limiting which workloads may originate SRv6 traffic;
- constraining hosts to paths the orchestrator has authorized;
- keeping the backend block unreachable from the frontend and the Internet, and filtering it at every boundary ([SRv6 Security](../topics/security.md), [SID block filtering](../topics/sid-structure.md#filtering-5f0016-at-domain-boundaries)).

For multi-tenant GPU clouds, adding a VPN service SID (for example uDT46 in a tenant VRF) at the end of the path separates tenants on the same fabric.

## Checklist

- [x] Planes, radix and tiers sized for the target GPU count
- [x] One block; uSIDs unique per plane; plane encoded in the uSID
- [x] Static uN SID plus neighbor /48 routes on every switch; no dynamic routing on the backend
- [x] Fabric MTU sized for the extra 40-byte outer IPv6 header
- [x] NICs (or a host stack) able to encapsulate H.Encaps.Red per packet
- [x] Orchestrator that publishes path templates and denylists to NICs
- [x] Continuous self-probing of every NIC–T0 and T0–T1 link
- [x] SRv6 origination restricted to authorized workloads; block filtered at the edge

## Frequently Asked Questions

### Do AI fabrics with SRv6 still need BGP?

Not for the backend data path in the static model. The MRC deployments at OpenAI and Microsoft disable dynamic routing on backend switches and use static uSID routes configured at install time. BGP may still run elsewhere, for example on the frontend network or for management.

### How many uSIDs does an AI fabric path need?

A path through a two-tier Clos needs three or four uSIDs: source leaf, spine, destination leaf and optionally the last-hop port. Six uSIDs fit in the IPv6 destination address without a Segment Routing Header, enough for a five-hop path through a three-tier Clos.

### Does SONiC support SRv6 for AI backends?

Yes. SONiC 202505 added static SRv6 configuration through the SRV6_MY_LOCATORS and SRV6_MY_SIDS CONFIG_DB tables, with uN and uDT46 behaviors. Support for the uA behavior in CONFIG_DB was merged to the master branch in August 2026.

### What is the overhead of SRv6 in an AI fabric?

When the whole path fits in one uSID container, the only overhead is the 40-byte outer IPv6 header. No Segment Routing Header is added.

## Further Reading

- :material-arrow-right: [MRC and SRv6](mrc.md) - The production reference design
- :material-arrow-right: [SRv6 vs ECMP, Adaptive Routing and InfiniBand](srv6-vs-ai-fabric-alternatives.md) - Why source routing
- :material-arrow-right: [CLOS & Load Balancing](../topics/clos-glb.md) - SRv6 in Clos data centers
- :material-arrow-right: [uSID Compression](../topics/usid-compression.md) - The encoding
- :material-arrow-right: [SRv6 AI Standards Tracker](ai-standards.md) - Drafts and specifications

## References

1. [draft-filsfils-srv6ops-srv6-ai-backend-05](https://www.ietf.org/archive/id/draft-filsfils-srv6ops-srv6-ai-backend-05.txt) - SRv6 for Deterministic Path Placement in AI Backends (Cisco, OpenAI, Microsoft, Oracle, IBM, NVIDIA, Arrcus; September 2026)
2. [Resilient AI Supercomputer Networking using MRC and SRv6](https://arxiv.org/abs/2605.04333) - Multi-plane topology, uSID layout and static tables in production
3. [SONiC Static SRv6 Configuration HLD](https://github.com/sonic-net/SONiC/blob/master/doc/srv6/srv6_static_config_hld.md) - CONFIG_DB tables and FRR compilation
4. [SONiC 202505: Powering AI fabrics](https://sonicfoundation.dev/sonic-202505-powering-ai-fabrics-and-enterprise-networks-with-precision-and-insight/) - Release introducing static SRv6 for AI backends
5. [NANOG 96: AI Backend - Deploying SRv6 uSID and SONiC for Deterministic Load Balancing](https://storage.googleapis.com/site-media-prod/meetings/NANOG96/5611/20260202_Camarillo_Ai_Backend_Deploying_v1.pdf) - Cisco and Microsoft deployment walkthrough
6. [Cumulus Linux 5.18: Segment Routing](https://docs.nvidia.com/networking-ethernet-software/cumulus-linux-518/Layer-3/Routing/Segment-Routing/) - Static uN/uA on Spectrum-4
7. [Arista EOS: Segment Routing over IPv6](https://www.arista.com/um-eos/eos-segment-routing-over-ipv6-srv6) - EOS SRv6 behaviors and formats
8. [AMD Vulcano AI NIC product brief](https://www.amd.com/content/dam/amd/en/documents/pensando-business-docs/product-brief/amd-vulcano-ai-nic-networking-product-brief.pdf) - NIC-based SRv6 source routing
9. [RFC 9800 - Compressed SRv6 Segment List Encoding](https://datatracker.ietf.org/doc/rfc9800/) - uN, uA and the F3216 format
