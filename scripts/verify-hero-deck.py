#!/usr/bin/env python3
"""Check the HAD translation in the checkout and, optionally, a release ZIP.

Run from any directory (Python standard library only):
    python scripts/verify-hero-deck.py
    python scripts/verify-hero-deck.py --zip /path/to/module.zip
    python scripts/verify-hero-deck.py --source /path/to/pf2e-hero-deck-cn

The embedded contracts come from pf2e-hero-deck-cn 1.0.0, commit b4139b2.
They preserve the reviewed text and binding keys while allowing only the card
image directory to change. --source additionally compares all 52 image bytes
and the full JSON with that independently supplied original release directory.
An intentional translation revision must update these contracts after review.
This is a release-content gate; Foundry hook behavior needs runtime tests too.
"""

from __future__ import annotations

import argparse
import copy
import hashlib
import json
from pathlib import Path
import re
import shlex
import sys
from zipfile import BadZipFile, ZipFile

ROOT = Path(__file__).resolve().parent.parent
BASE_ID = "pf2e-hero-deck-unofficial"
PACK_ID = BASE_ID + ".pf2e-hero-action-card-deck-unofficial"
PACK_PATH = "compendium/" + PACK_ID + ".json"
LANG_PATH = "lang/external/" + BASE_ID + ".json"
CARDS_DIR = "assets/hero-action-deck/cards/"
IMAGE_PREFIX = "modules/pf2e-compendium-extra-cn/" + CARDS_DIR
OLD_PREFIX = "modules/pf2e-hero-deck-cn/assets/cards/"
LICENSE_PATH = "assets/hero-action-deck/LICENSE.txt"
COMPAT_PATH = "scripts/hero-deck-compat.mjs"
PACK_SHA256 = "55dd359238d0b38716fe1eea7294e671101122d4e00b9ffc0b0f3a6571f7f3fe"
I18N_SHA256 = "da32676f39a874e74e666d15409c7854a91c76f499ae9fc099a33ed08eecbac7"
PLACEHOLDERS = {
    "module-settings.hero-actions.max.name": [],
    "module-settings.hero-actions.max.hint": [],
    "module-settings.deck.id.hand.name": [],
    "module-settings.deck.id.hand.hint": [],
    "module-settings.deck.id.discard.name": [],
    "module-settings.deck.id.discard.hint": [],
    "module-settings.deck.id.hero-actions.name": [],
    "module-settings.deck.id.hero-actions.hint": [],
    "module-settings.animations.enabled.name": [],
    "module-settings.animations.enabled.hint": [],
    "module-settings.animations.volume.name": [],
    "module-settings.animations.volume.hint": [],
    "module-settings.messages.enable.name": [],
    "module-settings.messages.enable.hint": [],
    "ui.hero-action-dialogue.title": ["hpText"],
    "ui.hero-action-dialogue.warning": ["name"],
    "ui.hero-action-dialogue.buttons.play": [],
    "ui.hero-action-dialogue.buttons.discard": [],
    "ui.hero-action-hud.empty.name": [],
    "ui.hero-action-hud.empty.description": [],
    "ui.hero-action-hud.card-menu.open-menu": [],
    "ui.hero-action-hud.card-menu.draw-remaining": [],
    "message.title.draw": [],
    "message.title.discard": [],
    "message.title.play": [],
    "message.body.draw": ["cards", "name"],
    "message.body.discard": ["card", "name"],
    "message.body.play": ["card", "cardData", "name"],
    "notifications.warning.not-enough-hp": ["name"],
}


def require(condition, message):
    if not condition:
        raise AssertionError(message)


def digest(data):
    return hashlib.sha256(data).hexdigest()


def json_digest(data):
    return digest(json.dumps(data, ensure_ascii=False, sort_keys=True,
                             separators=(",", ":")).encode("utf-8"))


def flatten(data, prefix=""):
    require(isinstance(data, dict), f"expected i18n object at {prefix}")
    leaves = {}
    for key, value in data.items():
        path = f"{prefix}.{key}" if prefix else key
        if isinstance(value, dict):
            leaves.update(flatten(value, path))
        else:
            require(isinstance(value, str), f"i18n value is not text: {path}")
            leaves[path] = value
    return leaves


