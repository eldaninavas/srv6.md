#!/usr/bin/env python3
"""SYNTHETIC SRv6 packets for the srv6.md capture library.

Linux has no way to set the SRH O-flag (RFC 9259), so this capture is built
with Scapy instead of recorded from the lab. It mirrors scenario 1's topology
and addressing: r1 sends an ICMPv6 echo through End r2 and End r3 with the
O-flag set (SRH Flags bit 2, 0x20). Three frames: one per hop, as a capture on
r1->r2, r2->r3 and r3->r4 would show if every node simply forwarded it.

Usage: synthetic.py <out.pcapng>
"""
import sys

from scapy.layers.inet6 import ICMPv6EchoRequest, IPv6, IPv6ExtHdrSegmentRouting
from scapy.layers.l2 import Ether
from scapy.utils import wrpcapng

SEGMENTS = ["2001:db8:ffff::4", "5f00:0:3:1::", "5f00:0:2:1::"]  # [0] = last
HOPS = [  # (src MAC, dst MAC, hop limit, segments left)
    ("02:00:00:01:02:00", "02:00:00:02:01:00", 64, 2),
    ("02:00:00:02:03:00", "02:00:00:03:02:00", 63, 1),
    ("02:00:00:03:04:00", "02:00:00:04:03:00", 62, 0),
]
T0 = 1792540800.0  # 2026-10-21 00:00:00 UTC, fixed so the file is reproducible

frames = []
for i, (smac, dmac, hlim, sl) in enumerate(HOPS):
    srh = IPv6ExtHdrSegmentRouting(
        addresses=SEGMENTS, segleft=sl, lastentry=len(SEGMENTS) - 1, oam=1, nh=58
    )
    pkt = (
        Ether(src=smac, dst=dmac)
        / IPv6(src="2001:db8:ffff::1", dst=SEGMENTS[sl], hlim=hlim)
        / srh
        / ICMPv6EchoRequest(id=0x5f00, seq=1, data=b"srv6.md O-flag synthetic")
    )
    pkt = Ether(bytes(pkt))
    pkt.time = T0 + i * 0.0001
    frames.append(pkt)

wrpcapng(sys.argv[1], frames)
