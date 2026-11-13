#!/usr/bin/env python3
"""Export a local product video into two synchronized WebP sequences."""
import argparse
import hashlib
import json
import math
from fractions import Fraction
from pathlib import Path
import shutil
import subprocess

parser=argparse.ArgumentParser(description=__doc__)
parser.add_argument('video',type=Path)
parser.add_argument('--start',type=float,default=0)
parser.add_argument('--duration',type=float)
parser.add_argument('--fps',type=float,default=24)
args=parser.parse_args()
video=args.video.resolve(strict=True)
probe=json.loads(subprocess.check_output(['ffprobe','-v','error','-select_streams','v:0','-show_streams','-show_format','-of','json',str(video)]))
stream=probe['streams'][0]
duration=min(args.duration or float(probe['format']['duration']),float(probe['format']['duration'])-args.start)
fps=min(args.fps,float(Fraction(stream['avg_frame_rate'])))
count=math.floor(duration*fps+0.00001)
if args.start<0 or fps<=0 or not 8<=count<=600:
    parser.error('Select a valid segment containing 8 to 600 frames with --start, --duration and --fps.')
root=Path(__file__).resolve().parent.parent
motion=root/'src/assets/motion'
output=motion/'video'
variants={}
for name,max_width,quality in [('desktop',1280,86),('mobile',768,84)]:
    width=min(max_width,int(stream['width']))//2*2
    height=round(int(stream['height'])*width/int(stream['width'])/2)*2
    target=output/name
    target.mkdir(parents=True,exist_ok=True)
    for old in target.glob('frame-*.webp'):
        old.unlink()
    subprocess.run(['ffmpeg','-hide_banner','-loglevel','error','-y','-ss',str(args.start),'-i',str(video),'-map','0:v:0','-an','-vf',f'fps={fps},scale={width}:{height}:flags=lanczos','-frames:v',str(count),'-c:v','libwebp','-quality',str(quality),'-compression_level','5','-threads','2',str(target/'frame-%04d.webp')],check=True)
    if len(list(target.glob('frame-*.webp')))!=count:
        raise RuntimeError(f'Incomplete {name} export')
    variants[name]={'base':f'/assets/motion/video/{name}','width':width,'height':height}
shutil.copyfile(output/'desktop/frame-0001.webp',output/'opening.webp')
shutil.copyfile(output/f'desktop/frame-{count:04d}.webp',output/'poster.webp')
digest=hashlib.sha256()
with video.open('rb') as source:
    for block in iter(lambda:source.read(1048576),b''):
        digest.update(block)
manifest={'schema':2,'count':count,'fps':fps,'duration':count/fps,'source':{'name':video.name,'width':stream['width'],'height':stream['height'],'sha256':digest.hexdigest(),'start':args.start},'poster':'/assets/motion/video/poster.webp','opening':'/assets/motion/video/opening.webp','variants':variants}
(motion/'manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')
subprocess.run(['node','scripts/build.mjs'],cwd=root,check=True)
print(f'{count} frames per variant; {count/fps:.2f}s at {fps:g}fps.')
