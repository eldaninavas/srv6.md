---
title: Service Chaining
description: Network Service Function Chaining with SRv6
tags:
  - use-cases
  - service-chaining
  - nfv
---

# Service Chaining with SRv6

SRv6 provides an elegant solution for **Service Function Chaining (SFC)** - steering traffic through an ordered set of network functions (firewalls, IDS, load balancers, etc.).

## How It Works

Each network function is assigned an SRv6 SID. The segment list defines the chain of services the packet must traverse.

```mermaid
graph LR
    A[Client] --> B[Ingress]
    B -->|SID: FW::1| C[Firewall]
    C -->|SID: IDS::1| D[IDS]
    D -->|SID: LB::1| E[Load Balancer]
    E --> F[Server]
    style A fill:#7b1fa2,color:#fff,stroke:#ab47bc
    style F fill:#7b1fa2,color:#fff,stroke:#ab47bc
    style C fill:#4a148c,color:#fff,stroke:#ab47bc
    style D fill:#4a148c,color:#fff,stroke:#ab47bc
    style E fill:#4a148c,color:#fff,stroke:#ab47bc
    style B fill:#4a148c,color:#fff,stroke:#ab47bc
```

## Advantages over Traditional SFC

- **No overlay tunnel** between service functions
- **Topology independent** - services can be anywhere in the network
- **Dynamic chaining** - change the chain by modifying the segment list
- **Metadata support** - TLVs in SRH can carry context between functions

## Further Reading

- :material-arrow-right: [Traffic Engineering](traffic-engineering.md)
- :material-arrow-right: [Network Programming](../fundamentals/network-programming.md)

## References

1. [RFC 8986 - SRv6 Network Programming](https://datatracker.ietf.org/doc/rfc8986/) - IETF standard defining the SRv6 network programming framework and base set of SRv6 endpoint behaviors
2. [RFC 7665 - Service Function Chaining (SFC) Architecture](https://datatracker.ietf.org/doc/html/rfc7665) - IETF informational RFC describing the architecture for creating and maintaining Service Function Chains
3. [draft-ietf-spring-sr-service-programming - Service Programming with Segment Routing](https://datatracker.ietf.org/doc/draft-ietf-spring-sr-service-programming/) - IETF draft defining data plane functionality for service segments and SR-based service programming
