#!/bin/sh
# Print the English CV (cv/cv-en.html) to assets/yujiro-hikawa-cv.pdf with headless Chrome.
# Fonts are local files in cv/fonts, so no network is needed.
# Usage: cv/build.sh   (set CHROME=/path/to/chrome if it isn't in the default place)
set -e
cd "$(dirname "$0")/.."
CHROME="${CHROME:-/Applications/Google Chrome.app/Contents/MacOS/Google Chrome}"
OUT=assets/yujiro-hikawa-cv.pdf
LOG=$(mktemp)
rm -f "$OUT"
if ! "$CHROME" --headless=new --disable-gpu --no-pdf-header-footer --virtual-time-budget=3000 \
     --print-to-pdf="$OUT" "file://$PWD/cv/cv-en.html" 2>"$LOG" || [ ! -s "$OUT" ]; then
  cat "$LOG" >&2
  echo "cv/build.sh: failed to write $OUT" >&2
  rm -f "$LOG"
  exit 1
fi
rm -f "$LOG"
echo "wrote $OUT"
