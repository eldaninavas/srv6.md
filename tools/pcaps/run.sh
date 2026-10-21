#!/bin/sh
# Regenerate the SRv6 capture library in docs/assets/pcaps/.
#
#   tools/pcaps/run.sh [scenario|all]
#
# Builds the lab image, runs lab.sh in a privileged container (the SRv6
# processing happens in the container host's kernel, so it must be a real
# root-capable Linux >= 6.1: rootless Docker/Podman cannot create network
# namespaces) and writes the captures plus SHA256SUMS.
#
# ENGINE selects the container CLI, e.g. on macOS with Podman:
#   ENGINE="podman -c podman-machine-default-root" tools/pcaps/run.sh
set -eu

HERE=$(cd "$(dirname "$0")" && pwd)
DEST=${DEST:-"$HERE/../../docs/assets/pcaps"}
ENGINE=${ENGINE:-docker}
SCENARIO=${1:-all}

$ENGINE build -q -t srv6-pcap-lab -f "$HERE/Containerfile" "$HERE" >/dev/null
mkdir -p "$DEST"

# Stream the scripts in and the captures out, so no bind mount is needed
# (works the same with a remote engine or a VM-backed one).
COPYFILE_DISABLE=1 tar --no-xattrs -C "$HERE" -c lab.sh annotations.sh synthetic.py \
  | $ENGINE run --rm -i --privileged srv6-pcap-lab \
      sh -c 'tar -x -C /lab && /lab/lab.sh "$0" /out >&2 && tar -C /out -c .' "$SCENARIO" \
  | tar -x -C "$DEST"

cd "$DEST" && shasum -a 256 *.pcapng > SHA256SUMS && cat SHA256SUMS
