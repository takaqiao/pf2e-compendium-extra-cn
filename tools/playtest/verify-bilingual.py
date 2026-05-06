#!/usr/bin/env python3
"""Verify the 15 generated bilingual compendium files.

Checks:
  FAIL: invalid JSON / missing label or pack name has wrong shape /
        @UUID/@Damage/@Check/@Compendium/@Template counts in CN block exceed EN
  WARN: name not bilingual / desc has Chinese+English but no <hr/> / Chinese
        char ratio < 10% / folders value not bilingual
  INFO: entry is English-only (still missing translation)

Exit code: 1 if any FAIL, else 0.
"""

import json
import re
import sys
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent.parent
COMPENDIUM_DIR = REPO / "compendium"
REPORT = Path(__file__).resolve().parent / "verify-report.txt"

PACK_PREFIX = "pf2e-playtest-data."

CN_RE = re.compile(r"[一-鿿]")
NAME_BILINGUAL_RE = re.compile(r"^[一-鿿].*\s+[A-Za-z'’\-,\.&\(\)\s]+$")
LABEL_BILINGUAL_RE = re.compile(r"^[^\n]+\n[^\n]+$")
FOLDER_BILINGUAL_RE = LABEL_BILINGUAL_RE

REF_PATTERNS = [
    "@UUID[",
    "@Damage[",
    "@Check[",
    "@Compendium[",
    "@Template[",
    "@Embed[",
    "@Localize[",
    "[[/r ",
]


def split_bilingual(text: str) -> tuple[str, str]:
    """Return (cn_part, en_part).

    The build script's `bilingual_desc` joins blocks with `\\n<hr />\\n` as the
    language separator. PF2e descriptions also embed `<hr />` (without flanking
    newlines) between header and body within a single language block. Prefer
    splitting on the newlined separator; fall back to first <hr /> if not found.
    """
    if not text:
        return ("", "")
    # Prefer the explicit language separator pattern.
    m = re.search(r"\n\s*<hr\s*/?>\s*\n", text)
    if m:
        return text[: m.start()], text[m.end() :]
    parts = re.split(r"<hr\s*/?>", text, maxsplit=1)
    if len(parts) == 2:
        return parts[0], parts[1]
    cn_chars = len(CN_RE.findall(text))
    if cn_chars > 0 and cn_chars * 4 > len(text):
        return (text, "")
    return ("", text)


def count_refs(text: str) -> dict:
    return {p: text.count(p) for p in REF_PATTERNS}


def check_string_field(field_path: str, value: str, allow_unbilingual: bool = False):
    """Return list of (severity, message) for a single string."""
    issues = []
    if not value:
        return issues
    cn_part, en_part = split_bilingual(value)
    has_cn = bool(CN_RE.search(value))
    has_en = bool(re.search(r"[A-Za-z]{4,}", value))  # avoid false positive on inline labels
    if has_cn and has_en and "<hr" not in value:
        # Both languages but no separator: WARN (allowed for short structured fields like names)
        if not allow_unbilingual:
            issues.append(("WARN", f"{field_path}: bilingual content without <hr/>"))
    if has_cn and en_part:
        # Verify reference counts in CN block don't exceed EN block
        cn_refs = count_refs(cn_part)
        en_refs = count_refs(en_part)
        for p, cn_n in cn_refs.items():
            en_n = en_refs.get(p, 0)
            if cn_n > en_n:
                issues.append(
                    (
                        "FAIL",
                        f"{field_path}: ref '{p}' count CN={cn_n} > EN={en_n}",
                    )
                )
            elif p == "@UUID[" and cn_n != en_n:
                issues.append(
                    (
                        "WARN",
                        f"{field_path}: @UUID[ count CN={cn_n} != EN={en_n}",
                    )
                )
    if has_cn:
        # Strip Foundry refs and HTML tags before computing ratio so short
        # entries dominated by @UUID[...] blocks don't trip the warning.
        stripped = value
        for pat in [
            r"@UUID\[[^\]]+\](?:\{[^}]*\})?",
            r"@Damage\[[^\]]+\](?:\{[^}]*\})?",
            r"@Check\[[^\]]+\](?:\{[^}]*\})?",
            r"@Compendium\[[^\]]+\](?:\{[^}]*\})?",
            r"@Template\[[^\]]+\](?:\{[^}]*\})?",
            r"@Embed\[[^\]]+\](?:\{[^}]*\})?",
            r"@Localize\[[^\]]+\]",
            r"\[\[/r [^\]]+\]\](?:\{[^}]*\})?",
            r"\[\[/br [^\]]+\]\](?:\{[^}]*\})?",
            r"<[^>]+>",
        ]:
            stripped = re.sub(pat, " ", stripped)
        stripped = re.sub(r"\s+", " ", stripped).strip()
        if len(stripped) > 80:
            ratio = len(CN_RE.findall(stripped)) / max(1, len(stripped))
            if ratio < 0.10:
                issues.append(
                    ("WARN", f"{field_path}: Chinese char ratio low ({ratio:.2%})")
                )
    return issues


