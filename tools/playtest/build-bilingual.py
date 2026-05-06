#!/usr/bin/env python3
"""Merge English baseline + Chinese source -> bilingual Babele JSON files.

Inputs:
  /tmp/playtest-output/pf2e-playtest-data.*.json    English baseline (15 files)
  tools/playtest/playtest-cn-source.json            from parse-docx-md.py
  tools/playtest/overrides.json                     hand-curated additions
  tools/playtest/agent-out/*.json                   (optional, when --merge-agent-out)

Output:
  /root/pf2e-compendium-extra-cn/compendium/pf2e-playtest-data.<pack>.json   x15
  tools/playtest/missing-after-docx.json            work queue for Phase 2 agents
  tools/playtest/build-report.txt                   summary
"""

import argparse
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent
REPO = ROOT.parent.parent  # /root/pf2e-compendium-extra-cn
SOURCE_JSON = ROOT / "playtest-cn-source.json"
OVERRIDES_JSON = ROOT / "overrides.json"
SPELL_FIELDS_JSON = ROOT / "spell-fields.json"
AGENT_OUT = ROOT / "agent-out"
EXTRACTED_DIR = Path("/tmp/playtest-output")
COMPENDIUM_DIR = REPO / "compendium"
MISSING_JSON = ROOT / "missing-after-docx.json"
REPORT_TXT = ROOT / "build-report.txt"

# Pack short labels: hardcoded human-friendly Chinese + canonical English
PACK_LABELS = {
    "impossible-playtest-actions": "动作\nActions",
    "impossible-playtest-classes": "职业\nClasses",
    "impossible-playtest-class-features": "职业特性\nClass Features",
    "impossible-playtest-class-feats": "职业专长\nFeats",
    "impossible-playtest-effects": "效果\nEffects",
    "impossible-playtest-spells": "法术\nSpells",
    "impossible-playtest-runes": "符文\nRunes",
    "impossible-playtest-journals": "日志\nJournals",
    "impossible-playtest-thralls": "残骸\nThralls",
    "rr-playtest-actions": "动作\nActions",
    "rr-playtest-classes": "职业\nClasses",
    "rr-playtest-class-features": "职业特性\nClass Features",
    "rr-playtest-class-feats": "职业专长\nFeats",
    "rr-playtest-effects": "效果\nEffects",
    "rr-playtest-journals": "日志\nJournals",
}

# Folder names from extracted JSONs map to bilingual.
FOLDER_TRANSLATIONS = {
    "Necromancer": "死灵师\nNecromancer",
    "Runesmith": "符文工匠\nRunesmith",
    "Daredevil": "狂徒\nDaredevil",
    "Slayer": "猎杀者\nSlayer",
    "Shared": "共享\nShared",
    "Necromancer Features": "死灵师特性\nNecromancer Features",
    "Runesmith Features": "符文工匠特性\nRunesmith Features",
    "Grim Fascinations": "阴森痴迷\nGrim Fascinations",
    "Level 1": "1级\nLevel 1",
    "Level 2": "2级\nLevel 2",
    "Level 4": "4级\nLevel 4",
    "Level 6": "6级\nLevel 6",
    "Level 8": "8级\nLevel 8",
    "Level 10": "10级\nLevel 10",
    "Level 12": "12级\nLevel 12",
    "Level 14": "14级\nLevel 14",
    "Level 16": "16级\nLevel 16",
    "Level 18": "18级\nLevel 18",
    "Level 20": "20级\nLevel 20",
}

# Repeated short strings (rule-element item names inside Actor sheets,
# common prerequisite texts).  These don't appear as docx headings so we
# hard-code them here.
SHORT_NAME_TRANSLATIONS = {
    "Thrall - Automatically Hit": "残骸 - 自动命中",
    "Thrall - Fails all Saving Throws": "残骸 - 所有豁免自动失败",
    "Strike": "打击",
    "Skeletal Lance": "骨枪",
    "Share Space": "共享空间",
}

# Map prerequisite English text (lowercased) -> bilingual short text.
# These are inline value strings in the prerequisites array.
PREREQ_TRANSLATIONS = {
    "bone shaper grim fascination": "塑骨灵匠阴森痴迷",
    "flesh magician grim fascination": "血肉魔巫阴森痴迷",
    "spirit monger grim fascination": "魂灵商贩阴森痴迷",
    "you know one or more diacritic runes": "你已习得一个或多个修饰符文",
    "consecrated panoply signature tool": "祝圣武备标志性工具",
    "bloodseeking blade signature tool": "觅血之刃标志性工具",
    "warded mail signature tool": "符护链甲标志性工具",
    "chymist's vials signature tool": "炼金师药瓶标志性工具",
    "chymist’s vials signature tool": "炼金师药瓶标志性工具",
    "bloodseeking blade or warded mail signature tool": "觅血之刃或符护链甲标志性工具",
    "trained in driving lore, piloting lore, or sailing lore": "驱车学识、航空学识或航海学识受训",
    "trained in intimidation": "威吓受训",
    "trained in acrobatics": "特技受训",
    "expert in acrobatics": "特技专家",
    "master in athletics": "运动大师",
}


