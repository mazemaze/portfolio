#!/bin/sh
# Print the English CV (cv/cv-en.html) to assets/cv-en.pdf with headless Chrome.
# Usage: cv/build.sh   (set CHROME=/path/to/chrome if it isn't in the default place)
set -e
cd "$(dirname "$0")/.."
CHROME="${CHROME:-/Applications/Google Chrome.app/Contents/MacOS/Google Chrome}"
"$CHROME" --headless=new --disable-gpu --no-pdf-header-footer --virtual-time-budget=8000 \
  --print-to-pdf=assets/cv-en.pdf "file://$PWD/cv/cv-en.html" 2>/dev/null
echo "wrote assets/cv-en.pdf"
