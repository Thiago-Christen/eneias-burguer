#!/usr/bin/env python3
"""Prepare source files and bounded media packs for a new GitHub repository."""
from pathlib import Path
import argparse
import hashlib
import json
import shutil
import zipfile

parser=argparse.ArgumentParser(description=__doc__)
parser.add_argument('destination',type=Path)
args=parser.parse_args()
root=Path(__file__).resolve().parent.parent
target=args.destination.resolve()
target.mkdir(parents=True,exist_ok=True)
if any(target.iterdir()):
    raise SystemExit('Use an empty export directory.')
for name in ['src','scripts','docs','.github']:
    for path in (root/name).rglob('*'):
        if not path.is_file() or '__pycache__' in path.parts or path.is_relative_to(root/'src/assets'):
            continue
        destination=target/path.relative_to(root)
        destination.parent.mkdir(parents=True,exist_ok=True)
        shutil.copyfile(path,destination)
for name in ['README.md','package.json','package-lock.json']:
    shutil.copyfile(root/name,target/name)
(target/'.gitignore').write_text('node_modules/\ndist/\npages-dist/\nsrc/assets/\n.env\n.env.*\n*.mp4\n*.tar.gz\n__pycache__/\n')
packs=target/'asset-packs'
packs.mkdir()
files=sorted(p for p in (root/'src/assets').rglob('*') if p.is_file())
groups=[];group=[];weight=0
for path in files:
    size=path.stat().st_size
    if group and weight+size>2*1024*1024:
        groups.append(group);group=[];weight=0
    group.append(path);weight+=size
if group:groups.append(group)
manifest=[]
for number,paths in enumerate(groups,1):
    destination=packs/f'media-{number:02d}.zip'
    with zipfile.ZipFile(destination,'w',compression=zipfile.ZIP_DEFLATED,compresslevel=6) as archive:
        for path in paths:archive.write(path,path.relative_to(root).as_posix())
    manifest.append({'name':destination.name,'sha256':hashlib.sha256(destination.read_bytes()).hexdigest(),'bytes':destination.stat().st_size})
(packs/'manifest.json').write_text(json.dumps({'packs':manifest},indent=2)+'\n')
print(json.dumps({'destination':str(target),'files':len([p for p in target.rglob('*') if p.is_file()]),'media_packs':len(manifest),'media_bytes':sum(p['bytes'] for p in manifest)}))
