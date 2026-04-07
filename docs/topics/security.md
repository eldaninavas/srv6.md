---
title: Security
description: SRv6 security considerations, HMAC, filtering, and attack mitigation
tags:
  - topics
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

## SRH Security Analysis (RFC 8754 Section 5)

RFC 8754 Section 5 and RFC 8402 Section 8 define the formal security considerations for SRv6. Understanding the threat categories and deployment models is essential for designing a secure SRv6 network.

### Threat Categories

The RFCs identify three primary threat categories:

| Threat Category | Description | RFC Reference |
|----------------|-------------|---------------|
| **Source address spoofing** | An attacker outside the trusted domain crafts packets with a spoofed source address belonging to the SRv6 domain, causing them to bypass iACL filters that match on source prefix | RFC 8754 Section 5.1 |
| **SRH manipulation** | An attacker intercepts packets in transit and modifies the segment list, Segments Left field, or other SRH fields to alter the forwarding path | RFC 8754 Section 5.2 |
| **Topology disclosure** | An attacker probes the SRv6 SID space (which uses routable IPv6 addresses) to discover internal network topology, node roles, and service chain structure | RFC 8402 Section 8.1 |

!!! info "Key insight from the RFCs"
    Unlike MPLS labels (which are locally significant and not routable), SRv6 SIDs are globally routable IPv6 addresses. This makes topology discovery easier for attackers unless SID prefixes are properly filtered at domain boundaries.

### The 3 Deployment Models

RFC 8754 defines three security deployment models, each with different levels of protection:

#### Model 1: Trusted Domain with Filtering

The most common deployment model. All nodes within the SRv6 domain are trusted. Security relies entirely on filtering at domain boundaries.

```
  Untrusted          ┌─────────────────────────────┐          Untrusted
  Internet  ────────►│  iACL: drop SRH (RT type 4) │◄──────── Internet
                     │  uRPF: reject spoofed src    │
                     │                               │
                     │    Trusted SRv6 Domain         │
                     │    (no per-packet auth)        │
                     └─────────────────────────────┘
```

- **When to use:** Single-operator networks where all routers and links are physically secured. This covers the vast majority of SP and enterprise deployments.
- **Tradeoffs:** Zero per-packet overhead, no key management, but offers no protection against compromised nodes inside the domain or man-in-the-middle attacks on internal links.

#### Model 2: HMAC-Based Verification

Every SRH carries a cryptographic HMAC TLV. Nodes verify the HMAC before processing SIDs, providing per-packet authentication of the segment list.

- **When to use:** Multi-domain environments, inter-provider SRv6 peering, or networks where internal links traverse untrusted infrastructure (e.g., leased dark fiber, shared data center interconnects).
- **Tradeoffs:** Strong per-packet security, but adds 38 bytes of overhead per packet, requires HMAC computation at every verifying node, and demands a key management infrastructure across all participating nodes.

#### Model 3: Combined (Filtering + HMAC)

Uses iACL filtering at domain boundaries **and** HMAC verification for traffic crossing trust boundaries (e.g., between autonomous systems or between the core and a less-trusted access layer).

- **When to use:** Large-scale networks with mixed trust zones, where some segments of the infrastructure are more exposed than others.
- **Tradeoffs:** Best overall security posture, but highest operational complexity. Requires careful definition of trust boundaries and selective HMAC application.

!!! tip "Practical guidance"
    Almost all production SRv6 deployments today use **Model 1** (trusted domain with filtering). HMAC is specified in the standards but is rarely deployed due to performance and operational overhead. The industry consensus is that robust boundary filtering provides sufficient security for single-operator networks.

---

## HMAC Deep Dive

The HMAC TLV defined in RFC 8754 Section 7 provides optional per-packet cryptographic authentication of the SRH. This section covers the computation details, key management challenges, and real-world deployment status.

### HMAC Computation Details

The HMAC is computed over a concatenation of the following fields:

| Field | Size | Purpose |
|-------|------|---------|
| **Source IPv6 Address** | 16 bytes | Binds the HMAC to the packet originator, preventing source spoofing |
| **First Segment (Segment List[0])** | 16 bytes | The ultimate destination SID |
| **Segments Left (SL)** | 1 byte | Binds to the current position in the segment list |
| **Flags** | 1 byte | SRH flags field |
| **Full Segment List** | 16 x n bytes | All SIDs in the segment list, in order |
| **HMAC Key ID** | 4 bytes | Identifies which pre-shared key was used |

The HMAC algorithm is **HMAC-SHA-256**, truncated to 256 bits (32 bytes). Combined with the 4-byte Key ID and 2 bytes of type/length, the total HMAC TLV overhead is **38 bytes**.

```
HMAC = HMAC-SHA-256(Key,
         IPv6-Source-Address ||
         Segment-List[0]    ||
         Segments-Left      ||
         Flags              ||
         Segment-List[0..n] ||
         HMAC-Key-ID
       )
```

!!! note "What the HMAC does NOT cover"
    The HMAC does **not** protect the payload, the IPv6 destination address (which changes at each hop), or any optional TLVs other than those explicitly included in the computation. It authenticates only the segment list and its associated metadata.

### Key Management Challenges

HMAC-based SRH verification introduces significant key management requirements:

| Challenge | Description |
|-----------|-------------|
| **Key distribution** | Every node that needs to verify the HMAC must possess the correct pre-shared key. In a network with hundreds of routers, this requires a scalable key distribution mechanism. |
| **Key rotation** | Keys must be rotated periodically. During rotation, nodes must support at least two active Key IDs simultaneously (old and new) to avoid packet drops during the transition window. |
| **Per-domain vs. per-node keys** | A single domain-wide key is simpler to manage but means a compromise of any one node exposes the key for the entire domain. Per-node keys provide better isolation but multiply the management burden by the number of nodes. |
| **No standard protocol** | RFC 8754 does not specify a key distribution protocol. Operators must rely on out-of-band mechanisms (e.g., configuration management systems, proprietary key servers). |

### Performance Impact

| Impact Area | Details |
|------------|---------|
| **Packet overhead** | 38 bytes per packet (HMAC TLV). For a 10-SID segment list, the SRH is already 168 bytes; HMAC adds another 23% overhead. |
| **Computation cost** | HMAC-SHA-256 computation at ingress (generation) and at each verifying node. On modern ASIC-based routers, this may require **packet recirculation** through the forwarding pipeline, effectively halving throughput for HMAC-verified traffic. |
| **Latency** | HMAC verification adds per-hop latency. For latency-sensitive traffic (e.g., 5G URLLC), this may be unacceptable. |
| **ASIC support** | Not all forwarding ASICs support HMAC computation in hardware. Software-based HMAC verification limits throughput to control-plane speeds. |

### HMAC in Practice

!!! warning "Real-world deployment status"
    Despite being specified since RFC 8754 (March 2020), **HMAC is rarely deployed in production**. The vast majority of SRv6 operators rely exclusively on infrastructure ACLs (iACLs) at domain boundaries. Reasons include:

    - Performance overhead is unacceptable at 100G/400G line rates without dedicated ASIC support
    - Key management complexity across large router fleets
    - The trusted domain model (with proper filtering) is considered sufficient for single-operator networks
    - No interoperable multi-vendor HMAC implementation has been widely validated

    HMAC remains valuable as a **standards-based option** for high-security environments or future multi-domain SRv6 interconnection scenarios.

---

## SRv6-Specific Attack Vectors

The IETF draft `draft-ietf-spring-srv6-security` catalogs attack vectors specific to SRv6 deployments. Understanding each attack, its mitigation, and residual risk is critical for security planning.

### 1. SRH Insertion Attack

| Aspect | Details |
|--------|---------|
| **Attack** | An external attacker crafts an IPv6 packet with an SRH containing valid-looking SIDs and sends it into the SRv6 domain. If the packet is accepted, the attacker can steer traffic through arbitrary paths within the network. |
| **Mitigation** | Deploy iACLs on all external-facing interfaces to drop any packet containing an SRH (IPv6 Routing Header type 4). Combine with uRPF to reject packets with spoofed source addresses. |
| **Residual risk** | If any external-facing interface lacks the iACL filter, it becomes an entry point. Misconfigured or newly provisioned interfaces are the primary risk. Automation and compliance auditing of ACL deployment is essential. |