def check_entry_name(field_path: str, name: str):
    issues = []
    if not name:
        return issues
    has_cn = bool(CN_RE.search(name))
    has_en = bool(re.search(r"[A-Za-z]{2,}", name))
    if has_cn and has_en:
        if not NAME_BILINGUAL_RE.match(name):
            issues.append(
                ("WARN", f"{field_path}: bilingual but not '中文 English' form: {name!r}")
            )
    elif not has_cn:
        issues.append(("INFO", f"{field_path}: English-only name: {name!r}"))
    return issues


def walk_item_entries(pack: str, data: dict):
    issues = []
    for key, entry in data.get("entries", {}).items():
        prefix = f"{pack}/entries/{key}"
        issues += check_entry_name(f"{prefix}/name", entry.get("name", ""))
        if "description" in entry:
            issues += check_string_field(
                f"{prefix}/description", entry["description"]
            )
        if "tokenName" in entry:
            issues += check_entry_name(f"{prefix}/tokenName", entry["tokenName"])
        if "prototypeToken" in entry:
            issues += check_entry_name(
                f"{prefix}/prototypeToken", entry["prototypeToken"]
            )
        if "publicNotes" in entry:
            issues += check_string_field(
                f"{prefix}/publicNotes", entry["publicNotes"]
            )
        for item_key, item in entry.get("items", {}).items():
            ipref = f"{prefix}/items/{item_key}"
            issues += check_entry_name(f"{ipref}/name", item.get("name", ""))
            if "description" in item:
                issues += check_string_field(
                    f"{ipref}/description", item["description"]
                )
        for page_key, page in entry.get("pages", {}).items():
            ppref = f"{prefix}/pages/{page_key}"
            issues += check_entry_name(f"{ppref}/name", page.get("name", ""))
            if "text" in page:
                issues += check_string_field(f"{ppref}/text", page["text"])
        for pre in entry.get("prerequisites", []) or []:
            if isinstance(pre, dict) and pre.get("value"):
                issues += check_entry_name(
                    f"{prefix}/prerequisites", pre["value"]
                )
    return issues


def check_pack(path: Path) -> tuple[list, dict]:
    """Return (issues, stats)."""
    issues = []
    pack = path.stem
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
    except json.JSONDecodeError as e:
        return [("FAIL", f"{pack}: invalid JSON: {e}")], {}
    label = data.get("label", "")
    if not label:
        issues.append(("FAIL", f"{pack}: missing label"))
    elif not LABEL_BILINGUAL_RE.match(label):
        issues.append(
            ("WARN", f"{pack}: label not bilingual '中文\\nEnglish': {label!r}")
        )
    folders = data.get("folders", {})
    for k, v in folders.items():
        if not FOLDER_BILINGUAL_RE.match(v) and re.search(r"[A-Za-z]{2,}", v):
            issues.append(
                ("WARN", f"{pack}/folders/{k}: not bilingual '中文\\nEnglish': {v!r}")
            )
    issues += walk_item_entries(pack, data)
    stats = {
        "entries": len(data.get("entries", {})),
        "label_ok": bool(label and LABEL_BILINGUAL_RE.match(label)),
    }
    return issues, stats


def main():
    files = sorted(COMPENDIUM_DIR.glob(f"{PACK_PREFIX}*.json"))
    if not files:
        print(f"No files matching {COMPENDIUM_DIR}/{PACK_PREFIX}*.json", file=sys.stderr)
        sys.exit(1)
    all_issues = []
    pack_stats = {}
    for f in files:
        issues, stats = check_pack(f)
        pack_stats[f.stem] = stats
        all_issues.extend((f.stem, sev, msg) for sev, msg in issues)
    severity_order = {"FAIL": 0, "WARN": 1, "INFO": 2}
    all_issues.sort(key=lambda x: (severity_order.get(x[1], 3), x[0]))
    counts = {"FAIL": 0, "WARN": 0, "INFO": 0}
    for _, sev, _ in all_issues:
        counts[sev] = counts.get(sev, 0) + 1
    lines = []
    lines.append("=" * 50)
    lines.append("Bilingual Verifier Report")
    lines.append("=" * 50)
    lines.append("")
    lines.append("Pack stats:")
    for pack, stats in pack_stats.items():
        lines.append(
            f"  {pack}: entries={stats.get('entries', '?')} "
            f"label_ok={stats.get('label_ok', False)}"
        )
    lines.append("")
    lines.append(f"Issues: FAIL={counts['FAIL']}, WARN={counts['WARN']}, INFO={counts['INFO']}")
    lines.append("")
    cur_sev = None
    for pack, sev, msg in all_issues:
        if sev != cur_sev:
            cur_sev = sev
            lines.append(f"--- {sev} ---")
        lines.append(f"  [{pack}] {msg}")
    REPORT.write_text("\n".join(lines), encoding="utf-8")
    print(f"Wrote {REPORT}")
    print()
    print("\n".join(lines[:8 + len(pack_stats)]))
    print()
    print(f"Issues: FAIL={counts['FAIL']}, WARN={counts['WARN']}, INFO={counts['INFO']}")
    if counts["FAIL"] > 0:
        sys.exit(1)


if __name__ == "__main__":
    main()
