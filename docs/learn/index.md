---
title: Learn SRv6
seo_title: "Learn SRv6: Free SRv6 Course with Videos and Labs"
description: "Learn SRv6 for free: a structured course from SIDs and the SRH to TI-LFA, L3VPN, migration, vendor configs and AI fabrics, with written lessons, videos and hands-on labs."
tags:
  - srv6 course
  - learn srv6
  - srv6 training
---

# Learn SRv6: the free SRv6.md course

**The free SRv6 course. From your first SID to AI fabrics.** A structured, vendor-neutral SRv6 course with 39 lessons in 8 tracks. Every lesson is a written guide on srv6.md, a video on the SRv6.md YouTube channel (launching soon) and, where it applies, a lab you can run on your laptop. No sign-up, no paywall, MIT licensed.

!!! tip "How to use the course"
    1. **Read** the lesson on srv6.md: every page cites the RFCs behind it.
    2. **Watch** the video when you prefer to see it animated.
    3. **Build it**: the [labs](../labs/index.md) reproduce each concept with free tools.
    4. **Check yourself** with the FAQ at the end of each lesson.

Video lessons are in production and will be published here track by track. Every lesson already has its written guide.

## Start Here

**Level:** All levels. What SRv6 is, why it matters, and how this course works.

| # | Lesson |
|:-:|--------|
| 1 | [Learn SRv6 for Free: How the SRv6.md Course Works](../learn/index.md) |

## Track 1: SRv6 Foundations

**Level:** Beginner. The data plane. SIDs, the SRH, behaviors and uSID, with a packet walk you can follow hop by hop.

| # | Lesson |
|:-:|--------|
| 1 | [What is SRv6? Segment Routing over IPv6 Explained](../topics/what-is-srv6.md) |
| 2 | [SRv6 SID Structure: Locator, Function and Argument](../topics/sid-structure.md) |
| 3 | [The SRv6 Header (SRH): Packet Walk, Step by Step](../topics/srh-packet-walk.md) |
| 4 | [SRv6 Network Programming: End, End.X, End.DT4 and More](../topics/network-programming.md) |
| 5 | [SRv6 uSID (Micro-SID) Explained: Six Hops in One Address](../topics/usid-compression.md) |
| 6 | [SRv6 vs MPLS: Differences, Overhead and When to Use Each](../topics/srv6-vs-sr-mpls.md) |

## Track 2: Control Plane and Services

**Level:** Intermediate. How the network learns SIDs and turns them into paths and services.

| # | Lesson |
|:-:|--------|
| 1 | [IS-IS for SRv6: Locators and SIDs in the IGP](../rfcs/rfc9352.md) |
| 2 | [Flex-Algo with SRv6: Network Slicing Without RSVP-TE](../topics/flex-algorithm.md) |
| 3 | [TI-LFA Explained: 50 ms Fast Reroute with SRv6](../topics/ti-lfa.md) |
| 4 | [SR Policy Explained: Color, ODN and Binding SID](../topics/sr-policy.md) |
| 5 | [SRv6 L3VPN with BGP (RFC 9252), Step by Step](../topics/bgp-overlay-services.md) |
| 6 | [EVPN over SRv6 and EVPN Multihoming](../topics/evpn-multihoming.md) |

## Track 3: Operating SRv6

**Level:** Intermediate. Troubleshooting, measuring, securing and migrating a real network.

| # | Lesson |
|:-:|--------|
| 1 | [SRv6 Troubleshooting: Ping, Traceroute and OAM](../topics/oam-troubleshooting.md) |
| 2 | [SRv6 Performance Measurement and Telemetry](../topics/srpm.md) |
| 3 | [SRv6 Security: Filtering 5f00::/16 and the SRH](../topics/security.md) |
| 4 | [MPLS to SRv6 Migration: Four Real Strategies](../topics/interworking-migration.md) |

## Track 4: Hands-on Labs

**Level:** Beginner to Intermediate. Build SRv6 on your laptop with free tools, and read every packet in Wireshark.

| # | Lesson |
|:-:|--------|
| 1 | [Build a Free SRv6 Lab with Containerlab and FRRouting](../labs/containerlab.md) |
| 2 | [SRv6 Labs in Minutes with netlab](../labs/netlab.md) |
| 3 | [SRv6 on Linux: seg6 and iproute2 from Scratch](../implementations/linux-kernel.md) |
| 4 | [Reading SRv6 in Wireshark: SRH Filters and Captures](../labs/pcaps.md) |
| 5 | [Decode Any SRv6 SID or uSID in Your Browser](../tools/sid-decoder.md) |