def normalize_en_key(en: str) -> str:
    s = en.lower().strip()
    s = s.replace("’", "'")  # right-single-quote
    s = re.sub(r"\s+", " ", s)
    return s


# Leading trait line residue from docx (`__狂徒 风险__` -> `<strong>狂徒 风险</strong>`).
# These appear inside `<p>` paragraphs at the start of feat/action descriptions
# but PF2e renders traits separately above the description, so inline duplication
# is undesirable. Strip when the strong content is only Chinese trait keywords
# (no labels like `频率`/`需求` which take other characters or are followed by
# non-trait text). The whitelist captures known PF2e traits seen in playtest content.
TRAIT_WORDS = {
    # Class traits
    "死灵师", "符文工匠", "狂徒", "猎杀者",
    # Playtest-specific
    "残骸", "墓穴", "符文", "修饰", "激发",
    "风险", "绝技", "连携", "险招", "追猎", "强化", "塑法",
    # Action timing
    "自由动作", "反应", "单动作", "双动作", "三动作",
    # Magic traditions
    "异能", "神术", "奥术", "原能", "超自然",
    # Common traits
    "罕见", "非常见", "唯一", "攻击", "专注", "操作",
    "隐密", "视觉", "听觉", "触觉", "心灵", "情绪", "恐惧",
    "神圣", "邪秽", "幻术", "塑形", "传送", "塑法",
    # Damage / energy
    "火", "寒冷", "电击", "雷鸣", "钝击", "穿刺", "挥砍",
    "力场", "毒素", "疾病", "流血", "阴气", "阳气",
    "命能", "虚能", "死亡", "光照",
    # Misc
    "魔法", "魔法物品", "印记", "持续", "操弄",
    "幸运", "增益", "减损", "降级",
}


def _is_trait_only_run(text: str) -> bool:
    """True if the inner-strong text is purely a list of trait words / brackets."""
    raw = text.strip()
    if not raw:
        return False
    # Remove brackets and split by whitespace
    cleaned = re.sub(r"[\[\]]", " ", raw)
    tokens = [t for t in cleaned.split() if t]
    if not tokens or len(tokens) > 8:
        return False
    return all(t in TRAIT_WORDS for t in tokens)


_TRAIT_LEAD_RE = re.compile(r"^<p><strong>([^<]+)</strong>(\s*)")


def strip_trait_lead(html: str) -> str:
    """Strip a leading `<p><strong>{traits}</strong> ` if the strong content is
    purely PF2e trait keywords. Returns html unchanged otherwise.
    """
    m = _TRAIT_LEAD_RE.match(html)
    if not m:
        return html
    if _is_trait_only_run(m.group(1)):
        return "<p>" + html[m.end():]
    return html


def load_cn_lookup(source: dict, overrides: dict) -> dict:
    """Build a lookup keyed by (pack_hint, en_norm) -> entry dict.

    Strategy:
      1. Start with by_class entries (en_norm -> entry).
      2. Apply overrides.by_pack on top: per-pack overrides win.
    """
    base_by_en: dict = {}
    for cls, entries in source.get("by_class", {}).items():
        for ek, entry in entries.items():
            # Strip leading docx-style trait lines (e.g. `<p><strong>狂徒 风险</strong> ...`)
            # — PF2e renders traits separately above the description, so inline
            # duplication is undesirable.
            entry = dict(entry)
            entry["desc_html_cn"] = strip_trait_lead(entry.get("desc_html_cn", ""))
            existing = base_by_en.get(ek)
            if existing is None or len(entry["desc_html_cn"]) > len(
                existing["desc_html_cn"]
            ):
                base_by_en[ek] = entry
    # overrides.by_pack: keyed by original (extracted) entry key
    pack_overrides: dict = {}
    for pack, ents in overrides.get("by_pack", {}).items():
        pack_overrides[pack] = {
            normalize_en_key(orig_en): {
                "name_cn": v.get("name_cn", ""),
                "name_en": orig_en,
                "desc_html_cn": v.get("desc_html_cn", ""),
            }
            for orig_en, v in ents.items()
        }
    return {"base": base_by_en, "by_pack": pack_overrides}


