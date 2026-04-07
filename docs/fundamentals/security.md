---
title: Security
description: SRv6 security considerations, HMAC, filtering, and attack mitigation
tags:
  - fundamentals
  - security
  - hmac
  - acl
---

# SRv6 Security

Security is a critical aspect of any SRv6 deployment. This page covers the security mechanisms built into SRv6, common attack vectors, and best practices for securing an SRv6 network.

## Threat Model

### What Could Go Wrong?

| Threat | Description | Impact |
|--------|-------------|--------|
| **SRH injection** | Attacker injects packets with forged SRH to steer traffic through unintended paths | Traffic interception, bypass of security functions |
| **SRH manipulation** | Attacker modifies the segment list in transit to alter the forwarding path | Traffic diversion, service chain bypass |
| **SID probing** | Attacker probes the SRv6 SID space to discover network topology | Reconnaissance for further attacks |
| **Amplification** | Attacker uses SRv6 encapsulation to amplify traffic volume | DDoS amplification |
| **Bypass service chain** | Attacker crafts packets that skip security functions in a service chain | Evading firewall/IDS inspection |

## Defense Mechanisms

### 1. Infrastructure ACLs (iACLs)

The **first and most important** defense: filter SRv6 packets at the network boundary.

#### SRv6 Filtering Rules

```
                    ┌──────────────────┐
  External  ──────►│  Border Router    │──────►  Internal SRv6 Domain
  Traffic          │                   │
                   │  iACL:            │
                   │  DENY SRH from    │
                   │  outside           │
                   └──────────────────┘
```

**Key principle:** SRv6 SRH should **never** be accepted from outside your network. Only traffic originating from within your SRv6 domain should carry an SRH.

=== "Cisco IOS-XR"

    ```cisco
    !! Drop packets with SRH from external interfaces
    ipv6 access-list SRV6-EDGE-FILTER
     10 deny ipv6 any any routing-type 4
     20 permit ipv6 any any
    !
    interface GigabitEthernet0/0/0/0
     description External-Facing
     ipv6 access-group SRV6-EDGE-FILTER ingress
    !
    ```

=== "Linux (iptables/nftables)"

    ```bash
    # Drop incoming packets with IPv6 Routing Header type 4 (SRH)
    ip6tables -A INPUT -m rt --rt-type 4 -j DROP
    ip6tables -A FORWARD -m rt --rt-type 4 -i eth0-external -j DROP

    # nftables equivalent
    nft add rule ip6 filter input rt type 4 drop
    ```

### 2. SRH HMAC (RFC 8754)

The SRH supports an **HMAC TLV** that provides cryptographic authentication of the segment list:

#### How HMAC Works

1. **Ingress node** computes HMAC over the segment list using a pre-shared key
2. HMAC value is inserted as a TLV in the SRH
3. **Each SRv6 node** (optionally) verifies the HMAC before processing the SID
4. If HMAC validation fails, the packet is **dropped**

#### What HMAC Protects Against

| Protection | Description |
|------------|-------------|
| **SRH forgery** | Attacker cannot create valid HMAC without the key |
| **SRH tampering** | Any modification to the segment list invalidates the HMAC |
| **Replay protection** | HMAC includes anti-replay mechanisms |

#### HMAC TLV Format

```
 0                   1                   2                   3
 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|   Type (5)    |    Length      |       Reserved               |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|                     HMAC Key ID (4 bytes)                     |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|                                                               |
|                     HMAC Value (32 bytes)                      |
|                                                               |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
```

!!! warning "HMAC tradeoffs"
    HMAC adds 38 bytes of overhead per packet and requires key management across all SRv6 nodes. Most deployments rely on iACLs at the boundary rather than per-packet HMAC for performance reasons.

### 3. SID Block Filtering

Restrict the SRv6 SID block (e.g., `fcbb:bb00::/24`) to only be routable within your network:

- **BGP policies**: Do not advertise SRv6 locator prefixes to external peers
- **Prefix filtering**: Block SRv6 SID block at all external-facing interfaces
- **uRPF**: Enable Unicast Reverse Path Forwarding to catch spoofed SRv6 source addresses

### 4. Rate Limiting

Rate-limit SRv6-related control plane traffic:

| What to Rate Limit | Why |
|--------------------|-----|
| ICMPv6 for SRv6 SIDs | Prevent ping/traceroute-based recon floods |
| SRH packets to control plane | Prevent CPU exhaustion from SRH processing |
| BGP SRv6 SID updates | Prevent BGP flooding attacks |

## Security Best Practices

### Deployment Checklist

- [ ] **iACLs on all external interfaces** — drop packets with SRH (routing type 4) from outside your domain
- [ ] **SID block not advertised externally** — BGP policy to filter SRv6 locator prefixes
- [ ] **uRPF enabled** — prevents spoofed source addresses in SRv6 packets
- [ ] **Rate limiting** on SRv6-related ICMP and control plane traffic
- [ ] **My SID table validation** — nodes only process SIDs they are configured to own
- [ ] **Monitoring** — alert on unexpected SRH packets at boundary routers
- [ ] **Key rotation plan** if using HMAC (for high-security environments)

### Domain Trust Model

SRv6 operates on a **trusted domain** model:

```
┌─────────────────────────────────────┐
│         SRv6 Trusted Domain          │
│                                      │
│   All nodes trust each other's SIDs  │
│   SRH is valid within this domain    │
│                                      │
│   ┌────┐   ┌────┐   ┌────┐         │
│   │ PE1│───│ P1 │───│ PE2│         │
│   └────┘   └────┘   └────┘         │
│                                      │
├──────────────────────────────────────┤
│  Border: iACLs drop external SRH     │
└──────────────────────────────────────┘
         │                    │
    External traffic     External traffic
    (no SRH allowed)     (no SRH allowed)
```

This is the same trust model used by MPLS networks today — MPLS labels are not validated, only trusted within the operator's domain. SRv6 improves on this by offering **optional HMAC** for environments requiring stronger guarantees.

## Further Reading

- :material-arrow-right: [SRH Mechanics & Packet Walk](srh-packet-walk.md) - SRH format including HMAC TLV
- :material-arrow-right: [OAM & Troubleshooting](oam-troubleshooting.md) - Detecting SRv6 issues
- :material-file-document: [RFC 8754](../rfcs/rfc8754.md) - SRH specification including HMAC

## References

1. [RFC 8754 - IPv6 Segment Routing Header](https://datatracker.ietf.org/doc/rfc8754/) - Section 7 defines HMAC TLV and security considerations for SRH
2. [RFC 8402 - Segment Routing Architecture](https://datatracker.ietf.org/doc/rfc8402/) - Section 8 covers SR security properties and the trusted domain model
3. [draft-ietf-spring-srv6-security](https://datatracker.ietf.org/doc/draft-ietf-spring-srv6-security/) - IETF draft on security considerations specific to SRv6 deployments
