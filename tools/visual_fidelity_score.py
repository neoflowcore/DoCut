#!/usr/bin/env python3
"""Auditable pixel/edge/colour/shadow comparison for DoCut vector reports.

Actual design fidelity can ONLY be measured against an independently rendered
original. Never score a self-generated target as an official benchmark.

Usage: python tools/visual_fidelity_score.py --reference ref.png --candidate candidate.png
       --mask text_regions.json --output-dir /tmp/fidelity --reference-id UBS-GWR-2025-p03
"""
from __future__ import annotations
import argparse
import json
from pathlib import Path
import cv2
import numpy as np
from PIL import Image
from skimage.metrics import structural_similarity

SCORE_VERSION = 'fidelity-score-v1.0'
WEIGHTS = {'structure': .35, 'edges': .25, 'color': .25, 'light_shadow': .15}


def load_rgb(path):
    return np.asarray(Image.open(path).convert('RGB'), dtype=np.uint8)


def masks(shape, spec):
    height, width = shape[:2]
    valid = np.ones((height, width), dtype=bool)
    for box in spec.get('rects', []):
        if box.get('role') not in ('text', 'number', 'identifier', 'brand_logo'):
            raise ValueError('Only named text/number/logo areas may be masked; never a chart or graphic')
        x, y, w, h = [int(box[k]) for k in ('x', 'y', 'w', 'h')]
        if not (x >= 0 and y >= 0 and w > 0 and h > 0 and x+w <= width and y+h <= height):
            raise ValueError('Mask bounds must be inside the source page')
        valid[y:y+h, x:x+w] = False
    coverage = 1.0 - float(valid.mean())
    if coverage > 0.35:
        raise ValueError('Text masks would hide over 35% of the original; require review')
    if valid.sum() < 100:
        raise ValueError('Not enough unmasked design surface')
    return valid, coverage


