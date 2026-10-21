# SRv6 packet capture lab

Generates the capture library published at <https://srv6.md/labs/pcaps/>
(files in [`docs/assets/pcaps/`](../../docs/assets/pcaps/)).

| File | Purpose |
|------|---------|
| `Containerfile` | Debian trixie with iproute2, dumpcap/tshark/mergecap/editcap, Scapy, traceroute |
| `lab.sh` | Builds the topology in network namespaces, runs each scenario, captures and merges |
| `annotations.sh` | Per-frame comments written into the pcapng files (`frame.comment` in Wireshark) |
| `synthetic.py` | Scapy script for the one synthetic capture (SRH O-flag), which Linux cannot produce |
| `run.sh` | Host-side wrapper: builds the image, runs `lab.sh` in a privileged container, writes `SHA256SUMS` |

## Run it

```bash
tools/pcaps/run.sh              # every scenario
tools/pcaps/run.sh end-x        # one scenario
ENGINE="podman -c podman-machine-default-root" tools/pcaps/run.sh   # macOS + Podman
DEST=/tmp/pcaps tools/pcaps/run.sh                                  # write elsewhere
```

Scenarios: `h-encaps`, `h-encaps-red`, `end-x`, `end-dt46`, `end-dx2`, `usid`,
`ping-traceroute`, `hmac`, `synthetic-oflag`.

Requirements:

- A **root-capable** container engine on a Linux kernel **6.1 or later** (NEXT-C-SID
  needs 6.1; everything else works on older kernels). The SRv6 processing is done by
  the container host's kernel, so on macOS that is the Docker/Podman VM kernel.
  Rootless Docker or Podman cannot create network namespaces (`ip netns add` fails
  with "mount of /sys failed"), so use a rootful connection.
- The kernel needs `CONFIG_IPV6_SEG6_LWTUNNEL`, `CONFIG_IPV6_SEG6_HMAC` and `CONFIG_NET_VRF`
  (stock Fedora, Debian and Ubuntu kernels have all three).

`lab.sh` also runs directly on a Linux host as root if iproute2 ≥ 6.1, Wireshark's
command-line tools, Scapy and traceroute are installed: `sudo ./lab.sh all ./out`.

## Topology

```
h1 --- r1 --- r2 ===== r3 --- r4 --- h2
                 A, B
```

- r1, r4: PEs with VRF `blue` (table 100). r2, r3: P routers with two parallel links.
- Locators `5f00:0:N::/48`; loopbacks `2001:db8:ffff::N` (also the H.Encaps source).
- Static routes play the IGP. Nothing leaves the namespaces.
- MACs are fixed (`02:00:00:<node>:<peer>:<link>`) so the files differ between runs only
  in timestamps.

## What the scripts do to keep files small and clean

- Capture only the interfaces that matter for each scenario, with `dumpcap` (pcapng, one
  interface description per capture point), then `mergecap` them in time order.
- Drop ARP, ICMPv6 neighbor discovery/MLD and multicast with a tshark display filter.
- Replace the capture comment (mergecap's lists temporary file paths) with a description
  of the scenario, kernel and iproute2 versions.
- `annotate` only writes frame comments when the frame count matches the expected one,
  so a changed kernel behavior shows up as an unannotated file instead of wrong comments.

## Adding a scenario

1. Write `s_<name>()` in `lab.sh`: call `topo_up`, add SIDs and headend routes,
   `cap_start <ns>:<if> ...`, generate traffic, `cap_stop <file-name> "<description>"`.
2. Add `<name>` to `SCENARIOS`.
3. Run it, inspect with `tshark -r <file> -T fields -e frame.interface_name -e ipv6.dst -e ipv6.routing.segleft`,
   then add an `annotate` line to `annotations.sh`.
4. Add a section to `docs/labs/pcaps.md`. The `{{ pcap:<file> }}` token renders the download
   link, size and SHA-256 at build time (`hooks/pcap_meta.py`).

Synthetic captures must be named `synthetic-*.pcapng` and say so in their capture and
frame comments.
