#!/bin/bash
# SRv6 packet capture lab for https://srv6.md/labs/pcaps/
#
# Builds a six-namespace topology on the running kernel, runs one scenario at a
# time, captures with dumpcap on the interfaces that matter and merges the
# per-interface captures into one pcapng per scenario.
#
#   h1 --- r1 --- r2 ===== r3 --- r4 --- h2
#                    (A,B)
#
# r1 and r4 are PEs with a customer VRF "blue" (table 100); r2 and r3 are P
# routers joined by two parallel links (A = default path, B = End.X target).
# Static routes stand in for the IGP. Nothing leaves the namespaces.
#
# Usage (as root, inside tools/pcaps/Containerfile or any host with
# iproute2 >= 6.1, dumpcap, mergecap, editcap and tshark):
#   ./lab.sh <scenario>|all [outdir]
set -euo pipefail

OUT=${2:-/out}
WORK=$(mktemp -d)
NODES="h1 r1 r2 r3 r4 h2"
mkdir -p "$OUT"

x() { ip netns exec "$@"; }

# ---------------------------------------------------------------- topology --

# link <nsA> <ifA> <macA> <nsB> <ifB> <macB>
link() {
  ip link add "$2" netns "$1" address "$3" type veth peer name "$5" netns "$4" address "$6"
  ip -n "$1" link set "$2" up
  ip -n "$4" link set "$5" up
}

topo_down() {
  for n in $NODES; do ip netns del "$n" 2>/dev/null || true; done
}

