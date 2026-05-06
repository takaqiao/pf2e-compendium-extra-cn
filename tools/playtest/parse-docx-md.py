#!/usr/bin/env python3
"""Parse the 4 mammoth-converted markdown files in tools/playtest/source-md/
into a structured Chinese-source JSON keyed by English entry name.

Output:
  tools/playtest/playtest-cn-source.json   - main map
  tools/playtest/coverage.txt              - per-pack covered/missing summary
"""

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent
SOURCE_MD = ROOT / "source-md"
OUTPUT_JSON = ROOT / "playtest-cn-source.json"
COVERAGE_TXT = ROOT / "coverage.txt"
EXTRACTED_DIR = Path("/tmp/playtest-output")

CLASS_FILES = {
    "necromancer": "necromancer.md",
    "runesmith": "runesmith.md",
    "daredevil": "daredevil.md",
    "slayer": "slayer.md",
}

# Mammoth GFM escapes punctuation: \. \[ \] \( \) \- \+ \* \_ \, \' \! \?
GFM_ESC = re.compile(r"\\([\.\[\]\(\)\-\+\*_,'’&\!\?:;|<>~`#@\$%^])")


def unescape(text: str) -> str:
    return GFM_ESC.sub(r"\1", text)


HEADING_LINE = re.compile(r"^(?:\*引用\*)?__(?P<inner>.+?)__\s*$")
TRAIL_KIND = re.compile(r"\s*(专长|戏法|符文|动作|聚能)\s*(\d+)\s*$")
TRAIL_LEVEL_CN = re.compile(r"\s+(\d+)级\s*$")
# Match one or more glyph forms; e.g. [A], [A]或[AA], [F].
ACTION_GLYPH = re.compile(r"(?:\s*\\?\[(?:A{1,3}|F|R|T)\\?\])+(?:或(?:\s*\\?\[(?:A{1,3}|F|R|T)\\?\])+)*\s*$")
# Translator's parenthetical note like （译者注：...）
TRANSLATOR_NOTE = re.compile(r"（译者注[：:][^）]*）")

# CJK Unified ideographs + common Chinese punctuation
CN_CHARS = "一-鿿·，、：（）【】「」　…\\-‐-—"
CN_HALF_RE = re.compile(f"^([{CN_CHARS} ]+)$")

# In a heading inner, find the "中文 ENGLISH" boundary: last contiguous
# Chinese run followed by whitespace then a Latin run.
BILINGUAL_RE = re.compile(
    rf"^\s*(?P<cn>[{CN_CHARS} ]+?)\s+(?P<en>[A-Za-z][A-Za-z’'\-,\.&\(\)\s]*[A-Za-z’)’])\s*$"
)


META_PREFIXES = (
    "频率", "需求", "触发", "先决条件", "大成功", "成功", "失败", "大失败",
    "射程", "区域", "目标", "持续时间", "防御", "抗力", "生效条件",
    "用法", "效果", "等级", "升阶", "状态", "传统", "施法", "每日法术位",
    "附加", "施法时间", "要求", "描述", "价格", "散播", "物品",
)


def is_meta_heading(inner: str) -> bool:
    """Return True if the heading is just a metadata label (频率/需求/etc)."""
    inner_clean = unescape(inner).strip()
    for p in META_PREFIXES:
        if inner_clean == p or inner_clean.startswith(p + " "):
            return True
    return False


