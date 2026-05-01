"""
Regenerate compendium/labels.json and compendium/titles.json from every
compendium/<package>.<pack>.json under compendium/.

Run from repo root:
    python scripts/regen-labels-titles.py

The on-demand patch reads labels.json (pack-level labels for the sidebar)
and titles.json (per-pack title maps for the compendium browser list view)
at babele.init time. Pack-file `entries` only translate when the pack is
opened — without these two index files, sidebar names and list titles stay
English. Re-run this whenever you add or rename a pack file.
"""

from __future__ import annotations

import json
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
COMPENDIUM_DIR = REPO_ROOT / "compendium"
LABELS_PATH = COMPENDIUM_DIR / "labels.json"
TITLES_PATH = COMPENDIUM_DIR / "titles.json"
SKIP_NAMES = {"labels.json", "titles.json"}


def extract_pack_titles(entries) -> dict[str, str]:
    out: dict[str, str] = {}
    if isinstance(entries, dict):
        for orig, entry in entries.items():
            if isinstance(entry, dict):
                name = entry.get("name")
                if isinstance(name, str) and name.strip():
                    out[orig] = name
    elif isinstance(entries, list):
        for entry in entries:
            if not isinstance(entry, dict):
                continue
            orig = entry.get("id") or entry.get("originalName") or entry.get("name")
            name = entry.get("name")
            if isinstance(orig, str) and isinstance(name, str) and name.strip():
                out[orig] = name
    return out


def main() -> int:
    if not COMPENDIUM_DIR.is_dir():
        print(f"error: {COMPENDIUM_DIR} not found", file=sys.stderr)
        return 1

    pack_paths = sorted(p for p in COMPENDIUM_DIR.glob("*.json") if p.name not in SKIP_NAMES)
    print(f"scanning {len(pack_paths)} pack files in {COMPENDIUM_DIR.relative_to(REPO_ROOT)}")

    labels: dict[str, str] = {}
    titles: dict[str, dict] = {}
    skipped: list[tuple[str, str]] = []

    for path in pack_paths:
        pack_id = path.stem
        try:
            data = json.loads(path.read_text(encoding="utf-8"))
        except Exception as e:
            skipped.append((path.name, str(e)))
            continue
        if not isinstance(data, dict):
            continue

        label = data.get("label")
        if isinstance(label, str) and label.strip():
            labels[pack_id] = label

        pack_titles = extract_pack_titles(data.get("entries"))
        folders = data.get("folders") if isinstance(data.get("folders"), dict) else {}
        if pack_titles or folders:
            titles[pack_id] = {"titles": pack_titles, "folders": folders}

    LABELS_PATH.write_text(
        json.dumps(labels, ensure_ascii=False, indent=2, sort_keys=True),
        encoding="utf-8",
    )
    TITLES_PATH.write_text(
        json.dumps(titles, ensure_ascii=False, indent=2, sort_keys=True),
        encoding="utf-8",
    )

    title_count = sum(len(v.get("titles", {})) for v in titles.values())
    print(f"  labels.json: {len(labels)} pack labels")
    print(f"  titles.json: {len(titles)} packs / {title_count} titles")
    if skipped:
        print(f"  skipped {len(skipped)} unparseable file(s):")
        for name, err in skipped:
            print(f"    {name}: {err}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
