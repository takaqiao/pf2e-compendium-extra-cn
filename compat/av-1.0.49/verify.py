#!/usr/bin/env python3
"""Read-only, fail-closed verifier for the AV 1.0.49 optional compatibility patch."""
import argparse
import hashlib
import json
from pathlib import Path
import sys


def digest(path):
    value = hashlib.sha256()
    with path.open("rb") as stream:
        for block in iter(lambda: stream.read(1024 * 1024), b""):
            value.update(block)
    return value.hexdigest()


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--modules", required=True, type=Path,
                        help="Foundry Data/modules directory")
    parser.add_argument("--expect", required=True, choices=("before", "after"),
                        help="Require all seven files to match the original or patched state")
    args = parser.parse_args()
    package = Path(__file__).resolve().parent
    errors = []
    checked = []
    try:
        manifest = json.loads((package / "manifest.json").read_text(encoding="utf-8"))
        root = args.modules.resolve(strict=True)
        if not root.is_dir():
            raise ValueError("--modules is not a directory")
        patch = package / manifest["patch"]["file"]
        if digest(patch) != manifest["patch"]["sha256"]:
            errors.append("Patch file SHA256 differs from manifest; do not apply it")
        if len(manifest["files"]) != 7:
            errors.append("Manifest must contain exactly seven target files")
        paths = [entry["path"] for entry in manifest["files"]]
        if len(set(paths)) != 7:
            errors.append("Manifest contains duplicate target paths")
        for module in manifest["modules"]:
            path = root / module["id"] / "module.json"
            if not path.is_file():
                errors.append(f"Missing module manifest: {path}")
                continue
            actual = json.loads(path.read_text(encoding="utf-8-sig"))
            if actual.get("id") != module["id"] or actual.get("version") != module["version"]:
                errors.append(f"Wrong module/version: {module['id']} requires {module['version']}; "
                              f"found {actual.get('id')} {actual.get('version')}")
        for entry in manifest["files"]:
            relative = Path(entry["path"])
            if relative.is_absolute() or ".." in relative.parts:
                errors.append(f"Unsafe manifest path: {entry['path']}")
                continue
            path = root / relative
            try:
                resolved = path.resolve(strict=True)
                resolved.relative_to(root)
                if not resolved.is_file():
                    raise ValueError("not a regular file")
                current = digest(resolved)
            except (OSError, ValueError) as exc:
                errors.append(f"Missing/outside/invalid target {entry['path']}: {exc}")
                continue
            expected = entry[args.expect + "Sha256"]
            checked.append({"path": entry["path"], "sha256": current,
                            "expectedSha256": expected, "matches": current == expected})
            if current != expected:
                errors.append(f"SHA256 mismatch ({args.expect}): {entry['path']}")
    except (OSError, ValueError, KeyError, TypeError) as exc:
        errors.append(str(exc))
    print(json.dumps({"status": "PASS" if not errors else "FAIL", "expect": args.expect,
                      "readOnly": True, "checkedFiles": checked, "errors": errors},
                     ensure_ascii=False, indent=2))
    return 1 if errors else 0


if __name__ == "__main__":
    sys.exit(main())