def normalize_pack(pack, prefix):
    """Validate all 52 image paths before removing only their directory."""
    normalized = copy.deepcopy(pack)
    cards = normalized["entries"]["Hero Action Deck"]["cards"]
    require(len(cards) == 52, f"expected 52 cards, found {len(cards)}")
    filenames = []
    for key, card in cards.items():
        faces = card["faces"]
        require(len(faces) == 1, f"{key}: expected exactly one card face")
        face = faces[0]
        path = face["img"]
        require(isinstance(path, str) and path.startswith(prefix),
                f"{key}: wrong image directory: {path}")
        filename = path[len(prefix):]
        require(re.fullmatch(r"[a-z0-9_]+\.webp", filename) is not None,
                f"{key}: invalid image filename: {filename}")
        require(face["name"] == card["name"], f"{key}: face name differs")
        require(face["text"] == card["description"], f"{key}: face text differs")
        filenames.append(filename)
        face["img"] = filename
    require(len(set(filenames)) == 52, "two cards share the same image file")
    return normalized, set(filenames)


class Contents:
    """Read the same runtime paths from a directory or unextracted ZIP."""

    def __init__(self, path, zipped=False):
        self.path = path
        self.zip = ZipFile(path) if zipped else None

    def read(self, name):
        return self.zip.read(name) if self.zip else (self.path / name).read_bytes()

    def json(self, name):
        return json.loads(self.read(name).decode("utf-8-sig"))

    def card_files(self):
        if self.zip:
            names = [info.filename for info in self.zip.infolist() if not info.is_dir()]
            require(len(names) == len(set(names)), "ZIP contains duplicate file entries")
            return {name for name in names if name.startswith(CARDS_DIR)}
        return {path.relative_to(self.path).as_posix()
                for path in (self.path / CARDS_DIR).rglob("*") if path.is_file()}

    def close(self):
        if self.zip:
            self.zip.close()


