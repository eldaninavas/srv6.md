---
title: SRv6 vs ECMP, Adaptive Routing, UEC
seo_title: "SRv6 vs ECMP, Adaptive Routing and Ultra Ethernet for AI"
description: "How SRv6 source routing compares with ECMP hashing, flowlets, switch adaptive routing (Spectrum-X, InfiniBand) and Ultra Ethernet packet spraying for GPU fabrics, and how they combine."
tags:
  - ai
  - comparison
  - load-balancing
  - gpu
  - uec
---

# SRv6 vs ECMP, Adaptive Routing and Ultra Ethernet for AI Fabrics

Every AI backend has many equal-cost paths between any two GPUs. The question is **who chooses the path for each packet, and how**. There are three broad answers: the **switch hashes**, the **switch adapts**, or the **sender decides**. SRv6 is the cleanest form of the third. This page compares the options and explains why they are often combined rather than chosen one against another.

## The options at a glance

| Approach | Who picks the path | Granularity | Path known to the sender? | Reordering | Examples |
|----------|-------------------|-------------|:-------------------------:|------------|----------|
| **ECMP hashing** | Switch (hash of 5-tuple) | Per flow | No | None | Classic RoCEv2 fabrics |
| **Flowlet switching** | Switch (on gaps in a flow) | Per flowlet | No | Rare | Many DC switches |
| **Switch adaptive routing** | Switch (local queue state) | Per packet | No | Yes, handled by the NIC | InfiniBand, NVIDIA Spectrum-X |
| **Entropy spraying** (UEC style) | Sender picks an entropy value, switch hashes it | Per packet | **Probabilistically** | Yes, handled by the transport | Ultra Ethernet Transport; MRC in ECMP mode |
| **SRv6 source routing** | Sender writes the explicit path | Per packet | **Exactly** | Yes, handled by the transport | MRC over static SRv6 (OpenAI, Microsoft, OCI) |

## ECMP: the baseline that breaks

Per-flow ECMP works for many small flows. AI training produces the opposite: a few huge, synchronized flows. Two of them that hash onto the same link halve each other's throughput, and because collectives are synchronous, the whole job waits for the slowest one. In the MRC paper's measurements, a single RoCEv2 queue pair over ECMP reached about half the achievable all-reduce throughput because of collisions, and opening more QPs helped only up to about eight. ECMP also reacts to failures only through routing reconvergence. The SRv6 AI-backend draft cites tens of milliseconds to a sub-second for BGP in Clos fabrics, during which a fully loaded 400G link loses a very large number of packets.

## Switch adaptive routing (InfiniBand, Spectrum-X)

Adaptive routing lets each switch send each packet out of its least-loaded eligible port. NVIDIA Spectrum-X, for example, balances packet by packet in the switch, while the SuperNIC reorders packets and places them in memory. HPC networks such as InfiniBand have traditionally used adaptive routing.

**Strengths**: reacts to congestion at its location, needs no host involvement, and is proven at scale.
**Limits**: the path a packet took is decided hop by hop and is invisible to the sender; it is hard to reproduce or test; and the switch's view is local.

The SRv6 model is the deliberate opposite. The IETF AI-backend draft states plainly that its approach "is not switch adaptive routing". The MRC authors disabled dynamic routing because they did not want two adaptive mechanisms interacting. The two can coexist on the same hardware, though: NVIDIA Spectrum-4 and Spectrum-5 switches implement the static SRv6 mode used by MRC, and Google's Virgo fabric combines switch adaptive routing with SRv6 source routing for bare-metal customers that run their own host stack.

## Ultra Ethernet (UEC): spraying with entropy

The Ultra Ethernet Transport (UEC Specification 1.0, June 2025) sprays packets by choosing among a set of entropy values, typically 64–256, carried in the UDP source port. It backs off from entropies that return ECN marks or trimmed packets, and it expects switches to hash the same entropy onto the same path. UEC deliberately requires **no change to the network layer** and works with existing routing protocols.

UEC 1.0 does not mention SRv6. UEC 1.1 (October 2026) mentions it once, as a possible tunnel. The key difference from SRv6:

- In UEC, an entropy value is an **opaque hash input**. Picking a new entropy after a failure is likely, but **not guaranteed**, to avoid the failed link, a point Cisco and Microsoft made at NANOG 96.
- With SRv6, the entropy value **maps to an explicit path**. A new value is a different path by construction, and loss on that value identifies a physical path.

## SRv6 + a multipath transport: complementary, not rival

SRv6 does not compete with UEC-style transports; it gives them deterministic paths. **MRC** shows this directly:

- MRC borrows its spraying, ECN-driven load balancing, out-of-order placement, selective retransmission and packet trimming from UET, and uses UET's NSCC congestion control by default.
- It keeps the RoCE verbs model, a minimal extension of RoCEv2.
- In its SRv6 mode, it maps each entropy value to an explicit uSID path, so the same transport logic gains exact path identity.