def parse_heading(inner: str) -> dict:
    """Parse the content between `__ ... __`."""
    # First strip translator's notes anywhere in the string
    inner = TRANSLATOR_NOTE.sub("", inner)
    s = inner.strip()
    raw = s
    glyph = None
    m = ACTION_GLYPH.search(s)
    if m:
        glyph = m.group(0).strip()
        s = s[: m.start()].rstrip()
    kind = level = None
    m = TRAIL_KIND.search(s)
    if m:
        kind = m.group(1)
        level = int(m.group(2))
        s = s[: m.start()].rstrip()
    else:
        m = TRAIL_LEVEL_CN.search(s)
        if m:
            level = int(m.group(1))
            s = s[: m.start()].rstrip()
    m = ACTION_GLYPH.search(s)
    if m and glyph is None:
        glyph = m.group(0).strip()
        s = s[: m.start()].rstrip()
    s_clean = unescape(s).strip()
    cn = en = ""
    bm = BILINGUAL_RE.match(s_clean)
    if bm:
        cn = bm.group("cn").strip()
        en = bm.group("en").strip()
    elif CN_HALF_RE.match(s_clean):
        cn = s_clean
    elif re.match(r"^[A-Za-z][A-Za-z’'\-,\.&\(\)\s]*$", s_clean):
        en = s_clean
    return {
        "raw": raw,
        "cn": cn,
        "en": en,
        "glyph": glyph,
        "kind": kind,
        "level": level,
    }


def normalize_en_key(en: str) -> str:
    """Lowercase + collapse whitespace + strip apostrophe variants for matching."""
    s = en.lower().strip()
    s = s.replace("’", "'")
    s = re.sub(r"\s+", " ", s)
    return s


def parse_class_file(path: Path) -> list:
    text = path.read_text(encoding="utf-8")
    lines = text.split("\n")
    blocks = []
    cur_heading = None
    cur_body: list[str] = []

    def flush():
        nonlocal cur_heading, cur_body
        if cur_heading is not None:
            blocks.append(
                {"heading": cur_heading, "body_md": "\n".join(cur_body).strip("\n")}
            )
        cur_heading = None
        cur_body = []

    for raw in lines:
        m = HEADING_LINE.match(raw.strip())
        if m:
            inner = m.group("inner")
            if is_meta_heading(inner):
                cur_body.append(raw)
                continue
            meta = parse_heading(inner)
            if not meta["cn"] and not meta["en"]:
                cur_body.append(raw)
                continue
            # CN-only headings are NOT real entry boundaries — they are inline
            # PF2e markup like trait lines (`__狂徒 风险__`), level dividers
            # (`__1级__`), or column headers (`__你的等级__`). Treat as body
            # content so the body of the previous heading isn't truncated.
            if not meta["en"]:
                cur_body.append(raw)
                continue
            flush()
            cur_heading = meta
        else:
            cur_body.append(raw)
    flush()
    return blocks


def md_inline(s: str) -> str:
    s = re.sub(r"__(.+?)__", r"<strong>\1</strong>", s)
    s = re.sub(r"\*\*(.+?)\*\*", r"<strong>\1</strong>", s)
    s = re.sub(r"(?<!\w)\*(.+?)\*(?!\w)", r"<em>\1</em>", s)
    return s


def md_to_html(body_md: str) -> str:
    if not body_md.strip():
        return ""
    body_md = re.sub(r"\*引用\*", "", body_md)
    body_md = unescape(body_md)
    body_md = re.sub(r"  \n(?!\n)", " ", body_md)
    body_md = re.sub(r"\n{3,}", "\n\n", body_md)
    chunks = re.split(r"\n\s*\n", body_md)
    out: list[str] = []
    for chunk in chunks:
        chunk = chunk.strip()
        if not chunk:
            continue
        bullets = []
        is_bullet = True
        for ln in chunk.split("\n"):
            ln_strip = ln.strip()
            if ln_strip.startswith(("- ", "• ")):
                bullets.append(ln_strip[2:].strip())
            else:
                is_bullet = False
                break
        if is_bullet and bullets:
            items = "".join(f"<li>{md_inline(b)}</li>" for b in bullets)
            out.append(f"<ul>{items}</ul>")
            continue
        joined = re.sub(r"\s*\n\s*", " ", chunk)
        out.append(f"<p>{md_inline(joined)}</p>")
    return "".join(out)


