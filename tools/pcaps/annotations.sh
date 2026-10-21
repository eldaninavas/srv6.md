# Per-frame comments written into the captures (Wireshark: frame.comment,
# or View > Packet Comments). Sourced by lab.sh after the scenarios run; a
# file whose frame count differs from the expected one is left uncommented.
# The same walkthroughs, with more detail, are on https://srv6.md/labs/pcaps/

annotate srv6-h-encaps-srh-end-dt4 10 \
  "1:[r1-h1] h1 -> 198.51.100.10, plain IPv4 into VRF blue on r1" \
  "2:[r2-r1] H.Encaps by r1: DA = first SID 5f00:0:2:1:: (End r2). SRH SL=2, Last Entry=2, [0] 5f00:0:4:d4:: (End.DT4 r4) [1] 5f00:0:3:1:: (End r3) [2] 5f00:0:2:1::. SRH next header 4 (IPv4)" \
  "3:[r2-r3] r2 ran End: SL 2->1, DA <- Segment List[1] = 5f00:0:3:1::, hop limit 63->62. SRH otherwise unchanged" \
  "4:[r3-r4] r3 ran End: SL 1->0, DA <- Segment List[0] = 5f00:0:4:d4:: (End.DT4)" \
  "5:[r4-h2] r4 ran End.DT4: outer IPv6 + SRH removed, inner IPv4 looked up in VRF blue (table 100)" \
  "6:[r4-h2] h2 echo reply" \
  "7:[r3-r4] reply: H.Encaps by r4, SL=2, list [0] 5f00:0:1:d4:: [1] 5f00:0:2:1:: [2] 5f00:0:3:1::" \
  "8:[r2-r3] reply after End on r3: SL 2->1, DA 5f00:0:2:1::" \
  "9:[r2-r1] reply after End on r2: SL 1->0, DA 5f00:0:1:d4:: (End.DT4 r1)" \
  "10:[r1-h1] reply decapsulated by End.DT4 on r1"

annotate srv6-h-encaps-red-end-dt6 20 \
  "1:[r1-h1] h1 -> 2001:db8:b::10 (3-SID H.Encaps.Red policy)" \
  "2:[r2-r1] H.Encaps.Red: DA = first SID 5f00:0:2:1::, which is NOT in the SRH. SRH SL=2, Last Entry=1, [0] 5f00:0:4:d6:: [1] 5f00:0:3:1::. SL > Last Entry is legal only for .Red. Next header 41 (IPv6)" \
  "3:[r2-r3] End on r2: SL 2->1, DA <- [1] 5f00:0:3:1::" \
  "4:[r3-r4] End on r3: SL 1->0, DA <- [0] 5f00:0:4:d6:: (End.DT6)" \
  "5:[r4-h2] End.DT6 on r4: decapsulated into VRF blue" \
  "6:[r4-h2] echo reply" \
  "7:[r3-r4] reply: H.Encaps.Red with one SID -> no SRH at all. Outer next header 41, DA 5f00:0:1:d6::" \
  "8:[r2-r3] reply: transit nodes forward on the DA only (plain IPv6 forwarding)" \
  "9:[r2-r1] reply" \
  "10:[r1-h1] reply after End.DT6 on r1" \
  "11:[r1-h1] h1 -> 2001:db8:b::20 (1-SID H.Encaps.Red policy)" \
  "12:[r2-r1] H.Encaps.Red with one SID: no SRH. IPv6 next header 41, DA 5f00:0:4:d6::" \
  "13:[r2-r3] r2 is not the DA: plain IPv6 forwarding" \
  "14:[r3-r4] r3: plain IPv6 forwarding" \
  "15:[r4-h2] End.DT6 on r4" \
  "16:[r4-h2] echo reply" \
  "17:[r3-r4] reply (no SRH)" \
  "18:[r2-r3] reply (no SRH)" \
  "19:[r2-r1] reply (no SRH)" \
  "20:[r1-h1] reply after End.DT6 on r1"