def lookup_cn(pack: str, en_key: str, lookup: dict) -> dict | None:
    """Pack-specific override > base."""
    p = lookup["by_pack"].get(pack, {})
    if en_key in p:
        return p[en_key]
    return lookup["base"].get(en_key)


def load_agent_out() -> dict:
    """Load agent-out shards. Returns {pack: {original_en_key: {name_cn, desc_html_cn}}}.

    Supports two file formats:
      1. List of objects:   [{pack, orig_key, name_cn, desc_html_cn}, ...]
      2. Flat dict keyed by orig_key, filename pattern <pack>__shard<n>.json
    """
    out: dict = {}
    if not AGENT_OUT.exists():
        return out
    for shard in sorted(AGENT_OUT.glob("*.json")):
        with shard.open(encoding="utf-8") as f:
            data = json.load(f)
        if isinstance(data, list):
            for item in data:
                pack = item.get("pack")
                # For journals, the page name is the lookup key (translate_journal_entry
                # looks up by normalize_en_key(page.name)), so use page_name when given.
                orig = item.get("page_name") or item.get("orig_key")
                if not pack or not orig:
                    continue
                out.setdefault(pack, {})[normalize_en_key(orig)] = {
                    "name_cn": item.get("name_cn", ""),
                    "name_en": orig,
                    "desc_html_cn": item.get("desc_html_cn", item.get("description_cn", "")),
                }
        elif isinstance(data, dict):
            stem = shard.stem
            pack = stem.split("__")[0]
            for k, v in data.items():
                out.setdefault(pack, {})[normalize_en_key(k)] = v
    return out


def merge_agent_into_lookup(lookup: dict, agent_out: dict) -> None:
    """Promote agent translations into the per-pack override layer.

    Agent output is always treated as the most authoritative source for the
    entries it covers — Phase 2 fills docx gaps, and the quality-fix Phase 5
    re-translates entries with EN scaffolding. Always overwrite.
    """
    for pack, ents in agent_out.items():
        existing = lookup["by_pack"].setdefault(pack, {})
        for ek, entry in ents.items():
            existing[ek] = {
                "name_cn": entry.get("name_cn", ""),
                "name_en": entry.get("name_en", ""),
                "desc_html_cn": strip_trait_lead(
                    entry.get("desc_html_cn", entry.get("description_cn", ""))
                ),
            }


def bilingual_name(cn: str, en: str) -> str:
    cn = (cn or "").strip()
    en = (en or "").strip()
    if cn and en:
        return f"{cn} {en}"
    return cn or en


def bilingual_desc(cn_html: str, en_html: str) -> str:
    cn = (cn_html or "").strip()
    en = (en_html or "").strip()
    if not cn:
        return en
    if not en:
        return cn
    # Single <hr /> separates the two language blocks.
    return f"{cn}\n<hr />\n{en}"


def translate_folders(folders: dict) -> dict:
    out = {}
    for k, v in folders.items():
        out[k] = FOLDER_TRANSLATIONS.get(v, v)
    return out


def translate_prerequisites(prereq_list: list, lookup: dict, pack: str) -> list:
    """Each item is {"value": "..."}.  Try to bilingualize the value text."""
    out = []
    for item in prereq_list or []:
        if not isinstance(item, dict):
            out.append(item)
            continue
        val = item.get("value", "")
        en_key = normalize_en_key(val)
        new_val = val
        if en_key in PREREQ_TRANSLATIONS:
            new_val = f"{PREREQ_TRANSLATIONS[en_key]} {val}"
        else:
            cn_entry = lookup_cn(pack, en_key, lookup)
            if cn_entry and cn_entry.get("name_cn"):
                new_val = f"{cn_entry['name_cn']} {val}"
        out.append({**item, "value": new_val})
    return out


def translate_item_entry(
    pack: str, orig_en: str, entry: dict, lookup: dict
) -> tuple[dict, bool]:
    """Translate a single Item entry. Returns (translated_entry, was_translated)."""
    en_key = normalize_en_key(orig_en)
    cn_entry = lookup_cn(pack, en_key, lookup)
    out = dict(entry)
    en_name = entry.get("name", orig_en)
    en_desc = entry.get("description", "")
    cn_name = cn_entry["name_cn"] if cn_entry else ""
    cn_desc = cn_entry["desc_html_cn"] if cn_entry else ""
    out["name"] = bilingual_name(cn_name, en_name)
    if "description" in entry:
        out["description"] = bilingual_desc(cn_desc, en_desc)
    if "prerequisites" in entry:
        out["prerequisites"] = translate_prerequisites(
            entry["prerequisites"], lookup, pack
        )
    was_translated = bool(cn_name)
    return out, was_translated