topo_up() {
  topo_down
  for n in $NODES; do
    ip netns add "$n"
    ip -n "$n" link set lo up
    x "$n" sysctl -qw net.ipv6.conf.all.accept_dad=0 net.ipv6.conf.default.accept_dad=0
    x "$n" sysctl -qw net.ipv6.conf.all.accept_ra=0 net.ipv6.conf.default.accept_ra=0
    x "$n" sysctl -qw net.ipv6.conf.default.router_solicitations=0
    x "$n" sysctl -qw net.ipv4.conf.all.rp_filter=0 net.ipv4.conf.default.rp_filter=0
  done
  for r in r1 r2 r3 r4; do
    x "$r" sysctl -qw net.ipv6.conf.all.forwarding=1 net.ipv4.ip_forward=1
    x "$r" sysctl -qw net.ipv6.conf.all.seg6_enabled=1 net.ipv6.conf.default.seg6_enabled=1
  done

  # MAC 02:00:00:<node>:<peer>:<link>  (h1 = 10, h2 = 20, rN = 0N)
  link h1 h1-r1  02:00:00:10:01:00  r1 r1-h1  02:00:00:01:10:00
  link r1 r1-r2  02:00:00:01:02:00  r2 r2-r1  02:00:00:02:01:00
  link r2 r2-r3  02:00:00:02:03:00  r3 r3-r2  02:00:00:03:02:00
  link r2 r2-r3b 02:00:00:02:03:0b  r3 r3-r2b 02:00:00:03:02:0b
  link r3 r3-r4  02:00:00:03:04:00  r4 r4-r3  02:00:00:04:03:00
  link r4 r4-h2  02:00:00:04:20:00  h2 h2-r4  02:00:00:20:04:00

  # Customer VRF "blue" on the PEs
  for r in r1 r4; do
    ip -n "$r" link add blue type vrf table 100
    ip -n "$r" link set blue up
    x "$r" sysctl -qw net.vrf.strict_mode=1 net.ipv4.conf.blue.rp_filter=0
  done
  ip -n r1 link set r1-h1 master blue
  ip -n r4 link set r4-h2 master blue

  # Customer sites: A = 192.0.2.0/24 + 2001:db8:a::/64, B = 198.51.100.0/24 + 2001:db8:b::/64
  ip -n h1 addr add 192.0.2.10/24 dev h1-r1
  ip -n h1 addr add 2001:db8:a::10/64 dev h1-r1 nodad
  ip -n h1 route add default via 192.0.2.1
  ip -n h1 -6 route add default via 2001:db8:a::1
  ip -n r1 addr add 192.0.2.1/24 dev r1-h1
  ip -n r1 addr add 2001:db8:a::1/64 dev r1-h1 nodad
  ip -n h2 addr add 198.51.100.10/24 dev h2-r4
  ip -n h2 addr add 2001:db8:b::10/64 dev h2-r4 nodad
  ip -n h2 route add default via 198.51.100.1
  ip -n h2 -6 route add default via 2001:db8:b::1
  ip -n r4 addr add 198.51.100.1/24 dev r4-h2
  ip -n r4 addr add 2001:db8:b::1/64 dev r4-h2 nodad

  # Core links and loopbacks
  ip -n r1 addr add 2001:db8:0:12::1/64 dev r1-r2 nodad
  ip -n r2 addr add 2001:db8:0:12::2/64 dev r2-r1 nodad
  ip -n r2 addr add 2001:db8:0:23::2/64 dev r2-r3 nodad
  ip -n r3 addr add 2001:db8:0:23::3/64 dev r3-r2 nodad
  ip -n r2 addr add 2001:db8:1:23::2/64 dev r2-r3b nodad
  ip -n r3 addr add 2001:db8:1:23::3/64 dev r3-r2b nodad
  ip -n r3 addr add 2001:db8:0:34::3/64 dev r3-r4 nodad
  ip -n r4 addr add 2001:db8:0:34::4/64 dev r4-r3 nodad
  for i in 1 2 3 4; do
    ip -n r$i addr add 2001:db8:ffff::$i/128 dev lo
    ip -n r$i sr tunsrc set 2001:db8:ffff::$i    # outer source of H.Encaps = loopback
  done

  # "IGP": locator 5f00:0:N::/48 and loopback of every router (r2 -> r3 prefers link A)
  route_to() { # <router> <next hop> <dev> <node numbers...>
    local r=$1 nh=$2 dev=$3; shift 3
    for n in "$@"; do
      ip -n "$r" -6 route add 5f00:0:$n::/48 via "$nh" dev "$dev"
      ip -n "$r" -6 route add 2001:db8:ffff::$n/128 via "$nh" dev "$dev"
    done
  }
  route_to r1 2001:db8:0:12::2 r1-r2 2 3 4
  route_to r2 2001:db8:0:12::1 r2-r1 1
  route_to r2 2001:db8:0:23::3 r2-r3 3 4
  route_to r3 2001:db8:0:23::2 r3-r2 1 2
  route_to r3 2001:db8:0:34::4 r3-r4 4
  route_to r4 2001:db8:0:34::3 r4-r3 1 2 3
  ip -n r1 -6 route add 2001:db8::/48 via 2001:db8:0:12::2 dev r1-r2
  ip -n r4 -6 route add 2001:db8::/48 via 2001:db8:0:34::3 dev r4-r3
  ip -n r2 -6 route add 2001:db8:0:34::/64 via 2001:db8:0:23::3 dev r2-r3
  ip -n r3 -6 route add 2001:db8:0:12::/64 via 2001:db8:0:23::2 dev r3-r2

  # The encapsulated packet of a VRF route is looked up in the VRF's IPv6
  # table, so leak the SRv6 block into it (a real PE does this implicitly).
  ip -n r1 -6 route add 5f00::/16 vrf blue via 2001:db8:0:12::2 dev r1-r2
  ip -n r4 -6 route add 5f00::/16 vrf blue via 2001:db8:0:34::3 dev r4-r3

  # seg6_enabled is the lower of "all" and the interface value
  for r in r1 r2 r3 r4; do
    x "$r" sh -c 'for d in /proc/sys/net/ipv6/conf/*; do echo 1 > "$d/seg6_enabled"; done'
  done
  sleep 1
}

# ----------------------------------------------------------------- capture --

PIDS=()
FILES=()

