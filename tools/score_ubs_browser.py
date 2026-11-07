#!/usr/bin/env python3
"""Independent UBS 2025 PDF vs real Chromium SVG screenshot scoring.

Example:
  python tools/score_ubs_browser.py --pdf /tmp/ubs_original.pdf --captures /tmp/ubs_browser --out /tmp/ubs_score.json

This script NEVER creates candidate images from PDF or derives reference from the
candidate. It requires independently captured browser images from the Node script.
Exit 2: at least one page does not clear ALL strict 99% acceptance gates.
Requires: pip install pymupdf numpy pillow opencv-python-headless scikit-image
"""
from __future__ import annotations
import argparse,hashlib,json,sys
from pathlib import Path
import numpy as np
import pymupdf
from PIL import Image
sys.path.insert(0,str(Path(__file__).parent))
from visual_fidelity_score import compare,load_rgb

PAGES=(5,8,11,13,16,18)
SOURCE_URL='https://www.ubs.com/content/dam/assets/wm/static/noindex/gwr-2025-digital.pdf'

def pixel_reference(doc,page_num):
    p=doc[page_num-1]
    pix=p.get_pixmap(matrix=pymupdf.Matrix(1.5,1.5),alpha=False)
    if (pix.width,pix.height)!=(1263,893):
        raise ValueError('UBS source PDF page must render to 1263x893 at 1.5x')
    reference=np.frombuffer(pix.samples,dtype=np.uint8).reshape(pix.height,pix.width,3).copy()
    rects=[]
    for block in p.get_text('rawdict')['blocks']:
        if block.get('type')!=0:continue
        for line in block['lines']:
            for span in line['spans']:
                for ch in span['chars']:
                    x0,y0,x1,y1=ch['bbox']
                    x=max(0,int(x0*1.5)-1);y=max(0,int(y0*1.5)-1)
                    xx=min(pix.width,int(x1*1.5)+2);yy=min(pix.height,int(y1*1.5)+2)
                    if xx>x and yy>y:rects.append({'x':x,'y':y,'w':xx-x,'h':yy-y,'role':'text'})
    rects.append({'x':45,'y':21,'w':95,'h':64,'role':'brand_logo'})
    return reference,{'benchmark':'independent_original','rects':rects}

def main():
    parser=argparse.ArgumentParser()
    parser.add_argument('--pdf',type=Path,required=True,help='Independently obtained official UBS 2025 PDF')
    parser.add_argument('--captures',type=Path,required=True,help='Directory with actual Chromium screenshots, ubs_pN_browser.png')
    parser.add_argument('--out',type=Path,default=Path('ubs_browser_scores.json'))
    args=parser.parse_args()
    if not args.pdf.is_file():parser.error('Source PDF does not exist')
    data=args.pdf.read_bytes()
    if not data.startswith(b'%PDF-'):parser.error('Source reference must be actual PDF')
    pdf_sha=hashlib.sha256(data).hexdigest()
    doc=pymupdf.open(stream=data,filetype='pdf')
    if len(doc)<18:parser.error('UBS PDF does not contain source pages 5,8,11,13,16,18')
    result={'schema':'ubs2025-independent-chromium-graphics/v1','sourceUrl':SOURCE_URL,'sourceSHA256':pdf_sha,
            'sourceEdition':'2025','width':1263,'height':893,'mask':'per original glyph bounding box + fixed official logo area',
            'pages':[]}
    for page_num in PAGES:
        reference,mask=pixel_reference(doc,page_num)
        filename=args.captures/f'ubs_p{page_num}_browser.png'
        if not filename.is_file():parser.error(f'Actual Chromium capture missing: {filename}')
        candidate=load_rgb(str(filename))
        if candidate.shape!=reference.shape:parser.error(f'Resolution mismatch on page {page_num}')
        if hashlib.sha256(reference.tobytes()).digest()==hashlib.sha256(candidate.tobytes()).digest():
            raise ValueError(f'Self-comparison rejected on page {page_num}')
        summary=compare(reference,candidate,mask)
        row={'page':page_num,'score':summary['score'],'components':summary['components'],
             'maskedFraction':summary['maskedFraction'],'passed99':summary['passed99'],
             'candidateSHA256':hashlib.sha256(filename.read_bytes()).hexdigest()}
        result['pages'].append(row)
        print(f"PDF page {page_num:2d}: composite={row['score']:7.4f}%, edges={row['components']['edges']:7.4f}%, passed99={row['passed99']}")
    result['passed99Pages']=sum(x['passed99'] for x in result['pages'])
    result['allSixPassed']=result['passed99Pages']==6
    result['state']='PASS' if result['allSixPassed'] else 'INCOMPLETE'
    args.out.parent.mkdir(parents=True,exist_ok=True)
    args.out.write_text(json.dumps(result,indent=2,ensure_ascii=False)+'\n',encoding='utf8')
    print(f"Independent browser QA: {result['passed99Pages']}/6 pages passed, status={result['state']}; saved {args.out}")
    return 0 if result['allSixPassed'] else 2

if __name__=='__main__':
    raise SystemExit(main())