def collect() -> dict:
    out = {
        "by_class": {},
        "all_headings": {},
        "terminology": {},
        "raw_blocks_summary": {},
    }
    for cls, fn in CLASS_FILES.items():
        path = SOURCE_MD / fn
        blocks = parse_class_file(path)
        out["raw_blocks_summary"][cls] = [
            {
                "raw": b["heading"]["raw"],
                "cn": b["heading"]["cn"],
                "en": b["heading"]["en"],
                "level": b["heading"]["level"],
                "kind": b["heading"]["kind"],
                "glyph": b["heading"]["glyph"],
                "body_len": len(b["body_md"]),
            }
            for b in blocks
        ]
        cls_entries: dict = {}
        for b in blocks:
            h = b["heading"]
            if not h["en"]:
                continue
            en_key = normalize_en_key(h["en"])
            desc_html = md_to_html(b["body_md"])
            entry = {
                "name_cn": h["cn"],
                "name_en": h["en"],
                "level": h["level"],
                "kind": h["kind"],
                "glyph": h["glyph"],
                "desc_html_cn": desc_html,
            }
            existing = cls_entries.get(en_key)
            if existing is None or len(desc_html) > len(existing["desc_html_cn"]):
                cls_entries[en_key] = entry
            out["all_headings"].setdefault(en_key, []).append(
                {"cls": cls, "cn": h["cn"], "level": h["level"], "kind": h["kind"]}
            )
            if h["cn"] and en_key not in out["terminology"]:
                out["terminology"][en_key] = h["cn"]
        out["by_class"][cls] = cls_entries
    return out


def load_extracted_entries() -> dict:
    pack_entries: dict = {}
    for f in sorted(EXTRACTED_DIR.glob("pf2e-playtest-data.*.json")):
        pack = f.stem.split(".", 1)[1]
        with f.open(encoding="utf-8") as fh:
            data = json.load(fh)
        entries = data.get("entries", {})
        pack_entries[pack] = {normalize_en_key(k): k for k in entries.keys()}
    return pack_entries


def build_coverage(source: dict, pack_entries: dict) -> str:
    lines = []
    source["coverage_per_pack"] = {}
    all_en_to_cls: dict = {}
    for cls in source["by_class"]:
        for k in source["by_class"][cls]:
            all_en_to_cls.setdefault(k, []).append(cls)
    total = covered_total = 0
    for pack in sorted(pack_entries):
        en_keys = pack_entries[pack]
        cov, mis = [], []
        for ek, orig in sorted(en_keys.items()):
            (cov if ek in all_en_to_cls else mis).append(orig)
        source["coverage_per_pack"][pack] = {"covered": cov, "missing": mis}
        total += len(en_keys)
        covered_total += len(cov)
        lines.append(
            f"{pack}: {len(cov)}/{len(en_keys)} covered ({len(mis)} missing)"
        )
    lines.append("")
    lines.append(
        f"TOTAL: {covered_total}/{total} covered ({total - covered_total} missing)"
    )
    lines.append("")
    for pack in sorted(pack_entries):
        miss = source["coverage_per_pack"][pack]["missing"]
        if miss:
            lines.append(f"--- MISSING in {pack} ---")
            for m in miss:
                lines.append(f"    {m}")
            lines.append("")
    return "\n".join(lines)


def main():
    src = collect()
    pe = load_extracted_entries()
    cov = build_coverage(src, pe)
    OUTPUT_JSON.write_text(json.dumps(src, ensure_ascii=False, indent=2), encoding="utf-8")
    COVERAGE_TXT.write_text(cov, encoding="utf-8")
    print(f"wrote {OUTPUT_JSON}")
    print(f"wrote {COVERAGE_TXT}")
    print()
    summary_lines = [l for l in cov.split("\n") if l.startswith(("pf2e-playtest-data", "TOTAL", "impossible", "rr-"))][:20]
    print("\n".join(summary_lines))


if __name__ == "__main__":
    main()
