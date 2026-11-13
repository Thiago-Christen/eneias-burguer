#!/usr/bin/env python3
"""Restore media packs in a GitHub checkout before the static build."""
from pathlib import Path, PurePosixPath
import hashlib
import json
import zipfile

root=Path(__file__).resolve().parent.parent
manifest=root/'asset-packs/manifest.json'
if not manifest.exists():
    raise SystemExit('Assets are missing. Restore the asset-packs directory from the repository.')
for pack in json.loads(manifest.read_text())['packs']:
    path=root/'asset-packs'/pack['name']
    if hashlib.sha256(path.read_bytes()).hexdigest()!=pack['sha256']:
        raise SystemExit(f'Incomplete asset pack: {path.name}')
    with zipfile.ZipFile(path) as archive:
        for entry in archive.infolist():
            parts=PurePosixPath(entry.filename).parts
            if parts[:2]!=('src','assets') or '..' in parts:
                raise SystemExit('Invalid asset path')
        archive.extractall(root)
print('Media packs restored.')