### 2. SID Spoofing

| Aspect | Details |
|--------|---------|
| **Attack** | An attacker (internal or external) forges packets with destination addresses matching valid SIDs (e.g., `fcbb:bb00:0001:fe00::` for an End.DT4 function). If the SID is a valid entry in the target node's My SID table, the node will execute the associated behavior. |
| **Mitigation** | Edge filtering prevents external SID spoofing. Internally, use uRPF to validate that SRv6 source addresses originate from expected prefixes. The My SID table inherently limits processing to only configured SIDs. HMAC provides the strongest defense against SID spoofing. |
| **Residual risk** | A compromised internal node can generate packets with any valid SID. Without HMAC, there is no per-packet mechanism to detect internally originated spoofed SIDs. |

### 3. Service Chain Bypass

| Aspect | Details |
|--------|---------|
| **Attack** | An attacker crafts a segment list that deliberately omits security function SIDs (e.g., firewall, IDS/IPS) from the path. If a service chain is `PE1 -> FW -> IDS -> PE2`, the attacker constructs a segment list `PE1 -> PE2`, bypassing the security functions entirely. |
| **Mitigation** | Enforce service chaining at the headend via policy (e.g., SR Policy with explicit segment lists). Use HMAC to prevent modification of segment lists. Deploy monitoring to detect traffic arriving at egress PE nodes without having traversed mandatory service functions. |
| **Residual risk** | If the headend node itself is compromised, or if the SR Policy configuration is tampered with, service chains can be bypassed. Defense-in-depth (redundant enforcement points) reduces this risk. |

### 4. Amplification via Encapsulation

| Aspect | Details |
|--------|---------|
| **Attack** | An attacker sends a small packet to an SRv6 ingress node that encapsulates it with a long SRH (e.g., 10+ SIDs). The encapsulated packet is significantly larger (160+ bytes of SRH overhead), creating an amplification effect. If reflected or looped, this amplifies DDoS traffic volume. |
| **Mitigation** | Rate-limit SRv6 encapsulation for traffic from untrusted sources. Limit the maximum number of SIDs allowed in an SRH (policy enforcement at headend). Deploy iACLs to prevent external traffic from triggering SRv6 encapsulation. |
| **Residual risk** | Internal amplification remains possible if an attacker gains access to an internal node. The amplification factor is bounded by the maximum SRH size (theoretically up to ~137 SIDs in a standard IPv6 packet). |

### 5. Topology Discovery via Traceroute

| Aspect | Details |
|--------|---------|
| **Attack** | An attacker sends traceroute probes (ICMPv6 hop-limit exceeded) targeting addresses within the SRv6 SID block. By systematically probing the SID address space, the attacker can discover: active SIDs, node locators, function assignments, and service chain topology. |
| **Mitigation** | Rate-limit ICMPv6 responses for SRv6 SID prefixes. Filter ICMPv6 error messages at domain boundaries to prevent internal topology leakage. Do not advertise SRv6 locator prefixes externally. Consider using OAM-specific SIDs that are rate-limited separately. |
| **Residual risk** | Even with rate limiting, a patient attacker can slowly enumerate the SID space over time. Because SRv6 SIDs are IPv6 addresses, standard IPv6 scanning tools work against them. The 128-bit address space provides some protection, but locator prefixes typically use short prefix lengths (e.g., /48), narrowing the search space. |

!!! danger "Critical takeaway"
    The common thread across all these attacks is that **boundary filtering is the primary defense**. Every attack vector is significantly mitigated by properly deployed iACLs that prevent external SRH injection and SID block reachability.

---

## Filtering Best Practices

This section expands on the iACL and filtering guidance with specific rules for different network boundaries.

### Edge Filtering (External Interfaces)

