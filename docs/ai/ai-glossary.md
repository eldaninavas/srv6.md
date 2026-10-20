---
title: AI Networking Glossary
seo_title: "AI Networking Glossary: GPU Fabric Terms for SRv6 Engineers"
description: "Plain definitions of the AI networking terms network engineers meet when SRv6 enters GPU fabrics: RoCEv2, NCCL, all-reduce, packet spraying, multi-plane, uN, entropy value, JCT and more."
tags:
  - ai
  - glossary
  - gpu
  - data-center
---

# AI Networking Glossary

AI training clusters bring two vocabularies together: the GPU/HPC world (collectives, RDMA, job completion time) and the routing world (Clos, ECMP, SIDs). This glossary defines the terms you need to read the rest of the [SRv6 for AI](index.md) section, with a note on where SRv6 fits for each.

## Workloads and collectives

**All-reduce**
:   A collective operation in which every GPU contributes a buffer and every GPU receives the element-wise sum (or other reduction) of all buffers. Data-parallel training runs an all-reduce of the gradients at every step, which makes it the dominant source of backend traffic.

**All-to-all**
:   A collective in which every GPU sends a distinct chunk to every other GPU. Mixture-of-Experts (MoE) models use it to route tokens to experts. It creates many simultaneous flows between all pairs of nodes, which is where hash-based load balancing suffers most.

**Collective communication library (NCCL, RCCL)**
:   The software that implements collectives on GPUs: NCCL for NVIDIA, RCCL for AMD. It decides the algorithm (ring, tree) and opens the network connections, so its traffic pattern is what the fabric actually sees.

**Job completion time (JCT)**
:   The wall-clock time of a training job, or of one training step. Collectives are synchronous, so a step finishes only when the slowest flow finishes: one congested link delays every GPU in the job. This is why AI fabrics are judged on tail latency rather than average throughput.

**Elephant flow**
:   A long-lived, high-bandwidth flow. AI training produces few, very large flows with low entropy (few distinct 5-tuples), the worst case for per-flow hashing.

**Checkpointing**
:   Periodically writing model state to storage so training can resume after a failure. Checkpoint traffic usually runs on the frontend or storage network, not the GPU backend.

## Cluster networks

**Backend (scale-out) network**
:   The dedicated network that connects GPU servers to each other for collective traffic, typically RoCEv2 or InfiniBand at 400G–800G per GPU NIC. SRv6 for AI is about this network. See [SRv6 AI Fabric Design](ai-fabric-design.md).

**Frontend network**
:   The conventional data center network for storage, management, user traffic and job scheduling. It is often a separate fabric from the backend.

**Scale-up network**
:   The very high-bandwidth domain inside a server or rack that lets GPUs share memory semantics (for example NVLink, or UALink). It is not IP-routed, so SRv6 does not apply inside it.

**Scale-across**
:   Connecting AI clusters in different buildings or data centers so that a single training job, or a group of jobs, can span them. This is where AI meets the WAN and backbone. See [SRv6 for Multi-Datacenter AI](scale-across.md).

**Rail-optimized topology**
:   A design in which GPU *n* of every server connects to the same leaf ("rail"), so most collective traffic between same-index GPUs stays one hop away.

**Multi-plane fabric**
:   A backend split into several independent parallel networks ("planes"). Each NIC port, or each lane group of a NIC port, attaches to a different plane. More planes give each switch more effective radix, so a large cluster fits in fewer tiers, and the loss of one link removes a smaller share of a node's bandwidth. [MRC](mrc.md) uses this design.

**Clos / fat-tree**
:   The leaf-spine (two-tier) or leaf-spine-superspine (three-tier) topology used by almost every AI backend. It provides many equal-cost paths between any two GPUs, and the question is how to use them evenly.

## Transport

**RDMA**
:   Remote Direct Memory Access: a NIC writes directly into the memory of a remote host without involving its CPU. GPU collectives run over RDMA, usually GPUDirect RDMA straight to GPU memory.

**RoCEv2**
:   RDMA over Converged Ethernet version 2: RDMA carried in UDP/IP (UDP port 4791), so it is routable and can be carried inside SRv6. Classic RoCEv2 expects in-order delivery and recovers poorly from loss, which is why it is usually paired with a lossless fabric (PFC) and per-flow ECMP.