## Track 5: SRv6 for AI Networks

**Level:** Advanced. How OpenAI, Microsoft, Meta and Alibaba use SRv6 in GPU fabrics and between AI data centers.

| # | Lesson |
|:-:|--------|
| 1 | [MRC and SRv6: How OpenAI Networks 100,000 GPUs](../ai/mrc.md) |
| 2 | [Designing an AI Fabric with SRv6](../ai/ai-fabric-design.md) |
| 3 | [SRv6 vs ECMP, Adaptive Routing and Ultra Ethernet](../ai/srv6-vs-ai-fabric-alternatives.md) |
| 4 | [SRv6 Between AI Data Centers (Scale-Across)](../ai/scale-across.md) |
| 5 | [SRv6 for AI Inference over the WAN](../ai/inference-wan.md) |

## Track 6: SRv6 Configuration by Vendor

**Level:** Intermediate. The same SRv6 L3VPN, configured and verified on each major platform.

| # | Lesson |
|:-:|--------|
| 1 | [SRv6 on Cisco IOS XR: uSID Locators and L3VPN](../implementations/cisco-ios-xr.md) |
| 2 | [SRv6 on Juniper Junos](../implementations/juniper.md) |
| 3 | [SRv6 on Nokia SR OS](../implementations/nokia-sros.md) |
| 4 | [SRv6 on Arista EOS](../implementations/arista-eos.md) |
| 5 | [SRv6 with FRRouting](../implementations/frrouting.md) |
| 6 | [SRv6 on SONiC](../implementations/sonic.md) |

## SRv6 en español

**Level:** Principiante. Las lecciones esenciales del curso, en español.

| # | Lesson |
|:-:|--------|
| 1 | [¿Qué es SRv6? Segment Routing sobre IPv6 explicado](../es/que-es-srv6.md) |
| 2 | [Estructura del SID en SRv6: localizador, función y argumento](../es/estructura-del-sid.md) |
| 3 | [La cabecera SRH de SRv6, paso a paso](../es/cabecera-srh.md) |
| 4 | [uSID en SRv6: seis saltos en una dirección](../es/usid.md) |
| 5 | [SRv6 vs MPLS: diferencias y cuándo usar cada uno](../es/srv6-vs-sr-mpls.md) |
| 6 | [SRv6 en redes de IA](../es/ia.md) |

## Frequently Asked Questions

### Is the SRv6.md course free?

Yes. Every lesson, video and lab is free, with no sign-up. The written lessons are MIT licensed.

### Where should I start learning SRv6?

Start with Track 1, SRv6 Foundations, which begins with What is SRv6? and ends with SRv6 vs MPLS. If you already know Segment Routing with MPLS, you can jump to the uSID lesson.

### Do I need real routers to follow the course?

No. The labs run on a laptop with free tools such as Containerlab, netlab and FRRouting, and the packet captures open in Wireshark.

### Is there a certificate?

Not today. The course is a free learning path, not a vendor certification. It covers the vendor-neutral SRv6 knowledge that certifications such as Cisco CCIE Service Provider or Juniper JNCIE-SP also test.

### Is the course available in Spanish?

Yes. The SRv6 en español track covers the essential lessons in Spanish, and the written guides have Spanish and Japanese versions.

## Further Reading

- :material-arrow-right: [SRv6 Fundamentals and Key Concepts](../topics/index.md) - Every topic page
- :material-arrow-right: [SRv6 documentation index](../docs/index.md) - Official docs for every vendor
- :material-arrow-right: [SRv6 White Paper 2026](../white-papers/srv6-white-paper-2026.md) - Design and migration for architects

<script type="application/ld+json">{"@context": "https://schema.org", "@type": "Course", "name": "Learn SRv6: The Free SRv6.md Course", "description": "A free, vendor-neutral course on Segment Routing over IPv6 (SRv6): SIDs, the SRH, uSID, TI-LFA, SR Policy, BGP services, operations, migration from MPLS, vendor configuration and SRv6 for AI networks.", "url": "https://srv6.md/learn/", "provider": {"@type": "Organization", "name": "SRv6.md", "sameAs": "https://srv6.md"}, "isAccessibleForFree": true, "inLanguage": ["en", "es"], "educationalLevel": "Beginner to Advanced", "teaches": "Segment Routing over IPv6 (SRv6)", "numberOfCredits": 0, "offers": {"@type": "Offer", "price": "0", "priceCurrency": "USD", "category": "Free"}, "hasCourseInstance": {"@type": "CourseInstance", "courseMode": "Online", "courseWorkload": "PT10H"}}</script>
