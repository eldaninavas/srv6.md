#!/bin/bash
# Render every script in priority order; log one line per video to youtube/out/render.log.
#   CHROME_PATH=<chromium> youtube/tools/render_all.sh [id ...]
cd "$(dirname "$0")/../.."
PRIORITY="f06 f01 s01 c03 a01 f02 f03 f04 f05 s02 e01 e05 c01 c02 c04 c05 c06 o01 o02 o03 o04 l01 l02 l03 l04 l05 a02 a03 a04 a05 v01 v02 v03 v04 v05 v06 r01 r02 r03 r04 r05 r06 r07 r08 e02 e03 e04 e06"
IDS="${*:-$PRIORITY}"
mkdir -p youtube/out
: > youtube/out/render.log
for id in $IDS; do
  start=$(date +%s)
  if out=$(venv/bin/python youtube/tools/video.py "youtube/scripts/$id.yaml" 2>&1); then
    echo "ok   $id  $(echo "$out" | tail -1 | awk '{print $2}')  $(( $(date +%s) - start ))s" >> youtube/out/render.log
  else
    echo "FAIL $id  $(echo "$out" | tail -3 | tr '\n' ' ' | cut -c1-200)" >> youtube/out/render.log
  fi
done
echo "done" >> youtube/out/render.log