def compare(reference, candidate, mask_spec=None, edge_tolerance_px=2):
    if reference.shape != candidate.shape or reference.ndim != 3:
        raise ValueError('Canvas dimensions differ. Compare the exact same ratio/resolution; do not stretch.')
    if min(reference.shape[:2]) < 100:
        raise ValueError('Reference must be at least 100 px on each side')
    valid, removed = masks(reference.shape, mask_spec or {'rects': []})
    r, c = reference.astype(np.float32), candidate.astype(np.float32)
    background = np.median(np.concatenate([r[:8].reshape(-1, 3), r[-8:].reshape(-1, 3)], axis=0), axis=0)
    # Weight actual design elements; an empty white page must not score 99%.
    foreground = np.max(np.abs(r-background[None,None,:]), axis=2) > 10
    gray_r = cv2.cvtColor(reference, cv2.COLOR_RGB2GRAY)
    gray_c = cv2.cvtColor(candidate, cv2.COLOR_RGB2GRAY)
    e_r, e_c = cv2.Canny(gray_r, 55, 145)>0, cv2.Canny(gray_c,55,145)>0
    kernel = np.ones((edge_tolerance_px*2+1,)*2, dtype=np.uint8)
    near_r = cv2.dilate(e_r.astype(np.uint8),kernel)>0
    near_c = cv2.dilate(e_c.astype(np.uint8),kernel)>0
    salient = valid * (1.0 + 2.3*foreground + 4.0*near_r)
    _, ssim_map = structural_similarity(gray_r,gray_c,full=True,data_range=255,gaussian_weights=True,sigma=1.5)
    structure = float(np.average(np.clip(ssim_map,0,1),weights=salient))
    all_ref, all_c = e_r & valid,e_c & valid
    recall = float((all_ref & near_c).sum() / max(1,int(all_ref.sum())))
    precision = float((all_c & near_r).sum() / max(1,int(all_c.sum())))
    if not all_ref.any() and not all_c.any(): edges = 1.0
    elif not all_ref.any() or not all_c.any(): edges = 0.0
    else: edges = 2*precision*recall/(precision+recall+1e-12)
    # CIE Lab color differences; deltaE76 is a diagnostic, not a pass claim.
    lab_r=cv2.cvtColor(reference,cv2.COLOR_RGB2LAB).astype(np.float32)
    lab_c=cv2.cvtColor(candidate,cv2.COLOR_RGB2LAB).astype(np.float32)
    delta_e=np.sqrt(np.sum((lab_r-lab_c)**2,axis=2))
    mae=np.mean(np.abs(r-c),axis=2)/255.0
    color=max(0.0,1.0-float(np.average(mae,weights=salient)))
    # Low-frequency luminance / color gradients capture soft shadow boundaries.
    blur_r=cv2.GaussianBlur(gray_r,(0,0),5).astype(np.float32)
    blur_c=cv2.GaussianBlur(gray_c,(0,0),5).astype(np.float32)
    gx_r=cv2.Sobel(blur_r,cv2.CV_32F,1,0,ksize=3);gy_r=cv2.Sobel(blur_r,cv2.CV_32F,0,1,ksize=3)
    gx_c=cv2.Sobel(blur_c,cv2.CV_32F,1,0,ksize=3);gy_c=cv2.Sobel(blur_c,cv2.CV_32F,0,1,ksize=3)
    grad_diff=(np.abs(gx_r-gx_c)+np.abs(gy_r-gy_c))/510.0
    shade=max(0.0,1.0-float(np.average(np.minimum(1,grad_diff),weights=salient)))
    details={'structure':structure,'edges':edges,'color':color,'light_shadow':shade}
    score=sum(WEIGHTS[k]*v for k,v in details.items())
    # Hard per-component gates; one excellent score cannot conceal bad geometry.
    passed=(score>=.99 and structure>=.985 and edges>=.98 and color>=.99 and shade>=.985)
    if mask_spec and mask_spec.get('benchmark') != 'independent_original':
        raise ValueError('Mask manifest must identify independently obtained original benchmark')
    return {
        'metricVersion':SCORE_VERSION, 'basis':'independent_original_required',
        'score':round(100*score,4),'passed99':passed,
        'components':{k:round(v*100,4) for k,v in details.items()},
        'deltaE_lab_mean':round(float(np.mean(delta_e[valid])),4),
        'maskedFraction':round(removed,6),
        'imageSize':{'width':reference.shape[1],'height':reference.shape[0]},
        'limits':'Image metrics quantify pixel similarity only. Check content copyright, source aspect ratio, responsiveness, editability and accessibility separately.'
    }


def main():
    p=argparse.ArgumentParser(description=__doc__)
    p.add_argument('--reference',type=Path,required=True);p.add_argument('--candidate',type=Path,required=True)
    p.add_argument('--mask',type=Path);p.add_argument('--output-dir',type=Path,required=True)
    p.add_argument('--reference-id',required=True,help='Original report ID + edition + page number')
    args=p.parse_args()
    m=json.loads(args.mask.read_text(encoding='utf-8')) if args.mask else {'rects': [],'benchmark':'independent_original'}
    ref=load_rgb(args.reference);cand=load_rgb(args.candidate)
    result=compare(ref,cand,m)
    result['referenceId']=args.reference_id
    result['originalPath']=str(args.reference);result['candidatePath']=str(args.candidate)
    args.output_dir.mkdir(parents=True,exist_ok=True)
    (args.output_dir/'score.json').write_text(json.dumps(result,indent=2,ensure_ascii=False),encoding='utf-8')
    delta=np.max(np.abs(ref.astype(np.int16)-cand.astype(np.int16)),axis=2)
    red=np.zeros((*delta.shape,3),dtype=np.uint8);red[:,:,0]=np.clip(delta*4,0,255).astype(np.uint8)
    overlay=np.clip(ref*.5+cand*.5,0,255).astype(np.uint8)
    Image.fromarray(overlay).save(args.output_dir/'overlay.png')
    Image.fromarray(red).save(args.output_dir/'heatmap.png')
    print(json.dumps(result,ensure_ascii=False,indent=2))

if __name__=='__main__':main()