# cap_start <ns>:<if> ...
cap_start() {
  PIDS=(); FILES=()
  for spec in "$@"; do
    local ns=${spec%%:*} ifc=${spec#*:}
    local f="$WORK/$ns-$ifc.pcapng"
    ip netns exec "$ns" dumpcap -q -i "$ifc" -w "$f" 2>/dev/null &
    PIDS+=($!); FILES+=("$f")
  done
  sleep 2
}

# cap_stop <name> [capture comment]
# Merges the per-interface files, drops ND/MLD/ARP noise and writes $OUT/<name>.pcapng
cap_stop() {
  local name=$1 comment=${2:-}
  sleep 1
  kill -TERM "${PIDS[@]}" 2>/dev/null || true
  wait "${PIDS[@]}" 2>/dev/null || true
  mergecap -w "$WORK/merged.pcapng" "${FILES[@]}"
  tshark -r "$WORK/merged.pcapng" \
    -Y '!arp && !(icmpv6.type >= 130 && icmpv6.type <= 143) && !(ipv6.dst == ff00::/8)' \
    -w "$WORK/filtered.pcapng"
  editcap --discard-capture-comment --capture-comment "srv6.md SRv6 capture library: $name. ${comment} Generated with tools/pcaps/lab.sh on Linux $(uname -r), iproute2 $(ip -V | sed 's/.*iproute2-//; s/,.*//'). https://srv6.md/labs/pcaps/" \
    "$WORK/filtered.pcapng" "$OUT/$name.pcapng"
  rm -f "$WORK"/*.pcapng
  echo "== $name: $(capinfos -c -M "$OUT/$name.pcapng" | awk '/Number of packets/ {print $NF}') packets"
}

# annotate <name> <expected frame count> "<frame>:<comment>" ...
# Adds per-frame comments (Wireshark: frame.comment) if the capture has the
# expected number of frames; otherwise leaves the file uncommented.
annotate() {
  local name=$1 want=$2; shift 2
  local f="$OUT/$name.pcapng"
  [ -f "$f" ] || return 0
  local got; got=$(capinfos -c -M "$f" | awk '/Number of packets/ {print $NF}')
  if [ "$got" != "$want" ]; then
    echo "!! $name has $got frames, expected $want: not annotating" >&2
    return 0
  fi
  local args=()
  for a in "$@"; do args+=(-a "$a"); done
  editcap "${args[@]}" "$f" "$WORK/annotated.pcapng" && mv "$WORK/annotated.pcapng" "$f"
}

# --------------------------------------------------------------- scenarios --

# Each scenario: SIDs, headend routes, capture points, traffic. Annotations
# are added afterwards (annotations.sh) so the scenario bodies stay readable.

# 1. H.Encaps with a three-segment SRH: End (r2), End (r3), End.DT4 (r4)
s_h_encaps() {
  topo_up
  ip -n r2 -6 route add 5f00:0:2:1::/128 encap seg6local action End dev r2-r1
  ip -n r3 -6 route add 5f00:0:3:1::/128 encap seg6local action End dev r3-r2
  ip -n r4 -6 route add 5f00:0:4:d4::/128 encap seg6local action End.DT4 vrftable 100 dev blue
  ip -n r1 -6 route add 5f00:0:1:d4::/128 encap seg6local action End.DT4 vrftable 100 dev blue
  ip -n r1 route add 198.51.100.0/24 vrf blue encap seg6 mode encap \
      segs 5f00:0:2:1::,5f00:0:3:1::,5f00:0:4:d4:: dev r1-r2
  ip -n r4 route add 192.0.2.0/24 vrf blue encap seg6 mode encap \
      segs 5f00:0:3:1::,5f00:0:2:1::,5f00:0:1:d4:: dev r4-r3

  cap_start r1:r1-h1 r2:r2-r1 r2:r2-r3 r3:r3-r4 r4:r4-h2
  x h1 ping -c 1 -W 2 198.51.100.10
  cap_stop srv6-h-encaps-srh-end-dt4 "H.Encaps with a 3-SID SRH (End r2, End r3, End.DT4 r4), IPv4 L3VPN."
}

# 2. H.Encaps.Red: first SID only in the DA. Three SIDs -> two-entry SRH;
#    one SID -> no SRH. IPv6 L3VPN, End.DT6.
s_h_encaps_red() {
  topo_up
  ip -n h2 addr add 2001:db8:b::20/64 dev h2-r4 nodad
  ip -n r2 -6 route add 5f00:0:2:1::/128 encap seg6local action End dev r2-r1
  ip -n r3 -6 route add 5f00:0:3:1::/128 encap seg6local action End dev r3-r2
  ip -n r4 -6 route add 5f00:0:4:d6::/128 encap seg6local action End.DT6 vrftable 100 dev blue
  ip -n r1 -6 route add 5f00:0:1:d6::/128 encap seg6local action End.DT6 vrftable 100 dev blue
  ip -n r1 -6 route add 2001:db8:b::10/128 vrf blue encap seg6 mode encap.red \
      segs 5f00:0:2:1::,5f00:0:3:1::,5f00:0:4:d6:: dev r1-r2
  ip -n r1 -6 route add 2001:db8:b::20/128 vrf blue encap seg6 mode encap.red \
      segs 5f00:0:4:d6:: dev r1-r2
  ip -n r4 -6 route add 2001:db8:a::/64 vrf blue encap seg6 mode encap.red \
      segs 5f00:0:1:d6:: dev r4-r3

  cap_start r1:r1-h1 r2:r2-r1 r2:r2-r3 r3:r3-r4 r4:r4-h2
  x h1 ping -6 -c 1 -W 2 2001:db8:b::10
  sleep 0.5
  x h1 ping -6 -c 1 -W 2 2001:db8:b::20
  cap_stop srv6-h-encaps-red-end-dt6 "H.Encaps.Red with 3 SIDs (2-entry SRH) and with 1 SID (no SRH), IPv6 L3VPN, End.DT6."
}

# 3. End.X: r2 forwards on the End.X adjacency (link B) instead of the
#    shortest path (link A) that a plain End SID uses.
s_end_x() {
  topo_up
  ip -n h2 addr add 198.51.100.20/24 dev h2-r4
  ip -n r2 -6 route add 5f00:0:2:1::/128 encap seg6local action End dev r2-r1
  ip -n r2 -6 route add 5f00:0:2:41::/128 encap seg6local action End.X nh6 2001:db8:1:23::3 dev r2-r3b
  ip -n r4 -6 route add 5f00:0:4:d4::/128 encap seg6local action End.DT4 vrftable 100 dev blue
  ip -n r1 -6 route add 5f00:0:1:d4::/128 encap seg6local action End.DT4 vrftable 100 dev blue
  ip -n r1 route add 198.51.100.10/32 vrf blue encap seg6 mode encap \
      segs 5f00:0:2:1::,5f00:0:4:d4:: dev r1-r2
  ip -n r1 route add 198.51.100.20/32 vrf blue encap seg6 mode encap \
      segs 5f00:0:2:41::,5f00:0:4:d4:: dev r1-r2
  ip -n r4 route add 192.0.2.0/24 vrf blue encap seg6 mode encap.red \
      segs 5f00:0:1:d4:: dev r4-r3

  cap_start r2:r2-r1 r2:r2-r3 r2:r2-r3b r3:r3-r4
  x h1 ping -c 1 -W 2 198.51.100.10
  sleep 0.5
  x h1 ping -c 1 -W 2 198.51.100.20
  cap_stop srv6-end-x-adjacency "End (shortest path, link A) vs End.X (forced onto link B) at r2."
}

# 4. End.DT46: one SID decapsulates both IPv4 and IPv6 into the VRF.
s_end_dt46() {
  topo_up
  ip -n r4 -6 route add 5f00:0:4:d46::/128 encap seg6local action End.DT46 vrftable 100 dev blue
  ip -n r1 -6 route add 5f00:0:1:d46::/128 encap seg6local action End.DT46 vrftable 100 dev blue
  ip -n r1 route add 198.51.100.0/24 vrf blue encap seg6 mode encap.red segs 5f00:0:4:d46:: dev r1-r2
  ip -n r1 -6 route add 2001:db8:b::/64 vrf blue encap seg6 mode encap.red segs 5f00:0:4:d46:: dev r1-r2
  ip -n r4 route add 192.0.2.0/24 vrf blue encap seg6 mode encap.red segs 5f00:0:1:d46:: dev r4-r3
  ip -n r4 -6 route add 2001:db8:a::/64 vrf blue encap seg6 mode encap.red segs 5f00:0:1:d46:: dev r4-r3

  cap_start r1:r1-h1 r2:r2-r1 r4:r4-h2
  x h1 ping -c 1 -W 2 198.51.100.10
  sleep 0.5
  x h1 ping -6 -c 1 -W 2 2001:db8:b::10
  cap_stop srv6-end-dt46-dual-stack "End.DT46: one SID per VRF for IPv4 (next header 4) and IPv6 (next header 41)."
}

# 5. H.Encaps.L2 + End.DX2: Ethernet frames carried as SRv6 payload
#    (next header 143). Linux steers frames into l2encap with a route, so the
#    PE attachment interfaces take the remote host's MAC and the hosts use
#    static ARP entries; the frames End.DX2 emits are unmodified.
s_end_dx2() {
  topo_up
  ip -n r1 link set r1-h1 nomaster
  ip -n r4 link set r4-h2 nomaster
  ip -n r1 link set r1-h1 address 02:00:00:20:04:00    # = h2's MAC
  ip -n r4 link set r4-h2 address 02:00:00:10:01:00    # = h1's MAC
  ip -n h1 addr add 203.0.113.1/24 dev h1-r1
  ip -n h2 addr add 203.0.113.2/24 dev h2-r4
  ip -n h1 neigh add 203.0.113.2 lladdr 02:00:00:20:04:00 dev h1-r1 nud permanent
  ip -n h2 neigh add 203.0.113.1 lladdr 02:00:00:10:01:00 dev h2-r4 nud permanent
  ip -n r3 -6 route add 5f00:0:3:1::/128 encap seg6local action End dev r3-r2
  ip -n r4 -6 route add 5f00:0:4:d2::/128 encap seg6local action End.DX2 oif r4-h2 dev r4-h2
  ip -n r1 -6 route add 5f00:0:1:d2::/128 encap seg6local action End.DX2 oif r1-h1 dev r1-h1
  ip -n r1 route add 203.0.113.2/32 encap seg6 mode l2encap segs 5f00:0:3:1::,5f00:0:4:d2:: dev r1-r2
  ip -n r4 route add 203.0.113.1/32 encap seg6 mode l2encap.red segs 5f00:0:1:d2:: dev r4-r3

  cap_start r1:r1-h1 r2:r2-r1 r3:r3-r4 r4:r4-h2
  x h1 ping -c 1 -W 2 203.0.113.2
  cap_stop srv6-end-dx2-l2-ethernet "H.Encaps.L2 (2-SID SRH) and H.Encaps.L2.Red (no SRH) with End.DX2, Ethernet payload (next header 143)."
}

# 6. uSID (RFC 9800 NEXT-C-SID): 32-bit block 5f00:0::/32, 16-bit uSIDs.
#    Flow 1: one container, no SRH, DA shifted at every hop.
#    Flow 2: two containers; when the first one is used up, End advances the SRH.
s_usid() {
  topo_up
  # uN SIDs: End with the NEXT-C-SID flavor on each router's whole locator
  ip -n r1 -6 route add 5f00:0:1::/48 encap seg6local action End flavors next-csid lblen 32 nflen 16 dev r1-r2
  ip -n r2 -6 route add 5f00:0:2::/48 encap seg6local action End flavors next-csid lblen 32 nflen 16 dev r2-r1
  ip -n r3 -6 route add 5f00:0:3::/48 encap seg6local action End flavors next-csid lblen 32 nflen 16 dev r3-r2
  ip -n r4 -6 route add 5f00:0:4::/48 encap seg6local action End flavors next-csid lblen 32 nflen 16 dev r4-r3
  # uDT46 SIDs (16-bit function e000 behind the node uSID)
  ip -n r4 -6 route add 5f00:0:4:e000::/64 encap seg6local action End.DT46 vrftable 100 dev blue
  ip -n r1 -6 route add 5f00:0:1:e000::/64 encap seg6local action End.DT46 vrftable 100 dev blue
  ip -n r1 route add 198.51.100.0/24 vrf blue encap seg6 mode encap.red \
      segs 5f00:0:2:3:4:e000:: dev r1-r2
  ip -n r1 -6 route add 2001:db8:b::/64 vrf blue encap seg6 mode encap.red \
      segs 5f00:0:2:3::,5f00:0:4:e000:: dev r1-r2
  ip -n r4 route add 192.0.2.0/24 vrf blue encap seg6 mode encap.red segs 5f00:0:3:2:1:e000:: dev r4-r3
  ip -n r4 -6 route add 2001:db8:a::/64 vrf blue encap seg6 mode encap.red segs 5f00:0:3:2:1:e000:: dev r4-r3

  cap_start r2:r2-r1 r2:r2-r3 r3:r3-r4 r4:r4-h2
  x h1 ping -c 1 -W 2 198.51.100.10
  sleep 0.5
  x h1 ping -6 -c 1 -W 2 2001:db8:b::10
  cap_stop srv6-usid-next-csid "uSID / NEXT-C-SID: container shift without SRH, then a two-container SRH."
}

# 7. Source-routed ping and traceroute from r1 to r4's loopback through
#    r2 and r3: r1 is the SR source node and builds the SRH itself.
s_ping_traceroute() {
  topo_up
  ip -n r2 -6 route add 5f00:0:2:1::/128 encap seg6local action End dev r2-r1
  ip -n r3 -6 route add 5f00:0:3:1::/128 encap seg6local action End dev r3-r2
  ip -n r1 -6 route replace 2001:db8:ffff::4/128 encap seg6 mode inline \
      segs 5f00:0:2:1::,5f00:0:3:1:: dev r1-r2

  cap_start r2:r2-r1 r2:r2-r3 r3:r3-r4
  x r1 ping -6 -c 1 -W 2 2001:db8:ffff::4
  sleep 0.5
  x r1 traceroute -6 -n -q 1 -N 1 -m 4 -w 1 2001:db8:ffff::4
  cap_stop srv6-ping-traceroute-srh "ICMPv6 echo and UDP traceroute originated with an SRH (r1 as SR source node); ICMPv6 Time Exceeded from End nodes."
}

# 8. SRH HMAC TLV (RFC 8754 section 2.1.2): r1 signs, r2 requires it.
s_hmac() {
  topo_up
  ip -n h2 addr add 198.51.100.20/24 dev h2-r4
  # Same key on every node that processes the SRH: End (r2) and End.DT4 (r4)
  # both check an HMAC TLV when one is present (seg6_require_hmac 0 = verify
  # if present, 1 = mandatory, -1 = ignore).
  for r in r1 r2 r4; do
    printf 'srv6.md-demo-key' | ip -n $r sr hmac set 7 sha256 >/dev/null
  done
  x r2 sysctl -qw net.ipv6.conf.r2-r1.seg6_require_hmac=1
  ip -n r2 -6 route add 5f00:0:2:1::/128 encap seg6local action End dev r2-r1
  ip -n r4 -6 route add 5f00:0:4:d4::/128 encap seg6local action End.DT4 vrftable 100 dev blue
  ip -n r1 -6 route add 5f00:0:1:d4::/128 encap seg6local action End.DT4 vrftable 100 dev blue
  ip -n r1 route add 198.51.100.10/32 vrf blue encap seg6 mode encap \
      segs 5f00:0:2:1::,5f00:0:4:d4:: hmac 7 dev r1-r2
  ip -n r1 route add 198.51.100.20/32 vrf blue encap seg6 mode encap \
      segs 5f00:0:2:1::,5f00:0:4:d4:: dev r1-r2
  ip -n r4 route add 192.0.2.0/24 vrf blue encap seg6 mode encap.red segs 5f00:0:1:d4:: dev r4-r3

  cap_start r2:r2-r1 r2:r2-r3 r4:r4-h2
  x h1 ping -c 1 -W 2 198.51.100.10
  sleep 0.5
  x h1 ping -c 1 -W 1 198.51.100.20 || true
  cap_stop srv6-srh-hmac-tlv "SRH with an HMAC TLV (key 7, HMAC-SHA256) accepted by r2; the same flow without HMAC is dropped by r2 (seg6_require_hmac=1)."
}

# 9. SYNTHETIC: SRH with the O-flag (RFC 9259). Linux cannot set it, so this
#    one is crafted with Scapy and named synthetic-*.
s_synthetic_oflag() {
  python3 /lab/synthetic.py "$WORK/oflag.pcapng"
  editcap --discard-capture-comment --capture-comment "srv6.md SRv6 capture library: SYNTHETIC packets crafted with Scapy (tools/pcaps/synthetic.py), not captured from a live network. SRH O-flag (RFC 9259). https://srv6.md/labs/pcaps/" \
    "$WORK/oflag.pcapng" "$OUT/synthetic-srv6-srh-o-flag.pcapng"
  echo "== synthetic-srv6-srh-o-flag: $(capinfos -c -M "$OUT/synthetic-srv6-srh-o-flag.pcapng" | awk '/Number of packets/ {print $NF}') packets"
}

SCENARIOS="h_encaps h_encaps_red end_x end_dt46 end_dx2 usid ping_traceroute hmac synthetic_oflag"

case "${1:-}" in
  all) for s in $SCENARIOS; do "s_$s"; done ;;
  *)
    s=${1:-}; s=${s//-/_}
    if [[ " $SCENARIOS " == *" $s "* ]]; then "s_$s"; else
      echo "usage: $0 <${SCENARIOS// /|}>|all [outdir]" >&2; exit 2
    fi ;;
esac
[ -f /lab/annotations.sh ] && . /lab/annotations.sh
topo_down
rm -rf "$WORK"