**Queue pair (QP)**
:   The RDMA connection endpoint, a pair of send and receive queues. Traffic of one QP traditionally follows one network path, because the path is chosen by hashing its 5-tuple.

**PFC (Priority Flow Control)**
:   IEEE 802.1Qbb link-level pause per traffic class, used to make Ethernet lossless for RoCEv2. It prevents drops but can cause head-of-line blocking and congestion spreading.

**ECN / DCQCN**
:   Explicit Congestion Notification marks packets at congested queues; DCQCN is the congestion-control algorithm that RoCEv2 NICs commonly use to slow down in response.

**Multipath transport**
:   A transport that deliberately spreads one connection over many paths and tolerates out-of-order arrival. [MRC](mrc.md) and the Ultra Ethernet Transport are examples. Multipath transport is the natural partner of SRv6 source routing: the transport chooses among paths, and SRv6 makes each path explicit.

## Load balancing

**ECMP (Equal-Cost Multi-Path)**
:   The switch picks one of several equal-cost next hops by hashing packet header fields. It works well for many small flows and badly for a few elephant flows: two large flows that hash to the same link halve each other's throughput while other links stay idle.

**Hash collision / polarization**
:   Two or more flows landing on the same link because of the hash (collision), or every switch making correlated choices so that some paths are never used (polarization). Both lengthen JCT.

**Entropy / entropy value (EV)**
:   Header bits that vary per flow or per packet so that hashing spreads traffic. In MRC, an *entropy value* is a per-path identifier the NIC chooses; each EV maps to one explicit SRv6 path, so changing the EV changes the path deterministically rather than probabilistically.

**Packet spraying**
:   Sending consecutive packets of the same flow over different paths. It gives near-perfect load balance but delivers packets out of order, so it needs a transport that handles reordering.

**Flowlet switching**
:   Moving a flow to a new path only during a gap in its packets that is long enough for reordering not to occur. It is a middle ground between per-flow ECMP and per-packet spraying.

**Adaptive routing**
:   Switches choose the egress port per packet or per flowlet based on local queue occupancy. It is used in InfiniBand and in some Ethernet AI fabrics. It reacts to congestion but makes the path invisible and hard to reproduce.

**Deterministic path placement**
:   The sender (host, NIC or controller) chooses the exact path of each flow or packet and encodes it in the packet, for example as an SRv6 uSID list. The network then forwards without making any load-balancing decision. See [SRv6 vs ECMP, Adaptive Routing and InfiniBand](srv6-vs-ai-fabric-alternatives.md).

## SRv6 terms in AI fabrics

**uSID (micro-SID)**
:   A compressed SRv6 SID of 16 bits carried inside a 128-bit IPv6 destination address together with a shared block prefix, so that one address holds several hops. Standardized as the NEXT-C-SID flavor in RFC 9800. See [uSID compression](../topics/usid-compression.md).

**uN**
:   The uSID "node" behavior: the switch recognizes its own uSID at the front of the active container, shifts the remaining uSIDs left and forwards on the new destination address. In AI fabrics, a path is simply the list of uN uSIDs of the switches it traverses.

**uA**
:   The uSID "adjacency" behavior: like uN but forwards out of one specific link, for when the path must name an exact link rather than a switch.

**Locator block**
:   The common prefix shared by all uSIDs in a domain, for example a 32-bit block. Every switch advertises or is configured with its uSIDs under this block.

**DA-only encapsulation**
:   When the whole path fits in one uSID container, the packet carries no Segment Routing Header at all: just an outer IPv6 header whose destination address is the path. This keeps AI traffic overhead at 40 bytes (the IPv6 header) and keeps processing on the fast path of every ASIC.

## Further Reading

- :material-arrow-right: [SRv6 for AI](index.md) - The hub: why SRv6, who uses it, where to go next
- :material-arrow-right: [MRC and SRv6](mrc.md) - How OpenAI's supercomputer network uses SRv6
- :material-arrow-right: [SRv6 AI Fabric Design](ai-fabric-design.md) - Addressing, planes, uSID plan and hardware
- :material-arrow-right: [AI/ML Training Networks](../use-cases/ai-networking.md) - The ECMP problem and the SRv6 solution