annotate srv6-end-x-adjacency 12 \
  "1:[r2-r1] flow 1, segment list End r2 (5f00:0:2:1::) + End.DT4 r4: SL=1" \
  "2:[r2-r3] End on r2: SL 1->0, DA 5f00:0:4:d4::, forwarded on the shortest path = link A (r2-r3)" \
  "3:[r3-r4] r3 is not in the segment list: forwards on the DA only, SRH untouched" \
  "4:[r3-r4] reply: 1-SID H.Encaps.Red (no SRH) toward End.DT4 r1" \
  "5:[r2-r3] reply on link A" \
  "6:[r2-r1] reply" \
  "7:[r2-r1] flow 2, segment list End.X r2 (5f00:0:2:41::) + End.DT4 r4: SL=1" \
  "8:[r2-r3b] End.X on r2: SL 1->0, DA 5f00:0:4:d4::, sent to the End.X next hop 2001:db8:1:23::3 on link B (r2-r3b), not the shortest path" \
  "9:[r3-r4] r3 forwards on the DA" \
  "10:[r3-r4] reply (no SRH)" \
  "11:[r2-r3] reply on link A (the reverse path has no End.X)" \
  "12:[r2-r1] reply"

annotate srv6-end-dt46-dual-stack 12 \
  "1:[r1-h1] IPv4 echo h1 -> h2" \
  "2:[r2-r1] H.Encaps.Red, one SID, no SRH: outer next header 4 (IPv4), DA 5f00:0:4:d46:: (End.DT46 r4)" \
  "3:[r4-h2] End.DT46 on r4: inner IPv4 delivered into VRF blue" \
  "4:[r4-h2] IPv4 echo reply" \
  "5:[r2-r1] reply: next header 4, DA 5f00:0:1:d46:: (End.DT46 r1)" \
  "6:[r1-h1] IPv4 reply after End.DT46 on r1" \
  "7:[r1-h1] IPv6 echo h1 -> h2" \
  "8:[r2-r1] same SID 5f00:0:4:d46::, now outer next header 41 (IPv6). End.DT46 dispatches on this field" \
  "9:[r4-h2] End.DT46 on r4: inner IPv6 delivered into VRF blue" \
  "10:[r4-h2] IPv6 echo reply" \
  "11:[r2-r1] reply: next header 41, DA 5f00:0:1:d46::" \
  "12:[r1-h1] IPv6 reply after End.DT46 on r1"

annotate srv6-end-dx2-l2-ethernet 8 \
  "1:[r1-h1] Ethernet frame h1 -> h2 (203.0.113.1 -> .2) arriving at r1" \
  "2:[r2-r1] H.Encaps.L2: the whole Ethernet frame is the payload. SRH SL=1, Last Entry=1, [0] 5f00:0:4:d2:: (End.DX2 r4) [1] 5f00:0:3:1:: (End r3), SRH next header 143 (Ethernet)" \
  "3:[r3-r4] End on r3: SL 1->0, DA 5f00:0:4:d2::" \
  "4:[r4-h2] End.DX2 on r4: inner frame sent out r4-h2 unchanged (same MACs, IPv4 TTL still 64)" \
  "5:[r4-h2] reply frame h2 -> h1" \
  "6:[r3-r4] reply: H.Encaps.L2.Red with one SID -> no SRH, IPv6 next header 143, DA 5f00:0:1:d2::" \
  "7:[r2-r1] reply" \
  "8:[r1-h1] End.DX2 on r1: frame delivered to h1 unchanged"

annotate srv6-usid-next-csid 16 \
  "1:[r2-r1] flow 1: one uSID container 5f00:0:2:3:4:e000:: = block 5f00:0 + uN 2, uN 3, uN 4, uDT46 e000. No SRH (H.Encaps.Red, 1 SID), next header 4" \
  "2:[r2-r3] r2 (uN, NEXT-C-SID): shifted the container left by 16 bits -> 5f00:0:3:4:e000::" \
  "3:[r3-r4] r3 shifted again -> 5f00:0:4:e000::" \
  "4:[r4-h2] r4: 5f00:0:4:e000::/64 is End.DT46 -> decapsulated into VRF blue" \
  "5:[r4-h2] echo reply" \
  "6:[r3-r4] reply container 5f00:0:3:2:1:e000::" \
  "7:[r2-r3] reply after shift on r3: 5f00:0:2:1:e000::" \
  "8:[r2-r1] reply after shift on r2: 5f00:0:1:e000:: (uDT46 r1)" \
  "9:[r2-r1] flow 2: two containers. DA 5f00:0:2:3:: (first container, not in the SRH: H.Encaps.Red). SRH SL=1, Last Entry=0, [0] 5f00:0:4:e000::" \
  "10:[r2-r3] r2 shifted: DA 5f00:0:3::, SRH untouched (SL still 1)" \
  "11:[r3-r4] r3: no uSID left after its own, so End consumed the SRH: SL 1->0, DA <- [0] 5f00:0:4:e000::" \
  "12:[r4-h2] uDT46 on r4: inner IPv6 delivered" \
  "13:[r4-h2] echo reply" \
  "14:[r3-r4] reply: one container, no SRH, next header 41" \
  "15:[r2-r3] reply shifted on r3" \
  "16:[r2-r1] reply shifted on r2"