def translate_journal_entry(
    pack: str, orig_en: str, entry: dict, lookup: dict
) -> tuple[dict, bool]:
    """Translate a JournalEntry: {name, pages: {pageName: {name, text}}}."""
    en_key = normalize_en_key(orig_en)
    cn_entry = lookup_cn(pack, en_key, lookup)
    out = dict(entry)
    en_name = entry.get("name", orig_en)
    cn_name = cn_entry["name_cn"] if cn_entry else ""
    out["name"] = bilingual_name(cn_name, en_name)
    new_pages = {}
    pages = entry.get("pages", {})
    any_translated = bool(cn_name)
    for page_key, page in pages.items():
        page_en_key = normalize_en_key(page.get("name", page_key))
        page_cn = lookup_cn(pack, page_en_key, lookup)
        page_out = dict(page)
        en_page_name = page.get("name", page_key)
        en_page_text = page.get("text", "")
        cn_page_name = page_cn["name_cn"] if page_cn else ""
        cn_page_text = page_cn["desc_html_cn"] if page_cn else ""
        page_out["name"] = bilingual_name(cn_page_name, en_page_name)
        if "text" in page:
            page_out["text"] = bilingual_desc(cn_page_text, en_page_text)
        new_pages[page_key] = page_out
        if cn_page_name or cn_page_text:
            any_translated = True
    if pages:
        out["pages"] = new_pages
    return out, any_translated


def translate_actor_entry(
    pack: str, orig_en: str, entry: dict, lookup: dict
) -> tuple[dict, bool]:
    """Translate an Actor entry: name, tokenName, prototypeToken, publicNotes,
    plus nested items dict."""
    en_key = normalize_en_key(orig_en)
    cn_entry = lookup_cn(pack, en_key, lookup)
    out = dict(entry)
    en_name = entry.get("name", orig_en)
    cn_name = cn_entry["name_cn"] if cn_entry else ""
    out["name"] = bilingual_name(cn_name, en_name)
    if "tokenName" in entry:
        out["tokenName"] = bilingual_name(cn_name, entry["tokenName"])
    if "prototypeToken" in entry:
        out["prototypeToken"] = bilingual_name(cn_name, entry["prototypeToken"])
    if "publicNotes" in entry:
        # All six thrall actors share the same generic Thrall publicNotes.
        # Use the dedicated Thrall override (or pack-specific override for
        # this actor's publicNotes) instead of the per-actor desc, which is
        # the spell description and belongs in items[<name>].description.
        thrall_override = lookup_cn(pack, normalize_en_key("Thrall"), lookup)
        cn_pub = thrall_override["desc_html_cn"] if thrall_override else ""
        out["publicNotes"] = bilingual_desc(cn_pub, entry["publicNotes"])
    new_items = {}
    items = entry.get("items", {})
    for item_key, item in items.items():
        item_en_key = normalize_en_key(item.get("name", item_key))
        item_cn = lookup_cn(pack, item_en_key, lookup)
        item_out = dict(item)
        en_item_name = item.get("name", item_key)
        en_item_desc = item.get("description", "")
        cn_item_name = item_cn["name_cn"] if item_cn else ""
        # Fallback to short-name dictionary for repeated rule-element items
        if not cn_item_name and en_item_name in SHORT_NAME_TRANSLATIONS:
            cn_item_name = SHORT_NAME_TRANSLATIONS[en_item_name]
        cn_item_desc = item_cn["desc_html_cn"] if item_cn else ""
        item_out["name"] = bilingual_name(cn_item_name, en_item_name)
        if "description" in item:
            item_out["description"] = bilingual_desc(cn_item_desc, en_item_desc)
        new_items[item_key] = item_out
    if items:
        out["items"] = new_items
    was_translated = bool(cn_name)
    return out, was_translated


def detect_entry_type(entries: dict) -> str:
    """Cheap heuristic: presence of 'pages' -> journal; 'tokenName' -> actor; else item."""
    for ent in entries.values():
        if "pages" in ent:
            return "journal"
        if "tokenName" in ent or "prototypeToken" in ent:
            return "actor"
        return "item"
    return "item"