def check_contents(contents, source):
    pack = contents.json(PACK_PATH)
    normalized, filenames = normalize_pack(pack, IMAGE_PREFIX)
    require(json_digest(normalized) == PACK_SHA256,
            "card JSON changed beyond the 52 permitted image-directory replacements")
    expected_images = {CARDS_DIR + name for name in filenames}
    actual_images = contents.card_files()
    require(actual_images == expected_images,
            f"card files differ: missing={sorted(expected_images - actual_images)}, "
            f"extra={sorted(actual_images - expected_images)}")
    image_hashes = set()
    for name in sorted(expected_images):
        data = contents.read(name)
        require(len(data) > 12 and data[:4] == b"RIFF" and data[8:12] == b"WEBP",
                f"empty or invalid WebP: {name}")
        require(int.from_bytes(data[4:8], "little") + 8 == len(data),
                f"truncated or invalid WebP length: {name}")
        image_hashes.add(digest(data))
    require(len(image_hashes) == 52, "two card image files contain identical bytes")

    language = contents.json(LANG_PATH)
    require(set(language) == {BASE_ID}, "unexpected HAD i18n namespace")
    leaves = flatten(language[BASE_ID])
    require(set(leaves) == set(PLACEHOLDERS),
            f"29 i18n keys differ: missing={sorted(set(PLACEHOLDERS) - set(leaves))}, "
            f"extra={sorted(set(leaves) - set(PLACEHOLDERS))}")
    for key, expected in PLACEHOLDERS.items():
        actual = sorted(re.findall(r"\{(\w+)\}", leaves[key]))
        require(actual == expected, f"{key}: placeholders {actual} != {expected}")
    require(json_digest(language) == I18N_SHA256,
            "HAD i18n text differs from the reviewed 1.0.0 baseline")

    labels = contents.json("compendium/labels.json")
    titles = contents.json("compendium/titles.json")
    require(labels.get(PACK_ID) == pack["label"], "missing or stale HAD pack label")
    expected_titles = {"titles": {"Hero Action Deck": pack["entries"]["Hero Action Deck"]["name"]},
                       "folders": {}}
    require(titles.get(PACK_ID) == expected_titles, "missing or stale HAD pack titles")
    manifest = contents.json("module.json")
    require(manifest.get("id") == "pf2e-compendium-extra-cn", "wrong candidate module id")
    languages = {entry.get("lang"): entry.get("path") for entry in manifest.get("languages", [])}
    for lang in ("cn", "zh-CN", "zh_Hans", "zh-Hans"):
        require(languages.get(lang) == LANG_PATH,
                f"HAD language {lang} must use native pre-ready loading")
    for entry in manifest.get("languages", []):
        if entry.get("path") == LANG_PATH:
            require(entry.get("system") == "pf2e" and entry.get("module") == BASE_ID,
                    "HAD language must be conditional on PF2e and its active source module")
    require("en" not in languages, "HAD Chinese translations must not replace English")
    require(COMPAT_PATH in manifest.get("esmodules", []), "HAD compatibility script is not registered")
    require(contents.read(COMPAT_PATH).strip(), "HAD compatibility script is empty")
    requires = {entry["id"] for entry in manifest.get("relationships", {}).get("requires", [])}
    require(BASE_ID not in requires, "HAD must remain optional for extra users")
    require("pf2e-hero-deck-cn" not in requires, "the retired HAD translation must not be required")
    license_text = contents.read(LICENSE_PATH).decode("utf-8-sig")
    for credit in ("MIT", "Open Game License", "ChasarooniZ"):
        require(credit.lower() in license_text.lower(), f"HAD license is missing {credit} attribution")

    if source:
        original, original_names = normalize_pack(source.json(PACK_PATH), OLD_PREFIX)
        require(normalized == original, "complete card JSON differs from --source")
        require(language == source.json("lang/cn.json"), "complete i18n JSON differs from --source")
        require(filenames == original_names, "card filenames differ from --source")
        for name in sorted(filenames):
            require(digest(contents.read(CARDS_DIR + name)) ==
                    digest(source.read("assets/cards/" + name)),
                    f"card image SHA-256 differs from --source: {name}")
    return "52 cards, 52 unique WebPs, 29 i18n keys, complete reviewed text, indexes, script and license" + (
        "; source JSON and all 52 image hashes match" if source else "")


def check_workflow():
    workflow = (ROOT / ".github/workflows/release.yml").read_text(encoding="utf-8")
    logical_lines = re.sub(r"\\\r?\n[ \t]*", " ", workflow)
    commands = re.findall(r"^\s*zip[ \t]+-r[ \t]+([^\r\n]+)", logical_lines, re.MULTILINE)
    require(any("assets" in shlex.split(command) for command in commands),
            "release ZIP whitelist does not include the assets directory")
    return "release ZIP whitelist includes assets"


def main():
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--zip", type=Path, help="also verify an actual release ZIP without extracting it")
    parser.add_argument("--source", type=Path, help="original pf2e-hero-deck-cn 1.0.0 release directory")
    args = parser.parse_args()
    failures = []
    source = Contents(args.source) if args.source else None

    def run(label, check):
        try:
            print(f"OK   {label}: {check()}")
        except (AssertionError, OSError, ValueError, KeyError, TypeError, IndexError, BadZipFile) as error:
            failures.append(label)
            print(f"FAIL {label}: {error}")

    def verify(path, zipped=False):
        contents = Contents(path, zipped)
        try:
            return check_contents(contents, source)
        finally:
            contents.close()

    run("checkout", lambda: verify(ROOT))
    run("workflow", check_workflow)
    if args.zip:
        run("release ZIP", lambda: verify(args.zip, True))
    if failures:
        print(f"HAD release gate failed in {len(failures)} target(s).")
        return 1
    print("HAD release gate passed." + (" No release ZIP was supplied." if not args.zip else ""))
    return 0


if __name__ == "__main__":
    sys.exit(main())