annotate srv6-ping-traceroute-srh 18 \
  "1:[r2-r1] ping from r1 (SR source node) to r4 loopback 2001:db8:ffff::4 via End r2, End r3. SRH SL=2, [0] = the final destination 2001:db8:ffff::4, next header 58 (ICMPv6). No outer header: r1 built the SRH into its own packet" \
  "2:[r2-r3] End on r2: SL 2->1, DA 5f00:0:3:1::" \
  "3:[r3-r4] End on r3: SL 1->0, DA = 2001:db8:ffff::4. r4 accepts SL=0 and processes ICMPv6" \
  "4:[r3-r4] echo reply from r4: ordinary IPv6, no SRH" \
  "5:[r2-r3] echo reply" \
  "6:[r2-r1] echo reply" \
  "7:[r2-r1] traceroute probe 1: UDP, hop limit 1, SRH SL=2" \
  "8:[r2-r1] ICMPv6 Time Exceeded from r2. The quoted packet already shows r2's End processing (DA 5f00:0:3:1::, SL=1): Linux updates the SRH before the hop-limit check" \
  "9:[r2-r1] probe 2: hop limit 2" \
  "10:[r2-r3] probe 2 after End on r2: hop limit 1, SL=1" \
  "11:[r2-r3] Time Exceeded from r3, quoting DA 2001:db8:ffff::4, SL=0" \
  "12:[r2-r1] Time Exceeded from r3 on its way back" \
  "13:[r2-r1] probe 3: hop limit 3" \
  "14:[r2-r3] probe 3 after End on r2" \
  "15:[r3-r4] probe 3 after End on r3: SL=0, DA = r4" \
  "16:[r3-r4] ICMPv6 Port Unreachable from r4 (destination reached)" \
  "17:[r2-r3] Port Unreachable" \
  "18:[r2-r1] Port Unreachable"

annotate srv6-srh-hmac-tlv 7 \
  "1:[r2-r1] H.Encaps with HMAC key 7: SRH length 80 bytes = 8 + 2x16 segments + 40-byte HMAC TLV (type 5, length 38, key ID 7, 32-byte HMAC-SHA256). Flags 0x08 is the Linux legacy H-flag. Wireshark 4.4 does not dissect the TLV: see the bytes after Address[1]" \
  "2:[r2-r3] r2 (seg6_require_hmac=1) verified the HMAC and ran End: SL 1->0, DA 5f00:0:4:d4::. The TLV is carried unchanged; r4 verifies it again before End.DT4" \
  "3:[r4-h2] End.DT4 on r4" \
  "4:[r4-h2] echo reply" \
  "5:[r2-r3] reply: 1-SID H.Encaps.Red, no SRH, no HMAC" \
  "6:[r2-r1] reply" \
  "7:[r2-r1] same path WITHOUT the HMAC TLV (flags 0x00, SRH 56 bytes): r2 requires HMAC on r2-r1 and drops it. Nothing leaves r2"

annotate synthetic-srv6-srh-o-flag 3 \
  "1:SYNTHETIC (Scapy). SRH Flags 0x20 = O-flag (RFC 9259, bit 2). SL=2, DA End r2" \
  "2:SYNTHETIC. As forwarded after End on r2: SL=1. A node supporting RFC 9259 would also punt a timestamped copy to its OAM process" \
  "3:SYNTHETIC. After End on r3: SL=0, DA = final destination"
