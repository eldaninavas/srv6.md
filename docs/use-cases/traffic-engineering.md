---
title: Traffic Engineering
description: SRv6 Traffic Engineering concepts and configuration
tags:
  - use-cases
  - traffic-engineering
---

# Traffic Engineering with SRv6

SRv6 Traffic Engineering (TE) enables operators to steer traffic along explicit paths through the network, optimizing for latency, bandwidth, or other constraints.

## How It Works

Instead of relying on shortest-path routing alone, SRv6 TE defines **SR Policies** that specify explicit segment lists (paths) for traffic.

```mermaid
graph LR
    A[Ingress PE] -->|Low Latency Path| B[P1]
    B --> C[P2]
    C --> D[Egress PE]
    A -->|High BW Path| E[P3]
    E --> F[P4]
    F --> D
    style A fill:#7b1fa2,color:#fff,stroke:#ab47bc
    style D fill:#7b1fa2,color:#fff,stroke:#ab47bc
    style B fill:#4a148c,color:#fff,stroke:#ab47bc
    style C fill:#4a148c,color:#fff,stroke:#ab47bc
    style E fill:#4a148c,color:#fff,stroke:#ab47bc
    style F fill:#4a148c,color:#fff,stroke:#ab47bc
```

## SR Policy Components

| Component | Description |
|-----------|-------------|
| **Headend** | The node where the policy is applied |
| **Color** | Identifies the intent (e.g., low-latency) |
| **Endpoint** | Destination of the policy |
| **Candidate Path** | One or more segment lists for the policy |
| **Segment List** | Ordered list of SIDs defining the path |

## Use Cases

- **Low-latency routing** for real-time applications
- **Bandwidth reservation** for critical flows
- **Disjoint paths** for redundancy
- **WAN optimization** across multiple domains

## Further Reading

- :material-arrow-right: [VPN Services](vpn-services.md)
- :material-file-document: [RFC 9256](../rfcs/rfc9256.md) - SR Policy Architecture