All interfaces facing external networks (peering, customers, internet transit) must implement the following minimum filters:

=== "Ingress Filter (External -> Internal)"

    ```cisco
    !! Mandatory: Drop ALL packets with SRH from external sources
    ipv6 access-list SRV6-EDGE-INGRESS
     10 deny ipv6 any any routing-type 4
     20 deny ipv6 any fcbb:bb00::/24       !! Drop traffic destined to SID block
     30 deny ipv6 fcbb:bb00::/24 any       !! Drop traffic sourced from SID block
     40 permit ipv6 any any
    !
    interface TenGigE0/0/0/0
     description EXTERNAL-PEER
     ipv6 access-group SRV6-EDGE-INGRESS ingress
    !
    ```

=== "Egress Filter (Internal -> External)"

    ```cisco
    !! Prevent SRv6 internal details from leaking outward
    ipv6 access-list SRV6-EDGE-EGRESS
     10 deny ipv6 any any routing-type 4   !! No SRH should leave the domain
     20 deny ipv6 fcbb:bb00::/24 any       !! No SID-sourced packets leave
     30 permit ipv6 any any
    !
    interface TenGigE0/0/0/0
     description EXTERNAL-PEER
     ipv6 access-group SRV6-EDGE-EGRESS egress
    !
    ```

### Inter-Domain Filtering

When SRv6 domains interconnect (e.g., between autonomous systems), additional filtering is required:

| Filter Rule | Direction | Purpose |
|------------|-----------|---------|
| Drop SRH with SIDs from the remote domain's SID block | Ingress | Prevent the remote domain from steering traffic through your internal paths |
| Drop SRH with SIDs from your own SID block | Egress | Prevent your internal SRH from leaking to the remote domain |
| Allow only agreed-upon inter-domain SIDs | Both | If inter-domain SRv6 is used, permit only explicitly negotiated SIDs |

### SID Block Filtering via BGP

The SRv6 locator prefix (e.g., `fcbb:bb00::/24`) must **never** be advertised to external BGP peers:

```cisco
!! BGP policy to suppress SRv6 locator prefixes
route-policy DENY-SRV6-LOCATORS
  if destination in (fcbb:bb00::/24 le 128) then
    drop
  endif
  pass
end-policy
!
router bgp 65000
 neighbor 198.51.100.1
  address-family ipv6 unicast
   route-policy DENY-SRV6-LOCATORS out
  !
 !
!
```

!!! warning "Common misconfiguration"
    If SRv6 locator prefixes leak into the global routing table, any host on the internet can send packets directly to your SIDs. This bypasses the assumption that SID addresses are unreachable from outside the trusted domain and is the single most dangerous SRv6 misconfiguration.

### uRPF Considerations for SRv6

Unicast Reverse Path Forwarding (uRPF) validates that the source address of incoming packets is reachable via the interface the packet arrived on.

| uRPF Mode | Behavior with SRv6 | Recommendation |
|-----------|-------------------|----------------|
| **Strict mode** | Validates source address against the FIB for the specific ingress interface. May drop legitimate SRv6 traffic in asymmetric routing scenarios. | Use on access/edge interfaces where routing is symmetric. |
| **Loose mode** | Validates that the source address exists in the FIB (any interface). Allows asymmetric routing but provides weaker spoofing protection. | Use on core interfaces or where asymmetric routing is expected. |
| **Feasible-path mode** | Validates against all feasible paths (BGP best path + alternatives). Best balance for SRv6 core networks. | Preferred for SRv6 core interfaces where available. |

```cisco
!! Enable strict uRPF on external interfaces
interface TenGigE0/0/0/0
 description EXTERNAL-PEER
 ipv6 verify unicast source reachable-via rx
!
!! Enable loose uRPF on core interfaces
interface TenGigE0/0/0/1
 description CORE-FACING
 ipv6 verify unicast source reachable-via any
!
```

### Rate Limiting Specifics

