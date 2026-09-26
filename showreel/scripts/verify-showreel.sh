#!/usr/bin/env bash
# Machine checks for the showreel deliverable. Run after every render:
#   showreel/scripts/verify-showreel.sh
# Exits non-zero with a FAIL line if the video or composition is off-spec.
set -euo pipefail
cd "$(dirname "$0")/.."

fail() { echo "FAIL: $*" >&2; exit 1; }

check_video() {
  f=$1
  [ -f "$f" ] || fail "$f not found (run npm run render)"

  # 1. Video: 1920x1080, 30 fps, 450 frames, 15.00 s, with an AAC soundtrack
  v=$(ffprobe -v error -select_streams v:0 -show_entries stream=width,height,r_frame_rate,nb_frames -of csv=p=0 "$f")
  [ "$v" = "1920,1080,30/1,450" ] || fail "video stream is '$v', expected 1920,1080,30/1,450"
  d=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$f")
  awk -v d="$d" 'BEGIN { exit !(d >= 14.99 && d <= 15.01) }' || fail "duration is ${d}s, expected 15.00s"
  a=$(ffprobe -v error -select_streams a:0 -show_entries stream=codec_name -of csv=p=0 "$f")
  [ "$a" = "aac" ] || fail "audio stream is '$a', expected aac"
  echo "ok  video: 1920x1080, 30 fps, 450 frames, ${d}s, AAC audio"

  # 2. Audio hits sit on the 120 BPM grid the picture is built on (bounces at 0.5/1/1.5 s and every
  #    2 s cut), within 20 ms. This checks audio against the clock, not against the picture:
  #    HyperFrames muxes both from one timeline, so they cannot drift apart on their own.
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
}

for f in showreel.mp4 showreel-ja.mp4; do
  echo "== $f"
  check_video "$f"
done

# The Japanese file must really be the Japanese render: at 11.3 s the left column
# ("Made to ship." vs 「作って、届ける。」) differs, so the crops must not match.
ssim=$(ffmpeg -hide_banner -loglevel info -ss 11.3 -i showreel.mp4 -ss 11.3 -i showreel-ja.mp4 \
  -filter_complex "[0:v]crop=640:760:120:160,trim=end_frame=1[a];[1:v]crop=640:760:120:160,trim=end_frame=1[b];[a][b]ssim" \
  -frames:v 1 -f null - 2>&1 | sed -n 's/.*All:\([0-9.]*\).*/\1/p' | tail -1)
[ -n "$ssim" ] || fail "could not compare the English and Japanese videos"
awk -v s="$ssim" 'BEGIN { exit !(s < 0.95) }' || fail "showreel-ja.mp4 looks like the English video (SSIM $ssim at 11.3 s)"
echo "ok  showreel-ja.mp4 differs from English where the copy does (SSIM $ssim)"

# 3. HyperFrames gates: lint, runtime, layout, motion, WCAG contrast, for English and Japanese.
#    check exits 1 when it finds problems, so read its JSON verdict rather than the exit code.
#    check has no --variables, so the Japanese pass runs on a temp copy whose default language is ja.
hf_check() {
  out=$(npx --yes hyperframes@0.8.77 check "$1" --json --samples 9 2>/dev/null) || true
  echo "$out" | python3 -c '
import json, sys
try:
    r = json.load(sys.stdin)
except ValueError:
    sys.exit("FAIL: hyperframes check did not run (no JSON output)")
if not r.get("ok"):
    sys.exit("FAIL: hyperframes check reported errors for " + sys.argv[1] + " (run npm run check for details)")
print("ok  hyperframes check (" + sys.argv[1] + "): no errors")
' "$2"
}
hf_check . English
ja=$(mktemp -d)
trap 'rm -rf "$ja"' EXIT
cp -R index.html hyperframes.json fonts audio "$ja"/
python3 - "$ja/index.html" <<'PY'
import sys
p = sys.argv[1]
s = open(p, encoding="utf-8").read()
key = '"default":"en","options"'
if key not in s:
    sys.exit("FAIL: language variable not found in index.html")
open(p, "w", encoding="utf-8").write(s.replace(key, '"default":"ja","options"', 1))
PY
hf_check "$ja" Japanese
echo "PASS"