def build_pack(pack: str, lookup: dict, spell_fields: dict | None = None) -> dict:
    """Read the extracted English JSON, return the translated structure."""
    src_path = EXTRACTED_DIR / f"pf2e-playtest-data.{pack}.json"
    if not src_path.exists():
        print(f"  [skip] {src_path} not found", file=sys.stderr)
        return {}
    with src_path.open(encoding="utf-8") as f:
        data = json.load(f)
    out: dict = {}
    out["label"] = PACK_LABELS.get(pack, data.get("label", pack))
    mapping = dict(data.get("mapping", {})) if "mapping" in data else {}
    # For the spells pack, add range/target/duration fields so Babele can
    # apply per-entry CN values.
    if pack == "impossible-playtest-spells" and spell_fields:
        mapping["range"] = "system.range.value"
        mapping["target"] = "system.target.value"
        mapping["duration"] = "system.duration.value"
    if mapping:
        out["mapping"] = mapping
    out["folders"] = translate_folders(data.get("folders", {}))
    entries = data.get("entries", {})
    entry_type = detect_entry_type(entries)
    new_entries: dict = {}
    missing: list = []
    translated_count = 0
    for orig_en, entry in entries.items():
        if entry_type == "journal":
            new_entry, was = translate_journal_entry(pack, orig_en, entry, lookup)
        elif entry_type == "actor":
            new_entry, was = translate_actor_entry(pack, orig_en, entry, lookup)
        else:
            new_entry, was = translate_item_entry(pack, orig_en, entry, lookup)
        # Augment spell entries with range/target/duration translations
        if pack == "impossible-playtest-spells" and spell_fields:
            sf = spell_fields.get(orig_en)
            if isinstance(sf, dict):
                for fk in ("range", "target", "duration"):
                    if sf.get(fk):
                        new_entry[fk] = sf[fk]
        new_entries[orig_en] = new_entry
        if was:
            translated_count += 1
        else:
            missing.append(orig_en)
    out["entries"] = new_entries
    out["__stats"] = {
        "type": entry_type,
        "total": len(entries),
        "translated": translated_count,
        "missing": missing,
    }
    return out


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument(
        "--merge-agent-out",
        action="store_true",
        help="Also fold tools/playtest/agent-out/*.json shards into the lookup",
    )
    args = ap.parse_args()

    if not SOURCE_JSON.exists():
        print(f"Missing {SOURCE_JSON} — run parse-docx-md.py first", file=sys.stderr)
        sys.exit(1)
    source = json.loads(SOURCE_JSON.read_text(encoding="utf-8"))
    overrides = (
        json.loads(OVERRIDES_JSON.read_text(encoding="utf-8"))
        if OVERRIDES_JSON.exists()
        else {}
    )
    spell_fields = (
        json.loads(SPELL_FIELDS_JSON.read_text(encoding="utf-8"))
        if SPELL_FIELDS_JSON.exists()
        else {}
    )
    # Drop the _doc comment key
    spell_fields = {k: v for k, v in spell_fields.items() if not k.startswith("_")}
    lookup = load_cn_lookup(source, overrides)
    if args.merge_agent_out:
        agent_out = load_agent_out()
        merge_agent_into_lookup(lookup, agent_out)
        print(
            f"merged agent-out: {sum(len(v) for v in agent_out.values())} entries from {len(agent_out)} shards"
        )

    COMPENDIUM_DIR.mkdir(parents=True, exist_ok=True)
    missing_manifest: dict = {}
    report_lines: list = []
    grand_total = grand_translated = 0
    for pack in PACK_LABELS:
        result = build_pack(pack, lookup, spell_fields)
        if not result:
            continue
        stats = result.pop("__stats", {})
        out_path = COMPENDIUM_DIR / f"pf2e-playtest-data.{pack}.json"
        out_path.write_text(
            json.dumps(result, ensure_ascii=False, indent=2), encoding="utf-8"
        )
        if stats.get("missing"):
            missing_manifest[pack] = stats["missing"]
        n_total = stats.get("total", 0)
        n_done = stats.get("translated", 0)
        grand_total += n_total
        grand_translated += n_done
        report_lines.append(
            f"{pack}: {n_done}/{n_total} translated, {n_total - n_done} missing"
        )
    MISSING_JSON.write_text(
        json.dumps(missing_manifest, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    report_lines.append("")
    report_lines.append(
        f"TOTAL: {grand_translated}/{grand_total} translated, "
        f"{grand_total - grand_translated} missing"
    )
    REPORT_TXT.write_text("\n".join(report_lines), encoding="utf-8")
    print("\n".join(report_lines))
    print()
    print(f"compendium dir: {COMPENDIUM_DIR}")
    print(f"missing manifest: {MISSING_JSON}")
    print(f"report: {REPORT_TXT}")


if __name__ == "__main__":
    main()