| Traffic Type | Recommended Rate Limit | Rationale |
|-------------|----------------------|-----------|
| ICMPv6 to SRv6 SID prefixes | 100-500 pps per interface | Prevents topology discovery via traceroute/ping while allowing legitimate OAM |
| SRH packets to control plane (punt path) | 1000-5000 pps | Prevents CPU exhaustion from SRH processing; legitimate SRH traffic is forwarded in hardware |
| BGP updates for SRv6 SID routes | Standard BGP rate limiting | Prevents BGP flooding; use existing BGP protection mechanisms (GTSM, max-prefix) |
| ICMPv6 Packet Too Big for SRv6 | 50-200 pps per interface | Needed for PMTUD but can be abused for recon; rate-limit conservatively |

```cisco
!! CoPP policy for SRv6-related traffic
policy-map COPP-SRV6
 class ICMPV6-TO-SID-BLOCK
  police rate 500 pps
   conform-action transmit
   exceed-action drop
 !
 class SRH-TO-CONTROL-PLANE
  police rate 2000 pps
   conform-action transmit
   exceed-action drop
 !
!
```

---

## Comparison with MPLS Security

SRv6 and MPLS share a common security foundation (the trusted domain model) but differ in important ways. Understanding these differences helps operators transitioning from MPLS to SRv6.

| Aspect | MPLS | SRv6 |
|--------|------|------|
| **Trust model** | Trusted domain -- labels are only meaningful within the operator's network | Trusted domain -- SIDs are only meaningful within the SRv6 domain |
| **Label/SID visibility** | Labels are locally significant integers (20-bit); not routable outside the network | SIDs are globally routable 128-bit IPv6 addresses; reachable if locator prefix leaks |
| **Per-packet authentication** | None. MPLS has no mechanism equivalent to HMAC. Label integrity relies entirely on physical and logical network security. | Optional HMAC TLV (RFC 8754) provides per-packet cryptographic authentication of the segment list |
| **Boundary filtering** | Implicit -- MPLS labels are not present in IP packets from external sources (LDP/RSVP only assign labels internally) | Explicit filtering required -- SRH is a standard IPv6 extension header that any host can generate |
| **Topology exposure** | Low -- label values reveal nothing about topology; label-to-path mapping requires internal access | Higher -- SRv6 SIDs encode locator information and can be probed via standard IPv6 tools |
| **Attack surface** | Smaller -- requires access to the MPLS data plane (typically Layer 2 adjacency) | Larger -- any IPv6-capable host can craft packets with SRH targeting the SRv6 domain |
| **Encryption** | MACsec on links; no native payload encryption | MACsec on links; IPsec integration possible (but complex with SRH) |

!!! note "The HMAC advantage"
    While SRv6 has a larger attack surface than MPLS (due to SIDs being routable IPv6 addresses), it also has a stronger optional defense: HMAC provides cryptographic proof that the segment list was created by an authorized node. MPLS has no equivalent mechanism -- label integrity is assumed, never verified.

!!! info "Migration consideration"
    Operators moving from MPLS to SRv6 must recognize that the "implicit security" of MPLS (labels not being externally routable) is replaced by **explicit security** in SRv6 (mandatory boundary filtering). This is the most important operational difference: SRv6 security requires active configuration, while MPLS security was largely passive.

---

## Further Reading

- :material-arrow-right: [SRH Mechanics & Packet Walk](srh-packet-walk.md) - SRH format including HMAC TLV
- :material-arrow-right: [OAM & Troubleshooting](oam-troubleshooting.md) - Detecting SRv6 issues
- :material-file-document: [RFC 8754](../rfcs/rfc8754.md) - SRH specification including HMAC

## References

1. [RFC 8754 - IPv6 Segment Routing Header](https://datatracker.ietf.org/doc/rfc8754/) - Section 7 defines HMAC TLV and security considerations for SRH
2. [RFC 8402 - Segment Routing Architecture](https://datatracker.ietf.org/doc/rfc8402/) - Section 8 covers SR security properties and the trusted domain model
3. [draft-ietf-spring-srv6-security](https://datatracker.ietf.org/doc/draft-ietf-spring-srv6-security/) - IETF draft on security considerations specific to SRv6 deployments
