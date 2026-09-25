#!/usr/bin/env bash
# Machine checks for the showreel deliverable. Run after every render:
#   showreel/scripts/verify.sh
# Exits non-zero with a FAIL line if the video or composition is off-spec.
set -euo pipefail
cd "$(dirname "$0")/.."

fail() { echo "FAIL: $*" >&2; exit 1; }
f=showreel.mp4
[ -f "$f" ] || fail "$f not found (run npm run render)"

# 1. Video: 1920x1080, 30 fps, 450 frames, 15.00 s, with an AAC soundtrack
v=$(ffprobe -v error -select_streams v:0 -show_entries stream=width,height,r_frame_rate,nb_frames -of csv=p=0 "$f")
[ "$v" = "1920,1080,30/1,450" ] || fail "video stream is '$v', expected 1920,1080,30/1,450"
d=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$f")
awk -v d="$d" 'BEGIN { exit !(d >= 14.99 && d <= 15.01) }' || fail "duration is ${d}s, expected 15.00s"
a=$(ffprobe -v error -select_streams a:0 -show_entries stream=codec_name -of csv=p=0 "$f")
[ "$a" = "aac" ] || fail "audio stream is '$a', expected aac"
echo "ok  video: 1920x1080, 30 fps, 450 frames, ${d}s, AAC audio"

# 2. Audio hits land on the visual beats (bounces + every scene cut), within 20 ms
ffmpeg -loglevel error -i "$f" -vn -ac 1 -ar 8000 -f s16le - | python3 -c '
import struct, sys
data = sys.stdin.buffer.read()
x = struct.unpack("<%dh" % (len(data) // 2), data)
w = 80  # 10 ms windows at 8 kHz
env = [max(abs(s) for s in x[i:i + w]) for i in range(0, len(x) - w, w)]
bad = []
for target in (0.5, 1.0, 1.5, 2.0, 4.0, 6.0, 8.0, 10.0, 12.0):
    lo, hi = int(target * 100) - 10, int(target * 100) + 10
    onset = max(range(lo + 1, hi), key=lambda i: env[i] - env[i - 1]) / 100
    if abs(onset - target) > 0.02:
        bad.append("%.2fs hit found at %.2fs" % (target, onset))
if bad:
    sys.exit("FAIL: audio off the beat grid: " + "; ".join(bad))
print("ok  audio: hits at 0.5/1/1.5 s and every cut (2-12 s) within 20 ms")
'

# 3. HyperFrames gates: lint, runtime, layout, motion, WCAG contrast
out=$(npx --yes hyperframes@0.8.77 check --json --samples 9 2>/dev/null) || fail "hyperframes check did not run"
echo "$out" | python3 -c '
import json, sys
r = json.load(sys.stdin)
if not r.get("ok"):
    sys.exit("FAIL: hyperframes check reported errors (run npm run check for details)")
print("ok  hyperframes check: no errors")
'
echo "PASS"
