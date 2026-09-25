#!/usr/bin/env python3
"""Build the Japanese font subsets used by the showreel's Japanese version.

Zen Kaku Gothic New (SIL OFL 1.1, no Reserved Font Name) is ~2.3 MB per weight,
so we ship only what the reel needs: every non-ASCII character in index.html,
plus all hiragana/katakana, CJK punctuation and full-width forms (so any kana
name renders). Re-run after changing the Japanese copy, or when a name with
new kanji is passed as a variable:

    python3 fonts/subset-ja.py        # needs: pip install fonttools brotli
"""
import pathlib
import tempfile
import urllib.request

from fontTools import subset

HERE = pathlib.Path(__file__).resolve().parent
SRC = "https://raw.githubusercontent.com/google/fonts/main/ofl/zenkakugothicnew/ZenKakuGothicNew-{}.ttf"
WEIGHTS = ["Light", "Medium", "Bold", "Black"]

text = (HERE.parent / "index.html").read_text(encoding="utf-8")
chars = {c for c in text if ord(c) > 0x7E}
for lo, hi in [(0x20, 0x7E), (0x3000, 0x303F), (0x3040, 0x30FF), (0xFF01, 0xFF5E)]:
    chars.update(chr(cp) for cp in range(lo, hi + 1))
unicodes = sorted(ord(c) for c in chars)

cache = pathlib.Path(tempfile.gettempdir()) / "zen-kaku-gothic-new"
cache.mkdir(exist_ok=True)
for w in WEIGHTS:
    ttf = cache / f"ZenKakuGothicNew-{w}.ttf"
    if not ttf.exists():
        urllib.request.urlretrieve(SRC.format(w), ttf)
    out = HERE / f"ZenKakuGothicNew-{w}-subset.woff2"
    opts = subset.Options()
    opts.flavor = "woff2"
    opts.layout_features = ["*"]
    font = subset.load_font(str(ttf), opts)
    sub = subset.Subsetter(opts)
    sub.populate(unicodes=unicodes)
    sub.subset(font)
    subset.save_font(font, str(out), opts)
    print(f"{out.name}: {out.stat().st_size / 1024:.0f} KB")