The OCP MRC specification supports ECMP hashing, a "structured entropy" mode and SRv6. That lets an operator start on an existing ECMP fabric and move to source routing when the switches support it.

## When each approach makes sense

| Situation | Good fit |
|-----------|----------|
| Small cluster, mixed traffic, existing RoCE NICs | ECMP + flowlets, tuned PFC/ECN |
| Single-vendor fabric with adaptive switches and NICs | Switch adaptive routing |
| Multi-vendor Ethernet, UEC NICs, no switch changes wanted | UEC entropy spraying over ECMP |
| Very large clusters where failure handling, reproducibility and path-level telemetry matter | **SRv6 source routing + multipath transport (MRC)** |
| AI traffic between data centers | SRv6 **traffic engineering** (SR Policy) at the DC edge — see [Scale-Across](scale-across.md) |

## Measured differences (published)

From the MRC paper's small-cluster comparison on identical hardware (64 GPUs):

- One MRC queue pair spraying across 256 SRv6 paths outperformed 16 RoCEv2 QPs on ECMP for ring all-reduce. MRC won all-to-all at every message size.
- In a 7:1 incast, a RoCEv2 + DCQCN victim flow lost about 25% of its throughput, while an MRC victim flow saw no impact.
- With 1% injected loss on every plane, RoCEv2 became "pretty much unusable" and MRC kept about a third of its throughput.

From a Microsoft Research technical report (simulation): with one link degraded to half capacity, SRv6-based re-routing finished an all-to-all 21.6–37.1% faster than packet spraying, depending on message size. Deterministic SRv6 probing covered N paths with N probes, about 5× faster failure detection for the same probe budget.

No primary source benchmarks SRv6/MRC directly against InfiniBand.

## Frequently Asked Questions

### Is SRv6 an alternative to Ultra Ethernet?

No, they work at different layers. Ultra Ethernet defines a transport that sprays packets using entropy values that switches hash. SRv6 can turn each of those entropy values into an explicit path. MRC combines UEC-derived transport mechanisms with SRv6 source routing.

### Why not just use adaptive routing in the switches?

Adaptive routing reacts well to local congestion, but the sender never knows which path a packet took, which makes failures harder to pinpoint and behavior harder to reproduce. Combining it with an adaptive transport also creates two control loops reacting to the same events. SRv6 source routing keeps the switches static and gives the transport exact control and visibility.

### Does SRv6 replace ECMP in AI data centers?

In the backend fabrics that use MRC over static SRv6, yes: the sender chooses every path and switches do not hash. ECMP remains common in frontend networks and in AI fabrics that use RoCEv2 or UEC without source routing.

## Further Reading

- :material-arrow-right: [MRC and SRv6](mrc.md) - The production example
- :material-arrow-right: [SRv6 AI Fabric Design](ai-fabric-design.md) - How to build it
- :material-arrow-right: [AI/ML Training Networks](../use-cases/ai-networking.md) - The ECMP collision problem
- :material-arrow-right: [AI Networking Glossary](ai-glossary.md) - Terms used on this page

## References

1. [Resilient AI Supercomputer Networking using MRC and SRv6](https://arxiv.org/abs/2605.04333) - MRC vs RoCEv2 comparisons and rationale for disabling dynamic routing
2. [draft-filsfils-srv6ops-srv6-ai-backend-05](https://www.ietf.org/archive/id/draft-filsfils-srv6ops-srv6-ai-backend-05.txt) - "This is not switch adaptive routing"; BGP convergence figures
3. [Ultra Ethernet Specification 1.0](https://ultraethernet.org/wp-content/uploads/sites/20/2025/06/UE-Specification-6.11.25.pdf) - Entropy-based spraying, no network-layer changes
4. [Ultra Ethernet Specification 1.1](https://ultraethernet.org/wp-content/uploads/sites/20/2026/10/UE-Specification-1.1.pdf) - October 2026 revision
5. [Towards Fully-Controllable Packet Steering for AI Backend Networks with SRv6](https://www.microsoft.com/en-us/research/publication/towards-fully-controllable-packet-steering-for-ai-backend-networks-with-srv6/) - Microsoft Research technical report MSR-TR-2026-6
6. [NANOG 96: AI Backend - Deploying SRv6 uSID and SONiC](https://storage.googleapis.com/site-media-prod/meetings/NANOG96/5611/20260202_Camarillo_Ai_Backend_Deploying_v1.pdf) - Load-balancing taxonomy: switch-based, probabilistic NIC-based, deterministic SRv6
7. [Optimize large-scale AI workloads with NVIDIA Spectrum-X](https://developer.nvidia.com/blog/optimize-large-scale-ai-workloads-with-nvidia-spectrum-x/) - Switch-based per-packet adaptive routing
8. [OCP 2026: Inside Google's Virgo Network](https://www.segment-routing.net/conferences/2026-10-15-ocp-summit26-google-virgo/) - Adaptive routing plus SRv6 source routing for bare-metal customers
